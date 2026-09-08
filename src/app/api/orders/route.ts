import { NextRequest } from "next/server";
import { getAdminDb, generateId } from "@/server/db";
import { jsonError, jsonOk, requireUser, isAuthError } from "@/server/http";
import { createOrderSchema } from "@/server/validation";

export async function POST(request: NextRequest) {
  try {
    const { user } = await requireUser();
    const parsed = createOrderSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return jsonError("Invalid order.", 422, parsed.error.flatten());

    const db = getAdminDb();
    const { data: listing, error: listingError } = await db
      .from("listings")
      .select("id, seller_id, price, status")
      .eq("id", parsed.data.listingId)
      .maybeSingle();
    if (listingError) throw new Error(listingError.message);
    if (!listing) return jsonError("Listing not found.", 404);
    if (listing.status !== "active") return jsonError("Listing is not available for purchase.", 409);
    if (listing.seller_id === user.id) return jsonError("You cannot purchase your own listing.", 400);

    const { data: order, error: orderError } = await db
      .from("orders")
      .insert({
        id: generateId("ord_"),
        listing_id: listing.id,
        buyer_id: user.id,
        seller_id: listing.seller_id,
        price: listing.price,
        status: "processing",
      })
      .select()
      .single();
    if (orderError) throw new Error(orderError.message);

    const { error: updateError } = await db.from("listings").update({ status: "sold" }).eq("id", listing.id);
    if (updateError) throw new Error(updateError.message);

    return jsonOk({ order }, 201);
  } catch (err) {
    if (isAuthError(err)) return jsonError(err.message, 401);
    throw err;
  }
}

export async function GET(request: NextRequest) {
  try {
    const { user } = await requireUser();
    const role = request.nextUrl.searchParams.get("role") === "seller" ? "seller" : "buyer";
    const db = getAdminDb();
    const query = db
      .from("orders")
      .select("id, listing_id, buyer_id, seller_id, price, status, created_at")
      .eq(role === "seller" ? "seller_id" : "buyer_id", user.id)
      .order("created_at", { ascending: false });
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return jsonOk({ orders: data ?? [] });
  } catch (err) {
    if (isAuthError(err)) return jsonError(err.message, 401);
    throw err;
  }
}
