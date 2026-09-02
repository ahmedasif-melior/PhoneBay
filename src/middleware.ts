import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookies } from "@/server/auth";
import { usersRepo } from "@/server/repositories/users";

/**
 * Middleware for enforcing user role isolation and preventing blocked users from accessing the app
 */
export async function middleware(request: NextRequest) {
  const session = await getSessionFromCookies();

  // If no session, allow access to public routes
  if (!session) {
    // Block access to protected routes
    if (request.nextUrl.pathname.startsWith("/dashboard")) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  // Get user from session
  const user = usersRepo.findById(session.sub);

  // Check if user is blocked
  if (user?.isBlocked) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // USER role isolation: Can only access /dashboard routes (not /admin or /shop)
  if (user?.role === "USER") {
    if (request.nextUrl.pathname.startsWith("/dashboard/admin") || request.nextUrl.pathname.startsWith("/dashboard/shop")) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // SHOP role: Can only access /dashboard/shop routes and their own shop endpoints
  if (user?.role === "SHOP") {
    if (request.nextUrl.pathname.startsWith("/dashboard/admin")) {
      return NextResponse.redirect(new URL("/dashboard/shop", request.url));
    }
  }

  // ADMIN role: Can access /dashboard/admin routes
  if (user?.role === "ADMIN") {
    if (request.nextUrl.pathname.startsWith("/dashboard/shop") && !request.nextUrl.pathname.includes("/admin")) {
      return NextResponse.redirect(new URL("/dashboard/admin", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
};
