import { createClient, type SupabaseClient } from "@supabase/supabase-js";

function getConfig() {
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    publishableKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  };
}

function isConfigured(value: string | undefined): value is string {
  return Boolean(value && !value.includes("your-") && !value.includes("..."));
}

function isServiceRoleKey(value: string): boolean {
  if (value.startsWith("sb_secret_")) return true;
  const payload = value.split(".")[1];
  if (!payload) return false;
  try {
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(payload.length / 4) * 4, "=");
    return JSON.parse(Buffer.from(normalized, "base64url").toString("utf8")).role === "service_role";
  } catch {
    return false;
  }
}

export function getSupabase(): SupabaseClient | null {
  const { url, publishableKey: key } = getConfig();
  if (!isConfigured(url) || !isConfigured(key)) return null;
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export function getSupabaseRedirectUrl(requestUrl: string): string {
  return process.env.SUPABASE_REDIRECT_URL ?? new URL("/api/auth/callback", requestUrl).toString();
}
