import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

function configured(value: string | undefined): value is string {
  return Boolean(
    value &&
      !value.includes("your-") &&
      !value.includes("..."),
  );
}

/**
 * Browser Supabase client for Realtime.
 *
 * Uses NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY only.
 * Uses @supabase/ssr createBrowserClient to automatically read and synchronize
 * authentication cookies set by server-side sign-in.
 *
 * Safe to use in client-side code.
 */
let instance: SupabaseClient | null = null;

export function getSupabaseBrowserClient(): SupabaseClient {
  if (instance) {
    return instance;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!configured(url) || !configured(key)) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
    );
  }

  instance = createBrowserClient(url, key, {
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  });

  return instance;
}
