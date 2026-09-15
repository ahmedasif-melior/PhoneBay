import { NextRequest } from "next/server";

import { jsonError, jsonOk, requireUser, isAuthError } from "@/server/http";
import { convertToShopSchema } from "@/server/validation";
import { usersRepo, toPublicUser } from "@/server/repositories/users";
import { shopsRepo } from "@/server/repositories/shops";

/**
 * Lets an existing, signed-in USER account convert itself into a SHOP
 * account: creates the public.shops row (owner_id = current user),
 * links users.shop_id, and flips role/account_purpose to SHOP/shop.
 *
 * Admin accounts and accounts that are already a shop are rejected —
 * an account can only own one shop (shops.owner_id is unique).
 */
export async function POST(req: NextRequest) {
  try {
    const { user } = await requireUser();

    if (user.role === "SHOP") {
      return jsonError("Your account is already a shop.", 409);
    }

    if (user.role === "ADMIN") {
      return jsonError("Admin accounts can't be converted to a shop.", 409);
    }

    const existingShop = await shopsRepo.findByOwnerId(user.id);
    if (existingShop) {
      return jsonError("A shop is already linked to your account.", 409);
    }

    const body = await req.json().catch(() => null);
    const parsed = convertToShopSchema.safeParse(body);

    if (!parsed.success) {
      return jsonError("Invalid shop details.", 422, parsed.error.flatten());
    }

    const { shopName, shopEmail, city, shopType, services } = parsed.data;

    const shop = await shopsRepo.create({
      ownerId: user.id,
      shopName,
      shopEmail: shopEmail ?? user.email,
      city: city ?? user.city ?? null,
      shopType,
      services: services ?? "",
    });

    const updatedUser = await usersRepo.update(user.id, {
      role: "SHOP",
      accountPurpose: "shop",
      shopId: shop.id,
    });

    if (!updatedUser) {
      return jsonError("Unable to update your account role.", 500);
    }

    return jsonOk({
      user: toPublicUser(updatedUser),
      shop,
    });
  } catch (err) {
    if (isAuthError(err)) return jsonError(err.message, 401);
    console.error("[SHOP_CONVERT] Fatal error:", err);
    return jsonError("Unable to convert your account to a shop. Please try again.", 500);
  }
}
