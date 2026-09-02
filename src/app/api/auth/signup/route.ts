import { NextRequest } from "next/server";
import { jsonError, jsonOk } from "@/server/http";
import { signUpSchema } from "@/server/validation";
import { usersRepo, toPublicUser } from "@/server/repositories/users";
import { shopsRepo } from "@/server/repositories/shops";
import { hashPassword, createSessionToken, setSessionCookie } from "@/server/auth";
import { getSupabase, getSupabaseRedirectUrl } from "@/server/supabase";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = signUpSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Invalid sign up details.", 422, parsed.error.flatten());
  }

  const { fullName, email, phone, password, accountPurpose } = parsed.data;

  if (usersRepo.findByEmail(email)) {
    return jsonError("An account with this email already exists.", 409);
  }

  const supabase = getSupabase();
  if (supabase) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, phone: phone ?? null },
        emailRedirectTo: getSupabaseRedirectUrl(req.url),
      },
    });
    if (error || !data.user) return jsonError(error?.message ?? "Unable to create your account.", 400);

    const user = usersRepo.create({
      email,
      passwordHash: await hashPassword(`supabase:${crypto.randomUUID()}`),
      fullName,
      phone,
      role: accountPurpose === "shop" ? "SHOP" : "USER",
    });

    // If shop account, create shop profile
    if (accountPurpose === "shop") {
      const shopProfile = shopsRepo.create({
        shopName: fullName,
        shopEmail: email,
      });
      // Link user to shop
      usersRepo.update(user.id, { shopId: shopProfile.id });
    }

    if (!data.session) return jsonOk({ user: toPublicUser(user), requiresEmailVerification: true }, 201);
    const token = await createSessionToken({ sub: user.id, role: user.role, email: user.email });
    await setSessionCookie(token);
    return jsonOk({ user: toPublicUser(user) }, 201);
  }

  const passwordHash = await hashPassword(password);
  const user = usersRepo.create({
    email,
    passwordHash,
    fullName,
    phone,
    role: accountPurpose === "shop" ? "SHOP" : "USER",
  });

  // If shop account, create shop profile
  if (accountPurpose === "shop") {
    const shopProfile = shopsRepo.create({
      shopName: fullName,
      shopEmail: email,
    });
    // Link user to shop
    usersRepo.update(user.id, { shopId: shopProfile.id });
  }

  const token = await createSessionToken({ sub: user.id, role: user.role, email: user.email });
  await setSessionCookie(token);

  return jsonOk({ user: toPublicUser(user) }, 201);
}
