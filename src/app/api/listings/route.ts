import { NextRequest } from "next/server";
import { jsonError, jsonOk, requireUser, isAuthError } from "@/server/http";
import { createListingSchema } from "@/server/validation";
import { listingsRepo, type ListingFilters } from "@/server/repositories/listings";
import { verificationRepo } from "@/server/repositories/verification";
import type { ListingStatus } from "@/server/types";

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const statusParam = params.get("status");

  const filters: ListingFilters = {
    q: params.get("q") ?? undefined,
    brands: params.get("brands")?.split(",").filter(Boolean),
    conditions: params.get("conditions")?.split(",").filter(Boolean),
    cities: params.get("cities")?.split(",").filter(Boolean),
    verifiedOnly: params.get("verifiedOnly") === "true",
    maxPrice: params.get("maxPrice") ? Number(params.get("maxPrice")) : undefined,
    sellerId: params.get("sellerId") ?? undefined,
    sort: (params.get("sort") as ListingFilters["sort"]) ?? "recommended",
    status: statusParam ? (statusParam.split(",") as ListingStatus[]) : ["active"],
  };

  const listings = listingsRepo.list(filters);
  return jsonOk({ listings, count: listings.length });
}

export async function POST(req: NextRequest) {
  try {
    const { user } = await requireUser();

    const body = await req.json().catch(() => null);
    const parsed = createListingSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError("Invalid listing details.", 422, parsed.error.flatten());
    }

    const { requestVerification, ...listingInput } = parsed.data;

    const listing = listingsRepo.create({
      sellerId: user.id,
      ...listingInput,
      status: "active",
    });

    if (requestVerification) {
      verificationRepo.create(listing.id);
    }

    return jsonOk({ listing }, 201);
  } catch (err) {
    if (isAuthError(err)) return jsonError(err.message, 401);
    throw err;
  }
}
