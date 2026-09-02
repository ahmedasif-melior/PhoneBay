import { db } from "@/server/db";
import { jsonError, jsonOk, requireUser, isAdminRole } from "@/server/http";
import { listingsRepo } from "@/server/repositories/listings";

export async function GET() {
  try {
    const { user } = await requireUser();
    if (!isAdminRole(user.role)) {
      return jsonError("Admin access required.", 403);
    }

    const stats = {
      totalUsers: (db.prepare("SELECT COUNT(*) as count FROM users").get() as { count: number }).count,
      totalListings: (db.prepare("SELECT COUNT(*) as count FROM listings").get() as { count: number }).count,
      activeListings: (db.prepare("SELECT COUNT(*) as count FROM listings WHERE status = 'active'").get() as { count: number }).count,
      totalOrders: (db.prepare("SELECT COUNT(*) as count FROM orders").get() as { count: number }).count,
      pendingVerification: (db.prepare("SELECT COUNT(*) as count FROM verification_requests WHERE status != 'completed'").get() as { count: number }).count,
      revenue: (db.prepare("SELECT COALESCE(SUM(price), 0) as total FROM orders").get() as { total: number }).total,
    };

    const recentListings = listingsRepo.list({ sort: "newest" }).slice(0, 6);
    const recentOrders = db.prepare(
      `SELECT o.id, o.status, o.created_at, o.price, l.model, u.full_name AS buyer, s.full_name AS seller
       FROM orders o
       JOIN listings l ON l.id = o.listing_id
       JOIN users u ON u.id = o.buyer_id
       JOIN users s ON s.id = l.seller_id
       ORDER BY o.created_at DESC LIMIT 8`
    ).all() as Array<{
      id: string;
      status: string;
      created_at: string;
      price: number;
      model: string;
      buyer: string;
      seller: string;
    }>;

    const recentUsers = db.prepare(
      `SELECT id, full_name, email, role, trust_score, created_at
       FROM users ORDER BY created_at DESC LIMIT 8`
    ).all() as Array<{
      id: string;
      full_name: string;
      email: string;
      role: string;
      trust_score: number;
      created_at: string;
    }>;

    return jsonOk({ stats, recentListings, recentOrders, recentUsers });
  } catch (err) {
    if (err instanceof Error && "message" in err && typeof err.message === "string") {
      return jsonError(err.message, 401);
    }
    throw err;
  }
}
