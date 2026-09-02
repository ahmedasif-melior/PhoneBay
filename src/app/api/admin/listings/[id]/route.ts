import { NextRequest } from "next/server";
import { jsonError, jsonOk, requireUser, isAuthError, isAdminRole } from "@/server/http";
import { listingsRepo } from "@/server/repositories/listings";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user } = await requireUser();
    if (!isAdminRole(user.role)) return jsonError("Admin access required.", 403);

    const { id } = await params;
    const body = await req.json().catch(() => null);
    const status = typeof body?.status === "string" ? body.status : null;
    const note = typeof body?.note === "string" ? body.note.trim() : "";

    if (!status || !["active", "pending", "sold", "draft", "paused"].includes(status)) {
      return jsonError("A valid listing status is required.", 422);
    }

    const listing = listingsRepo.findById(id);
    if (!listing) return jsonError("Listing not found.", 404);
    if (listing.status === "sold" && status !== "sold") {
      return jsonError("Sold listings are locked and cannot have their status changed.", 409);
    }

    const updated = listingsRepo.update(id, { status: status as typeof listing.status });
    if (!updated) return jsonError("Unable to update listing.", 500);

    return jsonOk({ listing: updated, note: note || null });
  } catch (err) {
    if (isAuthError(err)) return jsonError(err.message, 401);
    throw err;
  }
}
