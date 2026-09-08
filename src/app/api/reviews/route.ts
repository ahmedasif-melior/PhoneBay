import { NextRequest } from "next/server";
import { getAdminDb, generateId } from "@/server/db";
import { jsonError, jsonOk, requireUser, isAuthError } from "@/server/http";
import { z } from "zod";

const createReviewSchema = z.object({
  listingId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().min(3).max(1000),
});

export async function GET(req: NextRequest) {
  const sellerId = req.nextUrl.searchParams.get("sellerId");
  if (!sellerId) return jsonError("sellerId query parameter is required.", 400);

  const db = getAdminDb();
  const { data, error } = await db
    .from("reviews")
    .select("id, listing_id, reviewer_id, reviewed_user_id, rating, comment, created_at")
    .eq("reviewed_user_id", sellerId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);

  const reviews = (data ?? []).map((review) => ({
    id: review.id,
    authorId: review.reviewer_id,
    targetSellerId: review.reviewed_user_id,
    listingId: review.listing_id,
    rating: review.rating,
    comment: review.comment,
    createdAt: review.created_at,
  }));
  const count = reviews.length;
  const average = count ? reviews.reduce((sum, review) => sum + review.rating, 0) / count : 0;
  return jsonOk({ reviews, summary: { average, count } });
}

export async function POST(req: NextRequest) {
  try {
    const { user } = await requireUser();
    const parsed = createReviewSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return jsonError("Invalid review.", 422, parsed.error.flatten());

    const db = getAdminDb();
    const { data: order, error: orderError } = await db
      .from("orders")
      .select("id, seller_id")
      .eq("listing_id", parsed.data.listingId)
      .eq("buyer_id", user.id)
      .eq("status", "delivered")
      .maybeSingle();
    if (orderError) throw new Error(orderError.message);
    if (!order) return jsonError("A delivered purchase is required before you can review this listing.", 403);

    const { data: existing, error: existingError } = await db
      .from("reviews")
      .select("id")
      .eq("listing_id", parsed.data.listingId)
      .eq("reviewer_id", user.id)
      .maybeSingle();
    if (existingError) throw new Error(existingError.message);
    if (existing) return jsonError("You have already reviewed this purchase.", 409);

    const { data: review, error: createError } = await db
      .from("reviews")
      .insert({
        id: generateId("rev_"),
        listing_id: parsed.data.listingId,
        reviewer_id: user.id,
        reviewed_user_id: order.seller_id,
        rating: parsed.data.rating,
        comment: parsed.data.comment,
      })
      .select()
      .single();
    if (createError) throw new Error(createError.message);

    return jsonOk({ review }, 201);
  } catch (err) {
    if (isAuthError(err)) return jsonError(err.message, 401);
    throw err;
  }
}
