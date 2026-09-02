import { NextRequest } from "next/server";
import { jsonError, jsonOk, requireAdmin, isAuthError } from "@/server/http";
import { shopsRepo } from "@/server/repositories/shops";
import { usersRepo } from "@/server/repositories/users";
import { auditLogsRepo } from "@/server/repositories/audit-logs";
import { z } from "zod";

const updateShopVerificationSchema = z.object({
  shopId: z.string().min(1),
  status: z.enum(["approved", "rejected"]),
  notes: z.string().optional(),
});

export async function GET() {
  try {
    const { user: adminUser } = await requireAdmin();

    // Fetch all shops with their pending status
    const shops = shopsRepo.findAll();

    return jsonOk({
      shops: shops.map((shop) => ({
        id: shop.id,
        shopName: shop.shopName,
        shopEmail: shop.shopEmail,
        verified: shop.verified,
        verificationStatus: shop.verificationStatus,
        services: shop.services,
        isActive: shop.isActive,
        createdAt: shop.createdAt,
        updatedAt: shop.updatedAt,
      })),
    });
  } catch (err) {
    if (isAuthError(err)) return jsonError(err.message, 401);
    throw err;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user: adminUser } = await requireAdmin();

    const body = await req.json().catch(() => null);
    const parsed = updateShopVerificationSchema.safeParse(body);

    if (!parsed.success) {
      return jsonError("Invalid shop verification details.", 422, parsed.error.flatten());
    }

    const { shopId, status, notes } = parsed.data;

    const shop = shopsRepo.findById(shopId);
    if (!shop) {
      return jsonError("Shop not found", 404);
    }

    // Update shop verification status
    const updatedShop = shopsRepo.updateVerificationStatus(shopId, status, adminUser.id, notes);

    // If approved, update associated users with SHOP role
    if (status === "approved") {
      const db = require("@/server/db").db as any;
      const shopUsers = db
        .prepare("SELECT * FROM users WHERE shop_id = ?")
        .all(shopId) as any[];

      for (const shopUser of shopUsers) {
        // User is already SHOP role from creation, just ensure shop_id is linked
        usersRepo.update(shopUser.id, {});
      }
    }

    auditLogsRepo.log({
      adminId: adminUser.id,
      action: status === "approved" ? "APPROVE_SHOP" : "REJECT_SHOP",
      entityType: "SHOP",
      entityId: shopId,
      changes: {
        status,
        notes,
      },
    });

    return jsonOk({
      success: true,
      shop: {
        id: updatedShop!.id,
        shopName: updatedShop!.shopName,
        shopEmail: updatedShop!.shopEmail,
        verified: updatedShop!.verified,
        verificationStatus: updatedShop!.verificationStatus,
        services: updatedShop!.services,
        isActive: updatedShop!.isActive,
      },
    });
  } catch (err) {
    if (isAuthError(err)) return jsonError(err.message, 401);
    throw err;
  }
}
