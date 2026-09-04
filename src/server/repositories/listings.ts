import { generateId, getDb, queryOne, queryRows } from "@/server/db";
import type { ListingRecord, ListingStatus } from "@/server/types";

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
  async findById(id: string) {
    const r = await queryOne<Row>(
      getDb()
        .from("listings")
        .select("*")
        .eq("id", id)
        .maybeSingle(),
    );

    return r && map(r);
  },

  async list(f: ListingFilters = {}) {
    let q = getDb().from("listings").select("*");

    if (f.sellerId) {
      q = q.eq("seller_id", f.sellerId);
    }

    if (f.status) {
      q = q.in(
        "status",
        Array.isArray(f.status) ? f.status : [f.status],
      );
    }

    if (f.q) {
      q = q.or(`brand.ilike.%${f.q}%,model.ilike.%${f.q}%`);
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

    q =
      f.sort === "price-asc"
        ? q.order("price")
        : f.sort === "price-desc"
          ? q.order("price", { ascending: false })
          : f.sort === "recommended"
            ? q
                .order("score", { ascending: false })
                .order("created_at", { ascending: false })
            : q.order("created_at", { ascending: false });

    return (await queryRows<Row>(q)).map(map);
  },

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
    const id = generateId("lst_");

    const r = await queryOne<Row>(
      getDb()
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
          battery_health: i.batteryHealth ?? null,
          repair_history: i.repairHistory ?? null,
          photo_count: i.photoCount ?? 0,
          image_urls: i.imageUrls ?? [],
          status: i.status ?? "active",
        })
        .select()
        .single(),
    );

    return map(r!);
  },

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
    const c = await this.findById(id);

    if (
      c?.status === "sold" &&
      fields.status &&
      fields.status !== "sold"
    ) {
      return c;
    }

    const m: Record<string, string> = {
      price: "price",
      negotiable: "negotiable",
      condition: "condition",
      description: "description",
      status: "status",
      verified: "verified",
      score: "score",
    };

    const p = Object.fromEntries(
      Object.entries(fields).flatMap(([k, v]) =>
        m[k] ? [[m[k], v]] : [],
      ),
    );

    if (!Object.keys(p).length) {
      return c;
    }

    const r = await queryOne<Row>(
      getDb()
        .from("listings")
        .update(p)
        .eq("id", id)
        .select()
        .maybeSingle(),
    );

    return r && map(r);
  },

  async delete(id: string) {
    await queryOne(
      getDb()
        .from("listings")
        .delete()
        .eq("id", id)
        .select()
        .maybeSingle(),
    );
  },

  async incrementViews(id: string) {
    const current = await this.findById(id);

    if (current) {
      await getDb()
        .from("listings")
        .update({ views: current.views + 1 })
        .eq("id", id);
    }
  },

  async countBySeller(sellerId: string) {
    const rows = await this.list({ sellerId });

    const out = {
      active: 0,
      pending: 0,
      sold: 0,
      draft: 0,
    };

    for (const r of rows) {
      if (r.status in out) {
        out[r.status as keyof typeof out]++;
      }
    }

    return out;
  },
};