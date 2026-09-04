import {
  generateId,
  getDb,
  queryOne,
  queryRows,
} from "@/server/db";
import type {
  OrderRecord,
  OrderStatus,
} from "@/server/types";

type R = {
  id: string;
  listing_id: string;
  buyer_id: string;
  price: number;
  status: OrderStatus;
  created_at: string;
};

const map = (r: R): OrderRecord => ({
  id: r.id,
  listingId: r.listing_id,
  buyerId: r.buyer_id,
  price: r.price,
  status: r.status,
  createdAt: r.created_at,
});

export const ordersRepo = {
  async create(i: {
    listingId: string;
    buyerId: string;
    price: number;
  }) {
    const id = generateId("ord_");

    const r = await queryOne<R>(
      getDb()
        .from("orders")
        .insert({
          id,
          listing_id: i.listingId,
          buyer_id: i.buyerId,
          price: i.price,
          status: "processing",
        })
        .select()
        .single(),
    );

    await getDb()
      .from("listings")
      .update({ status: "sold" })
      .eq("id", i.listingId);

    return map(r!);
  },

  async findById(id: string) {
    const r = await queryOne<R>(
      getDb()
        .from("orders")
        .select("*")
        .eq("id", id)
        .maybeSingle(),
    );

    return r && map(r);
  },

  async listByBuyer(id: string) {
    return (
      await queryRows<R>(
        getDb()
          .from("orders")
          .select("*")
          .eq("buyer_id", id)
          .order("created_at", { ascending: false }),
      )
    ).map(map);
  },

  async updateStatus(id: string, status: OrderStatus) {
    const r = await queryOne<R>(
      getDb()
        .from("orders")
        .update({ status })
        .eq("id", id)
        .select()
        .maybeSingle(),
    );

    return r && map(r);
  },
};