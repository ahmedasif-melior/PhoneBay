import {
  generateId,
  getDb,
  queryOne,
  queryRows,
} from "@/server/db";
import type { ReviewRecord } from "@/server/types";

type R = {
  id: string;
  author_id: string;
  target_seller_id: string;
  listing_id: string | null;
  rating: number;
  comment: string;
  created_at: string;
};

const map = (r: R): ReviewRecord => ({
  id: r.id,
  authorId: r.author_id,
  targetSellerId: r.target_seller_id,
  listingId: r.listing_id,
  rating: r.rating,
  comment: r.comment,
  createdAt: r.created_at,
});

export const reviewsRepo = {
  async create(i: {
    authorId: string;
    targetSellerId: string;
    listingId?: string | null;
    rating: number;
    comment: string;
  }) {
    const r = await queryOne<R>(
      getDb()
        .from("reviews")
        .insert({
          id: generateId("rev_"),
          author_id: i.authorId,
          target_seller_id: i.targetSellerId,
          listing_id: i.listingId ?? null,
          rating: i.rating,
          comment: i.comment,
        })
        .select()
        .single(),
    );

    return map(r!);
  },

  async findById(id: string) {
    const r = await queryOne<R>(
      getDb()
        .from("reviews")
        .select("*")
        .eq("id", id)
        .maybeSingle(),
    );

    return r && map(r);
  },

  async listForSeller(id: string) {
    return (
      await queryRows<R>(
        getDb()
          .from("reviews")
          .select("*")
          .eq("target_seller_id", id)
          .order("created_at", { ascending: false }),
      )
    ).map(map);
  },

  async averageForSeller(id: string) {
    const rows = await this.listForSeller(id);

    return {
      average: rows.length
        ? rows.reduce((s, r) => s + r.rating, 0) / rows.length
        : 0,
      count: rows.length,
    };
  },
};