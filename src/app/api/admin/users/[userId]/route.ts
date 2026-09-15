import { NextRequest } from "next/server";
import { jsonError, jsonOk, requireAdmin, isAuthError } from "@/server/http";
import { usersRepo } from "@/server/repositories/users";
import { listingsRepo } from "@/server/repositories/listings";
import { conversationsRepo } from "@/server/repositories/messages";
import { getAdminDb } from "@/server/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    await requireAdmin();
    const { userId } = await params;

    const user = await usersRepo.findById(userId);
    if (!user) return jsonError("User not found", 404);

    const db = getAdminDb();

    // Fetch all data in parallel with admin client (RLS bypassed)
    const [listingsData, ordersAsBuyerData, ordersAsSellerData, conversationsData] =
      await Promise.all([
        listingsRepo.list({ sellerId: userId }, true),
        db
          .from("orders")
          .select("id, listing_id, buyer_id, seller_id, price, status, created_at")
          .eq("buyer_id", userId)
          .order("created_at", { ascending: false })
          .limit(20),
        db
          .from("orders")
          .select("id, listing_id, buyer_id, seller_id, price, status, created_at")
          .eq("seller_id", userId)
          .order("created_at", { ascending: false })
          .limit(20),
        conversationsRepo.listForUser(userId),
      ]);

    // Enrich orders with listing info
    const listingIds = [
      ...new Set([
        ...(ordersAsBuyerData.data ?? []).map((o: any) => o.listing_id),
        ...(ordersAsSellerData.data ?? []).map((o: any) => o.listing_id),
      ]),
    ].filter(Boolean);

    const listingMap = new Map<string, any>();
    if (listingIds.length > 0) {
      const { data: lRows } = await db
        .from("listings")
        .select("id, brand, model, price")
        .in("id", listingIds);
      for (const l of lRows ?? []) listingMap.set(l.id, l);
    }

    // Enrich conversations with participant names
    const participantIds = [
      ...new Set(
        conversationsData.flatMap((c) => [c.participant1Id, c.participant2Id])
      ),
    ].filter((id) => id && id !== userId);

    const participantMap = new Map<string, string>();
    if (participantIds.length > 0) {
      const { data: pRows } = await db
        .from("users")
        .select("id, full_name")
        .in("id", participantIds);
      for (const p of pRows ?? []) participantMap.set(p.id, p.full_name);
    }

    // Fetch recent messages per conversation (last message)
    const convIds = conversationsData.map((c) => c.id);
    const lastMsgMap = new Map<string, string>();
    if (convIds.length > 0) {
      const { data: msgs } = await db
        .from("messages")
        .select("conversation_id, content, created_at")
        .in("conversation_id", convIds)
        .order("created_at", { ascending: false });
      for (const m of msgs ?? []) {
        if (!lastMsgMap.has(m.conversation_id)) {
          lastMsgMap.set(m.conversation_id, m.content ?? "");
        }
      }
    }

    return jsonOk({
      user,
      listings: listingsData.map((l) => ({
        id: l.id,
        brand: l.brand,
        model: l.model,
        price: l.price,
        status: l.status,
        condition: l.condition,
        city: l.city,
        verified: l.verified,
        createdAt: l.createdAt,
      })),
      ordersAsBuyer: (ordersAsBuyerData.data ?? []).map((o: any) => ({
        id: o.id,
        price: Number(o.price),
        status: o.status,
        createdAt: o.created_at,
        listing: listingMap.get(o.listing_id) ?? null,
      })),
      ordersAsSeller: (ordersAsSellerData.data ?? []).map((o: any) => ({
        id: o.id,
        price: Number(o.price),
        status: o.status,
        createdAt: o.created_at,
        listing: listingMap.get(o.listing_id) ?? null,
      })),
      conversations: conversationsData.map((c) => {
        const otherId = c.participant1Id === userId ? c.participant2Id : c.participant1Id;
        return {
          id: c.id,
          otherUserName: participantMap.get(otherId ?? "") ?? "Unknown",
          otherUserId: otherId,
          lastMessage: lastMsgMap.get(c.id) ?? "",
          updatedAt: c.updatedAt,
        };
      }),
    });
  } catch (err) {
    if (isAuthError(err)) return jsonError(err.message, 401);
    throw err;
  }
}
