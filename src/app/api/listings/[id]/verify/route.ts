import { NextRequest } from "next/server";
import { jsonError, jsonOk, requireUser, isAuthError } from "@/server/http";
import { listingsRepo } from "@/server/repositories/listings";
import { verificationRepo } from "@/server/repositories/verification";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { user } = await requireUser();

    const listing = await listingsRepo.findById(id);
    if (!listing) return jsonError("Listing not found.", 404);
    if (listing.sellerId !== user.id) {
      return jsonError("Only the listing owner can request verification.", 403);
    }

    const existing = await verificationRepo.listByListing(id);
    if (existing.some((v) => v.status !== "completed")) {
      return jsonError("A verification request is already in progress for this listing.", 409);
    }

    const request = await verificationRepo.create(id);
    return jsonOk({ request }, 201);
  } catch (err) {
    if (isAuthError(err)) return jsonError(err.message, 401);
    throw err;
  }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const requests = await verificationRepo.listByListing(id);
  return jsonOk({ requests });
}
