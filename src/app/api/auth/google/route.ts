import { NextRequest, NextResponse } from "next/server";
import { getSupabase, getSupabaseRedirectUrl } from "@/server/supabase";

export async function GET(request: NextRequest) {
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: "Google sign in is not configured." }, { status: 503 });
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: getSupabaseRedirectUrl(request.url) },
  });
  if (error || !data.url) {
    return NextResponse.json({ error: error?.message ?? "Unable to start Google sign in." }, { status: 502 });
  }
  return NextResponse.redirect(data.url);
}