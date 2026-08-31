import { db, generateId } from "@/server/db";
import type { ReviewRecord } from "@/server/types";

interface ReviewRow {
  id: string;
  author_id: string;
  target_seller_id: string;
  listing_id: string | null;
  rating: number;
  comment: string;
  created_at: string;
}

function mapRow(row: ReviewRow): ReviewRecord {
  return {
    id: row.id,
    authorId: row.author_id,
    targetSellerId: row.target_seller_id,
    listingId: row.listing_id,
    rating: row.rating,
    comment: row.comment,
    createdAt: row.created_at,
  };
}

export const reviewsRepo = {
  create(input: {
    authorId: string;
    targetSellerId: string;
    listingId?: string | null;
    rating: number;
    comment: string;
  }): ReviewRecord {
    const id = generateId("rev_");
    db.prepare(
      `INSERT INTO reviews (id, author_id, target_seller_id, listing_id, rating, comment)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).run(id, input.authorId, input.targetSellerId, input.listingId ?? null, input.rating, input.comment);
    return this.findById(id)!;
  },

  findById(id: string): ReviewRecord | null {
    const row = db.prepare("SELECT * FROM reviews WHERE id = ?").get(id) as ReviewRow | undefined;
    return row ? mapRow(row) : null;
  },

  listForSeller(sellerId: string): ReviewRecord[] {
    const rows = db
      .prepare("SELECT * FROM reviews WHERE target_seller_id = ? ORDER BY created_at DESC")
      .all(sellerId) as ReviewRow[];
    return rows.map(mapRow);
  },

  averageForSeller(sellerId: string): { average: number; count: number } {
    const row = db
      .prepare(
        "SELECT AVG(rating) as average, COUNT(*) as count FROM reviews WHERE target_seller_id = ?"
      )
      .get(sellerId) as { average: number | null; count: number };
    return { average: row.average ?? 0, count: row.count };
  },
};
