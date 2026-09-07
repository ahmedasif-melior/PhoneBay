import { jsonError, jsonOk, requireUser, isAuthError } from "@/server/http";
import { listingsRepo } from "@/server/repositories/listings";
import { ordersRepo } from "@/server/repositories/orders";
import { getDb } from "@/server/db";

export async function GET() {
  try {
    const { user } = await requireUser();

    const [listingCounts, orders, savedResult, recentListings] = await Promise.all([
      listingsRepo.countBySeller(user.id),
      ordersRepo.listByBuyer(user.id),
      getDb().from("saved_listings").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      listingsRepo.list({ sellerId: user.id, status: undefined, sort: "newest" }),
    ]);

    return jsonOk({
      activeListings: listingCounts.active,
      savedPhones: savedResult.count ?? 0,
      orders: orders.length,
      trustScore: user.trustScore,
      recentListing: recentListings[0] ?? null,
    });
  } catch (err) {
    if (isAuthError(err)) return jsonError(err.message, 401);
    throw err;
  }
}
