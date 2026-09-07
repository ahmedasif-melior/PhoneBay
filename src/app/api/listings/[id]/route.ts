import { NextRequest } from "next/server";
import { jsonError, jsonOk, requireUser, isAuthError, isAdminRole } from "@/server/http";
import { updateListingSchema } from "@/server/validation";
import { listingsRepo } from "@/server/repositories/listings";
import { certificateRepo } from "@/server/repositories/verification";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const listing = await listingsRepo.findById(id);
  if (!listing) return jsonError("Listing not found.", 404);

  listingsRepo.incrementViews(id);
  const certificate = await certificateRepo.findByListingId(id);

  return jsonOk({ listing: { ...listing, views: listing.views + 1 }, certificate });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { user } = await requireUser();

    const listing = await listingsRepo.findById(id);
    if (!listing) return jsonError("Listing not found.", 404);
    if (listing.sellerId !== user.id && !isAdminRole(user.role)) {
      return jsonError("You don't have permission to edit this listing.", 403);
    }

    const body = await req.json().catch(() => null);
    const parsed = updateListingSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError("Invalid update.", 422, parsed.error.flatten());
    }

    if (listing.status === "sold" && parsed.data.status && parsed.data.status !== "sold") {
      return jsonError("This item is sold and its status is locked.", 409);
    }

    const updated = await listingsRepo.update(id, parsed.data);
    return jsonOk({ listing: updated });
  } catch (err) {
    if (isAuthError(err)) return jsonError(err.message, 401);
    throw err;
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { user } = await requireUser();

    const listing = await listingsRepo.findById(id);
    if (!listing) return jsonError("Listing not found.", 404);
    if (listing.sellerId !== user.id && !isAdminRole(user.role)) {
      return jsonError("You don't have permission to delete this listing.", 403);
    }

    listingsRepo.delete(id);
    return jsonOk({ success: true });
  } catch (err) {
    if (isAuthError(err)) return jsonError(err.message, 401);
    throw err;
  }
}
