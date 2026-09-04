import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },

        setAll(cookiesToSet) {
          cookiesToSet.forEach(
            ({ name, value }) => {
              request.cookies.set(name, value);
            },
          );

          response = NextResponse.next({
            request,
          });

          cookiesToSet.forEach(
            ({ name, value, options }) => {
              response.cookies.set(
                name,
                value,
                options,
              );
            },
          );
        },
      },
    },
  );

  /*
   * IMPORTANT:
   * getUser() validates the Auth user against Supabase
   * and allows the SSR client to refresh the session.
   */
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  const publicRoutes = [
    "/",
    "/user/sign-in",
    "/user/sign-up",
    "/shop/sign-in",
    "/shop/sign-up",
    "/admin/sign-in",
    "/api/auth/signin",
    "/api/auth/signup",
    "/api/auth/callback",
    "/api/auth/signout",
  ];

  const isPublicRoute = publicRoutes.some(
    (route) =>
      pathname === route ||
      pathname.startsWith(`${route}/`),
  );

  /*
   * Public pages don't require authentication.
   */
  if (isPublicRoute) {
    return response;
  }

  /*
   * Protected areas.
   */
  const isProtectedRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/shop/dashboard") ||
    pathname.startsWith("/admin");

  if (isProtectedRoute && !authUser) {
    return NextResponse.redirect(
      new URL("/user/sign-in", request.url),
    );
  }

  /*
   * Nothing else to protect.
   */
  if (!authUser) {
    return response;
  }

  /*
   * Load the application profile.
   *
   * This query uses the normal publishable-key client,
   * so it is subject to RLS.
   */
  const {
    data: profile,
    error: profileError,
  } = await supabase
    .from("users")
    .select("id, role, is_blocked")
    .eq("id", authUser.id)
    .maybeSingle();

  if (profileError) {
    console.error(
      "Proxy: unable to load public.users profile:",
      profileError.message,
    );

    return response;
  }

  /*
   * Blocked account.
   */
  if (profile?.is_blocked) {
    return NextResponse.redirect(
      new URL(
        "/user/sign-in?error=blocked",
        request.url,
      ),
    );
  }

  const role = profile?.role;

  /*
   * USER permissions.
   */
  if (role === "USER") {
    if (
      pathname.startsWith("/dashboard/admin") ||
      pathname.startsWith("/dashboard/shop") ||
      pathname.startsWith("/shop/dashboard") ||
      pathname.startsWith("/admin")
    ) {
      return NextResponse.redirect(
        new URL("/dashboard", request.url),
      );
    }
  }

  /*
   * SHOP permissions.
   */
  if (role === "SHOP") {
    if (
      pathname.startsWith("/dashboard/admin") ||
      pathname.startsWith("/admin")
    ) {
      return NextResponse.redirect(
        new URL("/shop/dashboard", request.url),
      );
    }

    if (
      pathname === "/dashboard" ||
      pathname.startsWith("/dashboard/")
    ) {
      return NextResponse.redirect(
        new URL("/shop/dashboard", request.url),
      );
    }
  }

  /*
   * ADMIN permissions.
   */
  if (role === "ADMIN") {
    if (
      pathname.startsWith("/dashboard/shop") ||
      pathname.startsWith("/dashboard/user") ||
      pathname === "/dashboard" ||
      pathname.startsWith("/shop/dashboard")
    ) {
      return NextResponse.redirect(
        new URL("/admin", request.url),
      );
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
};