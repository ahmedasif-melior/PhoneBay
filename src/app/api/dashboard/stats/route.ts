import { jsonError, jsonOk, requireUser, isAuthError } from "@/server/http";
import { listingsRepo } from "@/server/repositories/listings";
import { ordersRepo } from "@/server/repositories/orders";
import { db } from "@/server/db";

export async function GET() {
  try {
    const { user } = await requireUser();

    const listingCounts = listingsRepo.countBySeller(user.id);
    const orders = ordersRepo.listByBuyer(user.id);
    const savedCount = (
      db.prepare("SELECT COUNT(*) as count FROM saved_listings WHERE user_id = ?").get(user.id) as {
        count: number;
      }
    ).count;

    const recentListing = listingsRepo.list({ sellerId: user.id, status: undefined, sort: "newest" })[0] ?? null;

    return jsonOk({
      activeListings: listingCounts.active,
      savedPhones: savedCount,
      orders: orders.length,
      trustScore: user.trustScore,
      recentListing,
    });
  } catch (err) {
    if (isAuthError(err)) return jsonError(err.message, 401);
    throw err;
  }
}
