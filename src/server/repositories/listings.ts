import {
  generateId,
  getAdminDb,
  getDb,
  queryOne,
  queryRows,
} from "@/server/db";

import type {
  ListingRecord,
  ListingStatus,
} from "@/server/types";

type Row = {
  id: string;
  seller_id: string;
  brand: string;
  model: string;
  storage: string;
  color: string | null;
  condition: string;
  price: number;
  negotiable: boolean;
  city: string;
  area: string | null;
  description: string | null;
  status: ListingStatus;
  battery_health: number | null;
  repair_history: string | null;
  photo_count: number;
  image_urls: string[];
  verified: boolean;
  score: number | null;
  views: number;
  created_at: string;
  updated_at: string;
};

const map = (r: Row): ListingRecord => ({
  id: r.id,
  sellerId: r.seller_id,
  brand: r.brand,
  model: r.model,
  storage: r.storage,
  color: r.color,
  condition: r.condition,
  price: r.price,
  negotiable: r.negotiable,
  city: r.city,
  area: r.area,
  description: r.description,
  status: r.status,
  batteryHealth: r.battery_health,
  repairHistory: r.repair_history,
  photoCount: r.photo_count,
  imageUrls: r.image_urls ?? [],
  verified: r.verified,
  score: r.score,
  views: r.views,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

export interface ListingFilters {
  q?: string;
  brands?: string[];
  conditions?: string[];
  cities?: string[];
  verifiedOnly?: boolean;
  minPrice?: number;
  maxPrice?: number;
  sellerId?: string;
  status?: ListingStatus | ListingStatus[];
  sort?: "recommended" | "newest" | "price-asc" | "price-desc";
}

export const listingsRepo = {
  /**
   * Public/read-side lookup.
   *
   * Uses the publishable client so normal RLS policies
   * continue to protect reads.
   */
  async findById(id: string, trusted = false) {
    const r = await queryOne<Row>(
      (trusted ? getAdminDb() : getDb())
        .from("listings")
        .select("*")
        .eq("id", id)
        .maybeSingle(),
    );

    return r ? map(r) : null;
  },

  /**
   * List marketplace/dashboard listings.
   *
   * Reads remain subject to RLS unless trusted (admin) is set.
   */
  async list(f: ListingFilters = {}, trusted = false) {
    let q = (trusted ? getAdminDb() : getDb())
      .from("listings")
      .select("*");

    if (f.sellerId) {
      q = q.eq("seller_id", f.sellerId);
    }

    if (f.status) {
      q = q.in(
        "status",
        Array.isArray(f.status)
          ? f.status
          : [f.status],
      );
    }

    if (f.q) {
      q = q.or(
        `brand.ilike.%${f.q}%,model.ilike.%${f.q}%`,
      );
    }

    if (f.brands?.length) {
      q = q.in("brand", f.brands);
    }

    if (f.conditions?.length) {
      q = q.in("condition", f.conditions);
    }

    if (f.cities?.length) {
      q = q.in("city", f.cities);
    }

    if (f.verifiedOnly) {
      q = q.eq("verified", true);
    }

    if (f.minPrice !== undefined) {
      q = q.gte("price", f.minPrice);
    }

    if (f.maxPrice !== undefined) {
      q = q.lte("price", f.maxPrice);
    }

    if (f.sort === "price-asc") {
      q = q.order("price", {
        ascending: true,
      });
    } else if (f.sort === "price-desc") {
      q = q.order("price", {
        ascending: false,
      });
    } else if (f.sort === "recommended") {
      q = q
        .order("score", {
          ascending: false,
          nullsFirst: false,
        })
        .order("created_at", {
          ascending: false,
        });
    } else {
      q = q.order("created_at", {
        ascending: false,
      });
    }

    return (
      await queryRows<Row>(q)
    ).map(map);
  },

  /**
   * Create a listing.
   *
   * This is a trusted server operation and therefore
   * uses the Supabase secret/service-role client.
   */
  async create(i: {
    sellerId: string;
    brand: string;
    model: string;
    storage: string;
    color?: string | null;
    condition: string;
    price: number;
    negotiable: boolean;
    city: string;
    area?: string | null;
    description?: string | null;
    batteryHealth?: number | null;
    repairHistory?: string | null;
    photoCount?: number;
    imageUrls?: string[];
    status?: ListingStatus;
  }) {
    if (!i.sellerId) {
      throw new Error(
        "Cannot create listing without a seller ID.",
      );
    }

    const id = generateId("lst_");

    const r = await queryOne<Row>(
      getAdminDb()
        .from("listings")
        .insert({
          id,
          seller_id: i.sellerId,
          brand: i.brand,
          model: i.model,
          storage: i.storage,
          color: i.color ?? null,
          condition: i.condition,
          price: i.price,
          negotiable: i.negotiable,
          city: i.city,
          area: i.area ?? null,
          description: i.description ?? null,
          battery_health:
            i.batteryHealth ?? null,
          repair_history:
            i.repairHistory ?? null,
          photo_count:
            i.photoCount ?? 0,
          image_urls:
            i.imageUrls ?? [],
          status:
            i.status ?? "active",
        })
        .select()
        .single(),
    );

    if (!r) {
      throw new Error(
        "Listing was not created.",
      );
    }

    return map(r);
  },

  /**
   * Update a listing.
   *
   * Uses admin client because this is a trusted
   * server-side operation.
   */
  async update(
    id: string,
    fields: Partial<{
      price: number;
      negotiable: boolean;
      condition: string;
      description: string;
      status: ListingStatus;
      verified: boolean;
      score: number;
    }>,
  ) {
    const c = await this.findById(id, true);

    if (!c) {
      return null;
    }

    if (
      c.status === "sold" &&
      fields.status &&
      fields.status !== "sold"
    ) {
      return c;
    }

    const allowed = new Set([
      "price",
      "negotiable",
      "condition",
      "description",
      "status",
      "verified",
      "score",
    ]);

    const p = Object.fromEntries(
      Object.entries(fields).filter(
        ([key]) => allowed.has(key),
      ),
    );

    if (!Object.keys(p).length) {
      return c;
    }

    const r = await queryOne<Row>(
      getAdminDb()
        .from("listings")
        .update(p)
        .eq("id", id)
        .select()
        .maybeSingle(),
    );

    return r ? map(r) : null;
  },

  /**
   * Delete a listing.
   */
  async delete(id: string) {
    await queryOne(
      getAdminDb()
        .from("listings")
        .delete()
        .eq("id", id)
        .select()
        .maybeSingle(),
    );
  },

  /**
   * Increment listing views.
   */
  async incrementViews(id: string) {
    const current = await this.findById(id);

    if (!current) {
      return;
    }

    const { error } = await getAdminDb()
      .from("listings")
      .update({
        views: current.views + 1,
      })
      .eq("id", id);

    if (error) {
      throw new Error(error.message);
    }
  },

  /**
   * Count listings belonging to a seller.
   */
  async countBySeller(sellerId: string) {
    const rows = await this.list({
      sellerId,
    });

    const out = {
      active: 0,
      pending: 0,
      sold: 0,
      draft: 0,
    };

    for (const r of rows) {
      if (r.status in out) {
        out[
          r.status as keyof typeof out
        ]++;
      }
    }

    return out;
  },
};