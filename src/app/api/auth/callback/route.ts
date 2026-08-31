import { NextRequest, NextResponse } from "next/server";
import { hashPassword, createSessionToken, setSessionCookie } from "@/server/auth";
import { usersRepo } from "@/server/repositories/users";
import { getSupabase } from "@/server/supabase";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const supabase = getSupabase();
  if (!code || !supabase) {
    return NextResponse.redirect(new URL("/auth/signin?error=oauth", request.url));
  }

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  const email = data.user?.email;
  if (error || !email) {
    return NextResponse.redirect(new URL("/auth/signin?error=oauth", request.url));
  }

  let user = usersRepo.findByEmail(email);
  if (!user) {
    user = usersRepo.create({
      email,
      fullName: data.user.user_metadata?.full_name ?? data.user.user_metadata?.name ?? email.split("@")[0],
      passwordHash: await hashPassword(`oauth:${crypto.randomUUID()}`),
    });
  }

  const token = await createSessionToken({ sub: user.id, role: user.role, email: user.email });
  await setSessionCookie(token);
  return NextResponse.redirect(new URL("/dashboard", request.url));
}