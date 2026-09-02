import { NextResponse } from "next/server";
import { getSessionFromCookies, type SessionPayload } from "@/server/auth";
import { usersRepo } from "@/server/repositories/users";
import type { UserRecord } from "@/server/types";

export function jsonError(message: string, status = 400, details?: unknown) {
  return NextResponse.json({ error: message, details }, { status });
}

export function jsonOk<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

/**
 * Role checking utilities
 */
export function isAdminRole(role?: string | null): boolean {
  return role === "ADMIN";
}

export function isShopRole(role?: string | null): boolean {
  return role === "SHOP";
}

export function isUserRole(role?: string | null): boolean {
  return role === "USER";
}

/**
 * Resolves the current session and full user record, or returns null if
 * unauthenticated. Use in route handlers that allow both guest and signed-in
 * behaviour.
 */
export async function getCurrentUser(): Promise<UserRecord | null> {
  const session = await getSessionFromCookies();
  if (!session) return null;
  const user = usersRepo.findById(session.sub);
  // Prevent operations with blocked users
  if (user?.isBlocked) return null;
  return user;
}

/**
 * Resolves the current session and throws a formatted 401 response (via a
 * thrown NextResponse) if the request is unauthenticated. Use at the top of
 * route handlers that require auth: `const user = await requireUser();`
 */
export async function requireUser(): Promise<{ session: SessionPayload; user: UserRecord }> {
  const session = await getSessionFromCookies();
  if (!session) {
    throw new AuthError("Sign in required.");
  }
  const user = usersRepo.findById(session.sub);
  if (!user) {
    throw new AuthError("Session is no longer valid.");
  }
  if (user.isBlocked) {
    throw new AuthError(`Your account is blocked: ${user.blockedReason || "No reason provided"}`);
  }
  return { session, user };
}

/**
 * Requires authenticated user with ADMIN role
 */
export async function requireAdmin(): Promise<{ session: SessionPayload; user: UserRecord }> {
  const { session, user } = await requireUser();
  if (!isAdminRole(user.role)) {
    throw new AuthError("Admin access required.");
  }
  return { session, user };
}

/**
 * Requires authenticated user with SHOP role
 */
export async function requireShop(): Promise<{ session: SessionPayload; user: UserRecord }> {
  const { session, user } = await requireUser();
  if (!isShopRole(user.role)) {
    throw new AuthError("Shop account required.");
  }
  return { session, user };
}

export class AuthError extends Error {}

export function isAuthError(err: unknown): err is AuthError {
  return err instanceof AuthError;
}
