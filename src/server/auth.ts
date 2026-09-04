import { getSupabaseServer } from "@/server/supabase";

/**
 * Represents the authenticated Supabase Auth user.
 */
export interface SessionPayload {
  userId: string;
  email: string;
}

/**
 * Gets the current authenticated Supabase Auth user.
 *
 * Uses getUser() so the server validates the current Auth user
 * instead of trusting a potentially stale session object.
 */
export async function getSession(): Promise<SessionPayload | null> {
  try {
    const supabase = await getSupabaseServer();

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }

    return {
      userId: user.id,
      email: user.email || "",
    };
  } catch (error) {
    console.error("[AUTH] getSession failed:", error);
    return null;
  }
}

/**
 * Signs out of Supabase Auth.
 */
export async function signOut(): Promise<void> {
  try {
    const supabase = await getSupabaseServer();
    await supabase.auth.signOut();
  } catch (error) {
    console.error("[AUTH] signOut failed:", error);
  }
}