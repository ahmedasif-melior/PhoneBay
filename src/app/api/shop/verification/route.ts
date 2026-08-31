import { jsonError, jsonOk, requireUser, isAuthError } from "@/server/http";
import { verificationRepo } from "@/server/repositories/verification";
import { listingsRepo } from "@/server/repositories/listings";

export async function GET() {
  try {
    const { user } = await requireUser();
    if (user.role !== "SHOP" && user.role !== "ADMIN") {
      return jsonError("Only shop accounts can view the verification queue.", 403);
    }

    const requests = verificationRepo.listPending();
    const withListings = requests.map((r) => ({
      ...r,
      listing: listingsRepo.findById(r.listingId),
    }));

    return jsonOk({ requests: withListings });
  } catch (err) {
    if (isAuthError(err)) return jsonError(err.message, 401);
    throw err;
  }
}
