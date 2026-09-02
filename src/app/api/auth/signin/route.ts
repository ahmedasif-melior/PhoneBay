import { NextRequest } from "next/server";
import { jsonError, jsonOk } from "@/server/http";
import { signInSchema } from "@/server/validation";
import { usersRepo, toPublicUser } from "@/server/repositories/users";
import { verifyPassword, hashPassword, createSessionToken, setSessionCookie } from "@/server/auth";
import { getSupabase } from "@/server/supabase";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = signInSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Invalid sign in details.", 422, parsed.error.flatten());
  }

  const { email, password } = parsed.data;
  const normalizedEmail = email.trim().toLowerCase();
  const adminEmail = (process.env.ADMIN_EMAIL ?? "ahmed.asif@devsatmelior.com").trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD ?? "PhoneBayAdmin!2026";

  if (normalizedEmail === adminEmail && password === adminPassword) {
    let adminUser = usersRepo.findByEmail(adminEmail);
    if (!adminUser) {
      adminUser = usersRepo.create({
        email: adminEmail,
        passwordHash: await hashPassword(adminPassword),
        fullName: "PhoneBay Admin",
        role: "ADMIN",
        accountPurpose: "both",
      });
    } else if (adminUser.role !== "ADMIN") {
      adminUser = usersRepo.update(adminUser.id, {
        fullName: "PhoneBay Admin",
        accountPurpose: "both",
      }) ?? adminUser;
    }

    const token = await createSessionToken({ sub: adminUser.id, role: "ADMIN", email: adminUser.email });
    await setSessionCookie(token);
    return jsonOk({ user: toPublicUser(adminUser) });
  }

  const supabase = getSupabase();
  let user = usersRepo.findByEmail(normalizedEmail);
  if (supabase) {
    const { data, error } = await supabase.auth.signInWithPassword({ email: normalizedEmail, password });
    if (error || !data.user) return jsonError("Incorrect email or password.", 401);
    if (!user) {
      user = usersRepo.create({
        email: normalizedEmail,
        fullName: data.user.user_metadata?.full_name ?? data.user.user_metadata?.name ?? normalizedEmail.split("@")[0],
        passwordHash: await hashPassword(`supabase:${crypto.randomUUID()}`),
      });
    }
  } else if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return jsonError("Incorrect email or password.", 401);
  }

  const token = await createSessionToken({ sub: user.id, role: user.role, email: user.email });
  await setSessionCookie(token);

  return jsonOk({ user: toPublicUser(user) });
}
