import { NextRequest } from "next/server";

import {
  jsonError,
  jsonOk,
  requireUser,
  isAuthError,
} from "@/server/http";

import { createListingSchema } from "@/server/validation";

import {
  listingsRepo,
  type ListingFilters,
} from "@/server/repositories/listings";

import type { ListingStatus } from "@/server/types";

export async function GET(req: NextRequest) {
  try {
    const params = req.nextUrl.searchParams;
    const statusParam = params.get("status");

    const minPriceParam = params.get("minPrice");
    const maxPriceParam = params.get("maxPrice");

    const filters: ListingFilters = {
      q: params.get("q") ?? undefined,

      brands: params.get("brands")?.split(",").filter(Boolean),

      conditions: params.get("conditions")?.split(",").filter(Boolean),

      cities: params.get("cities")?.split(",").filter(Boolean),

      verifiedOnly: params.get("verifiedOnly") === "true",

      minPrice:
        minPriceParam !== null && minPriceParam !== ""
          ? Number(minPriceParam)
          : undefined,

      maxPrice:
        maxPriceParam !== null && maxPriceParam !== ""
          ? Number(maxPriceParam)
          : undefined,

      sellerId: params.get("sellerId") ?? undefined,

      sort:
        (params.get("sort") as ListingFilters["sort"]) ??
        "recommended",

      status: statusParam
        ? (statusParam.split(",") as ListingStatus[])
        : ["active"],
    };

    const listings = await listingsRepo.list(filters);

    return jsonOk({
      listings,
      count: listings.length,
    });
  } catch (err) {
    console.error("GET /api/listings failed:", err);

    return jsonError(
      err instanceof Error ? err.message : "Failed to load listings.",
      500,
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user } = await requireUser();

    const body = await req.json().catch(() => null);

    const parsed = createListingSchema.safeParse(body);

    if (!parsed.success) {
      return jsonError(
        "Invalid listing details.",
        422,
        parsed.error.flatten(),
      );
    }

    const { requestVerification: _requestVerification, ...listingInput } =
      parsed.data;

    const listing = await listingsRepo.create({
      sellerId: user.id,
      ...listingInput,
      status: "active",
    });

    return jsonOk(
      {
        listing,
        verification: null,
      },
      201,
    );
  } catch (err) {
    console.error("POST /api/listings failed:", err);

    if (isAuthError(err)) {
      return jsonError(err.message, 401);
    }

    return jsonError(
      err instanceof Error ? err.message : "Failed to create listing.",
      500,
    );
  }
}