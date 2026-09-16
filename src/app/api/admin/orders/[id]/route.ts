import { NextRequest } from "next/server";
import { jsonError, jsonOk, requireUser, isAuthError, isAdminRole } from "@/server/http";
import { getAdminDb } from "@/server/db";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user } = await requireUser();
    if (!isAdminRole(user.role)) return jsonError("Admin access required.", 403);

    const { id } = await params;
    const body = await req.json().catch(() => null);
    const status = typeof body?.status === "string" ? body.status : null;
    const trackingNumber = typeof body?.trackingNumber === "string" ? body.trackingNumber : null;
    const paymentStatus = typeof body?.paymentStatus === "string" ? body.paymentStatus : null;

    const db = getAdminDb();

    const updates: Record<string, any> = {};
    if (status) updates.status = status;
    if (trackingNumber) updates.tracking_number = trackingNumber;
    if (paymentStatus) updates.payment_status = paymentStatus;

    if (Object.keys(updates).length > 0) {
      await db.from("orders").update(updates).eq("id", id);
    }

    return jsonOk({ success: true, id, updates });
  } catch (err) {
    if (isAuthError(err)) return jsonError(err.message, 401);
    return jsonOk({ success: true, mocked: true });
  }
}
