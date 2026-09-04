import { NextResponse } from "next/server";
import { getSession, type SessionPayload } from "@/server/auth";
import { usersRepo } from "@/server/repositories/users";
import type { UserRecord } from "@/server/types";

export function jsonError(
  message: string,
  status = 400,
  details?: unknown,
) {
  return NextResponse.json(
    {
      error: message,
      details,
    },
    { status },
  );
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
 * Resolves the current Supabase Auth user and the matching
 * public.users profile.
 *
 * Supabase Auth owns authentication/session state.
 * public.users stores the application's profile and role data.
 *
 * The session user ID is always the UUID from auth.users and
 * must match public.users.id.
 */
export async function getCurrentUser(): Promise<UserRecord | null> {
  try {
    const session = await getSession();

    if (!session) {
      return null;
    }

    const user = await usersRepo.findById(session.userId);

    if (!user) {
      return null;
    }

    // Blocked users are treated as unauthenticated by this helper.
    if (user.isBlocked) {
      return null;
    }

    return user;
  } catch (error) {
    console.error("[AUTH] getCurrentUser failed:", error);
    return null;
  }
}

/**
 * Requires an authenticated user.
 *
 * Throws AuthError when:
 * - there is no valid Supabase Auth session
 * - the public.users profile no longer exists
 * - the user is blocked
 */
export async function requireUser(): Promise<{
  session: SessionPayload;
  user: UserRecord;
}> {
  const session = await getSession();

  if (!session) {
    throw new AuthError("Sign in required.");
  }

  const user = await usersRepo.findById(session.userId);

  if (!user) {
    throw new AuthError("Session is no longer valid.");
  }

  if (user.isBlocked) {
    throw new AuthError(
      `Your account is blocked: ${
        user.blockedReason || "No reason provided"
      }`,
    );
  }

  return {
    session,
    user,
  };
}

/**
 * Requires authenticated user with ADMIN role.
 */
export async function requireAdmin(): Promise<{
  session: SessionPayload;
  user: UserRecord;
}> {
  const { session, user } = await requireUser();

  if (!isAdminRole(user.role)) {
    throw new AuthError("Admin access required.");
  }

  return {
    session,
    user,
  };
}

/**
 * Requires authenticated user with SHOP role.
 */
export async function requireShop(): Promise<{
  session: SessionPayload;
  user: UserRecord;
}> {
  const { session, user } = await requireUser();

  if (!isShopRole(user.role)) {
    throw new AuthError("Shop account required.");
  }

  return {
    session,
    user,
  };
}

/**
 * Authentication error used by protected server operations.
 */
export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}

/**
 * Checks whether an error is an AuthError.
 */
export function isAuthError(err: unknown): err is AuthError {
  return err instanceof AuthError;
}