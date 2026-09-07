import { NextRequest } from "next/server";

import { jsonError, jsonOk } from "@/server/http";
import { signUpSchema } from "@/server/validation";
import { usersRepo, toPublicUser } from "@/server/repositories/users";
import { shopsRepo } from "@/server/repositories/shops";
import {
  getSupabaseServer,
  getSupabaseRedirectUrl,
} from "@/server/supabase";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    const parsed = signUpSchema.safeParse(body);

    if (!parsed.success) {
      return jsonError(
        "Invalid sign up details.",
        422,
        parsed.error.flatten(),
      );
    }

    const {
      fullName,
      email,
      phone,
      password,
      accountPurpose,
    } = parsed.data;

    const normalizedEmail = email.trim().toLowerCase();

    /*
     * Check whether the application profile already exists.
     */
    const existingUser = await usersRepo.findByEmail(normalizedEmail);

    if (existingUser) {
      return jsonError(
        "An account with this email already exists.",
        409,
      );
    }

    const supabase = await getSupabaseServer();

    /*
     * Supabase Auth is the source of truth for authentication.
     *
     * The database trigger:
     *
     * auth.users INSERT
     *        ↓
     * public.handle_new_user()
     *        ↓
     * public.users INSERT
     *
     * creates the public profile automatically.
     */
    const { data, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        data: {
          full_name: fullName,
          phone: phone ?? null,
        },
        emailRedirectTo: getSupabaseRedirectUrl(
          `${accountPurpose === "shop" ? "shop" : "user"}/verify-email`,
        ),
      },
    });

    if (error) {
      console.error(
        "[SIGNUP] Supabase Auth error:",
        error.message,
      );

      return jsonError(
        error.message || "Unable to create your account.",
        400,
      );
    }

    if (!data.user) {
      console.error("[SIGNUP] Supabase returned no user.");

      return jsonError(
        "Unable to create your account.",
        500,
      );
    }

    console.log("[SIGNUP] Auth user created:", data.user.id);

    /*
     * The Auth trigger should have created public.users.
     *
     * Fetch the profile rather than inserting it a second time.
     */
    let user = await usersRepo.findById(data.user.id);

    /*
     * In case the trigger/profile creation is not immediately
     * visible, perform a small number of retries.
     */
    if (!user) {
      for (let attempt = 1; attempt <= 3; attempt++) {
        await new Promise((resolve) =>
          setTimeout(resolve, 200 * attempt),
        );

        user = await usersRepo.findById(data.user.id);

        if (user) {
          break;
        }
      }
    }

    /*
     * If the trigger did not create the profile, don't create
     * a second Auth user or pretend signup succeeded.
     */
    if (!user) {
      console.error(
        "[SIGNUP] Auth user exists but public.users profile is missing:",
        data.user.id,
      );

      /*
       * Clean up the Auth user because signup did not complete
       * successfully at the application level.
       */
      try {
        await supabase.auth.signOut();
      } catch {
        // Ignore cleanup failure.
      }

      return jsonError(
        "Your account was created in authentication, but your profile could not be created. Please try again.",
        500,
      );
    }

    /*
     * Update profile fields that depend on the requested
     * account purpose.
     *
     * The Auth trigger creates the profile with role USER.
     * For a shop signup, change it to SHOP.
     */
    if (accountPurpose && accountPurpose !== "shop") {
      const updated = await usersRepo.update(user.id, {
        accountPurpose,
      });
      if (!updated) {
        return jsonError("Unable to save account purpose.", 500);
      }
      user = updated;
    }

    if (accountPurpose === "shop") {
      const roleUpdated = await usersRepo.update(user.id, {
        role: "SHOP",
        accountPurpose: "shop",
      });

      if (!roleUpdated) {
        return jsonError("Unable to update your account role.", 500);
      }

      user = roleUpdated;

      const shopProfile = await shopsRepo.create({
        shopName: fullName,
        shopEmail: normalizedEmail,
      });

      const linkedUser = await usersRepo.update(user.id, {
        shopId: shopProfile.id,
      });

      if (!linkedUser) {
        return jsonError("Unable to link your shop profile.", 500);
      }

      user = linkedUser;
    }

    const requiresEmailVerification = !data.session;

    console.log("[SIGNUP] Signup completed:", {
      userId: user.id,
      email: user.email,
      role: user.role,
      requiresEmailVerification,
    });

    return jsonOk(
      {
        user: toPublicUser(user),
        requiresEmailVerification,
      },
      201,
    );
  } catch (error) {
    console.error("[SIGNUP] Fatal error:", error);

    if (error instanceof Error) {
      console.error("[SIGNUP] Message:", error.message);
      console.error("[SIGNUP] Stack:", error.stack);
    }

    return jsonError(
      "Unable to create your account. Please try again.",
      500,
    );
  }
}