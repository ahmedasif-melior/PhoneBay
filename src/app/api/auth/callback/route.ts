import { NextRequest, NextResponse } from "next/server";
import { usersRepo } from "@/server/repositories/users";
import { getSupabaseServer } from "@/server/supabase";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(new URL("/user/sign-in?error=oauth", request.url));
  }

  const supabase = await getSupabaseServer();

  // Exchange code for session
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  const email = data.user?.email;
  const userId = data.user?.id;

  if (error || !email || !userId) {
    return NextResponse.redirect(new URL("/user/sign-in?error=oauth", request.url));
  }

  // Check if user profile exists in public.users
  let user = await usersRepo.findById(userId);

  if (!user) {
    // Create user profile using UUID from auth.users
    user = await usersRepo.create({
      id: userId,
      email,
      fullName:
        data.user.user_metadata?.full_name ??
        data.user.user_metadata?.name ??
        email.split("@")[0],
    });
  }

  // Redirect to appropriate dashboard based on role
  const redirectPath =
    user.role === "ADMIN"
      ? "/dashboard/admin"
      : user.role === "SHOP"
        ? "/shop/dashboard"
        : "/dashboard";

  return NextResponse.redirect(new URL(redirectPath, request.url));
}