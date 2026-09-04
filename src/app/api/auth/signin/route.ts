import { NextRequest } from "next/server";

import { jsonError, jsonOk } from "@/server/http";
import { signInSchema } from "@/server/validation";
import {
  usersRepo,
  toPublicUser,
} from "@/server/repositories/users";
import { getSupabaseServer } from "@/server/supabase";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    const parsed = signInSchema.safeParse(body);

    if (!parsed.success) {
      return jsonError(
        "Invalid sign in details.",
        422,
        parsed.error.flatten(),
      );
    }

    const { email, password } = parsed.data;
    const normalizedEmail = email.trim().toLowerCase();

    const supabase = await getSupabaseServer();

    /*
     * Authenticate with Supabase Auth.
     *
     * signInWithPassword() also establishes the SSR session,
     * and @supabase/ssr writes the session cookies through
     * the cookies adapter above.
     */
    const { data, error } =
      await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

    if (error || !data.user) {
      console.error(
        "Supabase sign-in failed:",
        error?.message,
      );

      return jsonError(
        "Incorrect email or password.",
        401,
      );
    }

    /*
     * IMPORTANT:
     * public.users.id must equal auth.users.id.
     *
     * We never create the profile during sign-in.
     * The database trigger creates it when the Auth user
     * is originally created.
     */
    const user = await usersRepo.findById(data.user.id);

    if (!user) {
      console.error(
        "PUBLIC USER PROFILE NOT FOUND FOR AUTH USER:",
        data.user.id,
      );

      await supabase.auth.signOut();

      return jsonError(
        "Your account profile could not be found. Please contact support.",
        500,
      );
    }

    /*
     * Blocked users cannot continue.
     */
    if (user.isBlocked) {
      await supabase.auth.signOut();

      return jsonError(
        "Your account is blocked.",
        403,
      );
    }

    /*
     * Return the authenticated application user.
     *
     * The actual Supabase Auth session is stored in the
     * SSR cookies by @supabase/ssr.
     */
    return jsonOk({
      user: toPublicUser(user),
    });
  } catch (error) {
    console.error("Sign-in route error:", error);

    return jsonError(
      "Unable to sign in. Please try again.",
      500,
    );
  }
}