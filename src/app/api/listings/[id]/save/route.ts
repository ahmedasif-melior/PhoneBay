import { NextRequest } from "next/server";
import { getAdminDb, generateId } from "@/server/db";
import {
  jsonError,
  jsonOk,
  requireUser,
  isAuthError,
} from "@/server/http";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { user } = await requireUser();

    const db = getAdminDb();

    const { data, error } = await db
      .from("saved_listings")
      .select("id")
      .eq("user_id", user.id)
      .eq("listing_id", id)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    return jsonOk({ saved: Boolean(data) });
  } catch (err) {
    if (isAuthError(err)) {
      return jsonError(err.message, 401);
    }

    throw err;
  }
}

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { user } = await requireUser();

    // requireUser() has already authenticated the request and verified
    // that this is a valid, non-blocked application user.
    //
    // getAdminDb() is used here because getDb() creates a publishable-key
    // client without the user's Supabase access token. Consequently,
    // auth.uid() is NULL when RLS evaluates the query.
    //
    // Since this route explicitly scopes every operation to user.id,
    // the server-side admin client is appropriate.
    const db = getAdminDb();

    const { data: existing, error: lookupError } = await db
      .from("saved_listings")
      .select("id")
      .eq("user_id", user.id)
      .eq("listing_id", id)
      .maybeSingle();

    if (lookupError) {
      throw new Error(lookupError.message);
    }

    if (existing) {
      const { error } = await db
        .from("saved_listings")
        .delete()
        .eq("user_id", user.id)
        .eq("listing_id", id);

      if (error) {
        throw new Error(error.message);
      }

      return jsonOk({ saved: false });
    }

    const { error } = await db.from("saved_listings").insert({
      id: generateId("sav_"),
      user_id: user.id,
      listing_id: id,
    });

    if (error) {
      throw new Error(error.message);
    }

    return jsonOk({ saved: true });
  } catch (err) {
    if (isAuthError(err)) {
      return jsonError(err.message, 401);
    }

    throw err;
  }
}