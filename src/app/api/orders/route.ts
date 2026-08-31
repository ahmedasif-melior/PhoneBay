import { NextRequest } from "next/server";
import { jsonError, jsonOk, requireUser, isAuthError } from "@/server/http";
import { createOrderSchema } from "@/server/validation";
import { ordersRepo } from "@/server/repositories/orders";
import { listingsRepo } from "@/server/repositories/listings";

export async function GET() {
  try {
    const { user } = await requireUser();
    const orders = ordersRepo.listByBuyer(user.id);
    return jsonOk({ orders });
  } catch (err) {
    if (isAuthError(err)) return jsonError(err.message, 401);
    throw err;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user } = await requireUser();

    const body = await req.json().catch(() => null);
    const parsed = createOrderSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError("Invalid order.", 422, parsed.error.flatten());
    }

    const listing = listingsRepo.findById(parsed.data.listingId);
    if (!listing) return jsonError("Listing not found.", 404);
    if (listing.status !== "active") return jsonError("This listing is no longer available.", 409);
    if (listing.sellerId === user.id) return jsonError("You can't buy your own listing.", 400);

    const order = ordersRepo.create({ listingId: listing.id, buyerId: user.id, price: listing.price });
    return jsonOk({ order }, 201);
  } catch (err) {
    if (isAuthError(err)) return jsonError(err.message, 401);
    throw err;
  }
}
