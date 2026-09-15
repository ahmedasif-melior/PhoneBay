import { NextRequest } from "next/server";
import { jsonError, jsonOk, requireAdmin, isAuthError } from "@/server/http";
import { shopsRepo } from "@/server/repositories/shops";
import { usersRepo } from "@/server/repositories/users";
import { listingsRepo } from "@/server/repositories/listings";
import { getAdminDb } from "@/server/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ shopId: string }> }
) {
  try {
    await requireAdmin();
    const { shopId } = await params;

    const shop = await shopsRepo.findById(shopId);
    if (!shop) return jsonError("Shop not found", 404);

    const db = getAdminDb();

    // Fetch owner, listings, and revenue in parallel
    const [owner, listings, revenueResult, verificationJobsResult] = await Promise.all([
      shop.ownerId ? usersRepo.findById(shop.ownerId) : Promise.resolve(null),
      listingsRepo.list({ sellerId: shop.ownerId ?? undefined }, true),
      db
        .from("orders")
        .select("price")
        .eq("seller_id", shop.ownerId ?? ""),
      db
        .from("verification_requests")
        .select("id, status, requested_at, score, listing_id")
        .order("requested_at", { ascending: false })
        .limit(20),
    ]);

    const revenue = (revenueResult.data ?? []).reduce(
      (sum: number, r: any) => sum + Number(r.price ?? 0),
      0
    );

    // Fetch listing names for verification jobs
    const jobListingIds = (verificationJobsResult.data ?? [])
      .map((v: any) => v.listing_id)
      .filter(Boolean);

    const jobListingMap = new Map<string, any>();
    if (jobListingIds.length > 0) {
      const { data: jl } = await db
        .from("listings")
        .select("id, brand, model")
        .in("id", jobListingIds);
      for (const l of jl ?? []) jobListingMap.set(l.id, l);
    }

    return jsonOk({
      shop,
      owner: owner
        ? {
            id: owner.id,
            fullName: owner.fullName,
            email: owner.email,
            phone: owner.phone,
            city: owner.city,
            trustScore: owner.trustScore,
            emailVerified: owner.emailVerified,
            phoneVerified: owner.phoneVerified,
            isBlocked: owner.isBlocked,
            createdAt: owner.createdAt,
          }
        : null,
      listings: listings.map((l) => ({
        id: l.id,
        brand: l.brand,
        model: l.model,
        price: l.price,
        status: l.status,
        condition: l.condition,
        city: l.city,
        verified: l.verified,
        createdAt: l.createdAt,
      })),
      stats: {
        totalListings: listings.length,
        activeListings: listings.filter((l) => l.status === "active").length,
        soldListings: listings.filter((l) => l.status === "sold").length,
        revenue,
        verificationJobs: (verificationJobsResult.data ?? []).length,
      },
      verificationJobs: (verificationJobsResult.data ?? []).map((v: any) => ({
        id: v.id,
        status: v.status,
        score: v.score,
        requestedAt: v.requested_at,
        listing: jobListingMap.get(v.listing_id) ?? null,
      })),
    });
  } catch (err) {
    if (isAuthError(err)) return jsonError(err.message, 401);
    throw err;
  }
}
