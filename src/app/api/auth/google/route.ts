import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer, getSupabaseRedirectUrl } from "@/server/supabase";

export async function GET(request: NextRequest) {
  const supabase = getSupabaseServer();
  if (!supabase) {
    return NextResponse.json({ error: "Google sign in is not configured." }, { status: 503 });
  }

  const { data, error } = await (await supabase).auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: getSupabaseRedirectUrl(request.url) },
  });
  if (error || !data.url) {
    return NextResponse.json({ error: error?.message ?? "Unable to start Google sign in." }, { status: 502 });
  }
  return NextResponse.redirect(data.url);
}