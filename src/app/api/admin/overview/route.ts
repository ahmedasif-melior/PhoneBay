import { getAdminDb } from "@/server/db";
import { jsonError, jsonOk, requireUser, isAdminRole } from "@/server/http";
import { listingsRepo } from "@/server/repositories/listings";

export async function GET() {
  try {
    const { user } = await requireUser();
    if (!isAdminRole(user.role)) {
      return jsonError("Admin access required.", 403);
    }

    const db = getAdminDb();
    const [
      usersCount, listingsCount, activeCount, ordersCount,
      pendingCount, ordersResult, recentListings,
    ] = await Promise.all([
      db.from("users").select("id", { count: "exact", head: true }),
      db.from("listings").select("id", { count: "exact", head: true }),
      db.from("listings").select("id", { count: "exact", head: true }).eq("status", "active"),
      db.from("orders").select("id", { count: "exact", head: true }),
      db.from("verification_requests").select("id", { count: "exact", head: true }).neq("status", "completed"),
      db.from("orders").select("price"),
      listingsRepo.list({ sort: "newest" }),
    ]);

    const stats = {
      totalUsers: usersCount.count ?? 0,
      totalListings: listingsCount.count ?? 0,
      activeListings: activeCount.count ?? 0,
      totalOrders: ordersCount.count ?? 0,
      pendingVerification: pendingCount.count ?? 0,
      revenue: (ordersResult.data ?? []).reduce((sum, order) => sum + Number(order.price ?? 0), 0),
    };

    const [recentOrdersResult, recentUsersResult] = await Promise.all([
      db.from("orders")
        .select("id, status, created_at, price, listings(model), buyer:buyer_id(full_name), seller:listings(seller_id, users(full_name))")
        .order("created_at", { ascending: false })
        .limit(8),
      db.from("users")
        .select("id, full_name, email, role, trust_score, created_at")
        .order("created_at", { ascending: false })
        .limit(8),
    ]);

    return jsonOk({
      stats,
      recentListings: recentListings.slice(0, 6),
      recentOrders: recentOrdersResult.data ?? [],
      recentUsers: recentUsersResult.data ?? [],
    });
  } catch (err) {
    if (err instanceof Error) return jsonError(err.message, 500);
    throw err;
  }
}
