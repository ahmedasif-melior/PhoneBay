import { db, generateId } from "@/server/db";
import type { OrderRecord, OrderStatus } from "@/server/types";

interface OrderRow {
  id: string;
  listing_id: string;
  buyer_id: string;
  price: number;
  status: OrderStatus;
  created_at: string;
}

function mapRow(row: OrderRow): OrderRecord {
  return {
    id: row.id,
    listingId: row.listing_id,
    buyerId: row.buyer_id,
    price: row.price,
    status: row.status,
    createdAt: row.created_at,
  };
}

export const ordersRepo = {
  create(input: { listingId: string; buyerId: string; price: number }): OrderRecord {
    const id = generateId("ord_");
    db.prepare(
      `INSERT INTO orders (id, listing_id, buyer_id, price, status) VALUES (?, ?, ?, ?, 'processing')`
    ).run(id, input.listingId, input.buyerId, input.price);
    db.prepare("UPDATE listings SET status = 'sold' WHERE id = ?").run(input.listingId);
    return this.findById(id)!;
  },

  findById(id: string): OrderRecord | null {
    const row = db.prepare("SELECT * FROM orders WHERE id = ?").get(id) as OrderRow | undefined;
    return row ? mapRow(row) : null;
  },

  listByBuyer(buyerId: string): OrderRecord[] {
    const rows = db
      .prepare("SELECT * FROM orders WHERE buyer_id = ? ORDER BY created_at DESC")
      .all(buyerId) as OrderRow[];
    return rows.map(mapRow);
  },

  updateStatus(id: string, status: OrderStatus): OrderRecord | null {
    db.prepare("UPDATE orders SET status = ? WHERE id = ?").run(status, id);
    return this.findById(id);
  },
};
