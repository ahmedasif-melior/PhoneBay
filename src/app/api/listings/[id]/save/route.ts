import { NextRequest } from "next/server";
import { db, generateId } from "@/server/db";
import { jsonError, jsonOk, requireUser, isAuthError } from "@/server/http";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { user } = await requireUser();

    const existing = db
      .prepare("SELECT id FROM saved_listings WHERE user_id = ? AND listing_id = ?")
      .get(user.id, id);

    if (existing) {
      db.prepare("DELETE FROM saved_listings WHERE user_id = ? AND listing_id = ?").run(user.id, id);
      return jsonOk({ saved: false });
    }

    db.prepare("INSERT INTO saved_listings (id, user_id, listing_id) VALUES (?, ?, ?)").run(
      generateId("sav_"),
      user.id,
      id
    );
    return jsonOk({ saved: true });
  } catch (err) {
    if (isAuthError(err)) return jsonError(err.message, 401);
    throw err;
  }
}
