import { jsonOk, jsonError } from "@/server/http";
import { signOut } from "@/server/auth";

export async function POST() {
  try {
    await signOut();
    return jsonOk({ success: true });
  } catch (err) {
    console.error("Sign out error:", err);
    return jsonError("Failed to sign out.", 500);
  }
}
