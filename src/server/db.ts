import { createClient, type SupabaseClient } from "@supabase/supabase-js";

function configured(value: string | undefined): value is string {
  return Boolean(
    value &&
      !value.includes("your-") &&
      !value.includes("..."),
  );
}

function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!configured(url) || !configured(key)) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
    );
  }

  return { url, key };
}

/**
 * Public Supabase client.
 *
 * Uses the publishable key and therefore respects RLS.
 *
 * IMPORTANT:
 * This client does NOT automatically inherit the authenticated
 * user's server-side session/cookies.
 *
 * Therefore, server-side queries that rely on:
 *
 *   auth.uid()
 *
 * should NOT use this client unless an authenticated access token
 * is explicitly attached to the client.
 *
 * For protected server operations that already call requireUser(),
 * use getAdminDb() after performing the application's authorization
 * checks.
 */
export function getDb(): SupabaseClient {
  const { url, key } = getSupabaseConfig();

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Backwards-compatible database export.
 *
 * Existing application code imports:
 *
 *   import { db } from "@/server/db";
 *
 * Keep this export while the application is being migrated.
 *
 * IMPORTANT:
 * This client uses the public/publishable key and is subject to RLS.
 *
 * It is NOT request-aware and does not automatically contain the
 * currently authenticated user's Supabase access token.
 *
 * Do not use this client for protected server operations that expect
 * auth.uid() to identify the current user.
 */
export const db = getDb();

/**
 * Server-only Supabase client.
 *
 * Uses SUPABASE_SECRET_KEY and bypasses RLS.
 *
 * IMPORTANT:
 * Because this client bypasses RLS, callers MUST perform their own
 * authentication and authorization checks before using it.
 *
 * Typical usage:
 *
 *   const { user } = await requireUser();
 *   const db = getAdminDb();
 *
 *   await db
 *     .from("saved_items")
 *     .insert({
 *       user_id: user.id,
 *       ...
 *     });
 *
 * NEVER expose this client or the secret key to browser/client code.
 */
export function getAdminDb(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;

  if (!configured(url)) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL.",
    );
  }

  if (!configured(secretKey)) {
    throw new Error(
      "Supabase server secret is not configured. Set SUPABASE_SECRET_KEY in .env.local.",
    );
  }

  return createClient(url, secretKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Generate an application ID for entities that still use string IDs.
 *
 * User IDs should NOT use this function.
 * Supabase Auth user IDs are UUIDs from auth.users.id.
 */
export function generateId(prefix = ""): string {
  return `${prefix}${Date.now().toString(36)}${crypto
    .randomUUID()
    .replace(/-/g, "")
    .slice(0, 12)}`;
}

export async function queryRows<T>(
  query: PromiseLike<{
    data: T[] | null;
    error: { message: string } | null;
  }>,
): Promise<T[]> {
  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function queryOne<T>(
  query: PromiseLike<{
    data: T | null;
    error: { message: string } | null;
  }>,
): Promise<T | null> {
  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return data;
}