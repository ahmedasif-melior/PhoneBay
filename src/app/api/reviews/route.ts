import { NextRequest } from "next/server";
import { jsonError, jsonOk, requireUser, isAuthError } from "@/server/http";
import { reviewsRepo } from "@/server/repositories/reviews";
import { z } from "zod";

const createReviewSchema = z.object({
  targetSellerId: z.string().min(1),
  listingId: z.string().optional().nullable(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().min(3).max(1000),
});

export async function GET(req: NextRequest) {
  const sellerId = req.nextUrl.searchParams.get("sellerId");
  if (!sellerId) return jsonError("sellerId query parameter is required.", 400);

  const reviews = await reviewsRepo.listForSeller(sellerId);
  const summary = await reviewsRepo.averageForSeller(sellerId);
  return jsonOk({ reviews, summary });
}

export async function POST(req: NextRequest) {
  try {
    const { user } = await requireUser();

    const body = await req.json().catch(() => null);
    const parsed = createReviewSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError("Invalid review.", 422, parsed.error.flatten());
    }
    if (parsed.data.targetSellerId === user.id) {
      return jsonError("You can't review yourself.", 400);
    }

    const review = await reviewsRepo.create({ authorId: user.id, ...parsed.data });
    return jsonOk({ review }, 201);
  } catch (err) {
    if (isAuthError(err)) return jsonError(err.message, 401);
    throw err;
  }
}
