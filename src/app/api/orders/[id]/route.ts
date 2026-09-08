import { NextRequest } from "next/server";
import { getAdminDb } from "@/server/db";
import { isAdminRole, isAuthError, jsonError, jsonOk, requireUser } from "@/server/http";
import { z } from "zod";

const orderStatusSchema = z.object({ status: z.enum(["processing", "shipped", "delivered", "cancelled"]) });

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user } = await requireUser();
    const parsed = orderStatusSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return jsonError("Invalid order status.", 422, parsed.error.flatten());

    const { id } = await params;
    const db = getAdminDb();
    const { data: order, error: orderError } = await db
      .from("orders")
      .select("id, buyer_id, seller_id, status")
      .eq("id", id)
      .maybeSingle();
    if (orderError) throw new Error(orderError.message);
    if (!order) return jsonError("Order not found.", 404);

    const { status } = parsed.data;
    const isSeller = order.seller_id === user.id;
    const isBuyer = order.buyer_id === user.id;
    const permitted = isAdminRole(user.role)
      || (isSeller && order.status === "processing" && status === "shipped")
      || (isBuyer && order.status === "shipped" && status === "delivered")
      || ((isBuyer || isSeller) && ["processing", "shipped"].includes(order.status) && status === "cancelled");
    if (!permitted) return jsonError("You are not allowed to make this order update.", 403);

    const { data: updated, error: updateError } = await db
      .from("orders")
      .update({ status })
      .eq("id", id)
      .select()
      .single();
    if (updateError) throw new Error(updateError.message);
    return jsonOk({ order: updated });
  } catch (err) {
    if (isAuthError(err)) return jsonError(err.message, 401);
    throw err;
  }
}
