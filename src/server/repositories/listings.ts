import { db, generateId } from "@/server/db";
import type { ListingRecord, ListingStatus } from "@/server/types";

interface ListingRow {
  id: string;
  seller_id: string;
  brand: string;
  model: string;
  storage: string;
  color: string | null;
  condition: string;
  price: number;
  negotiable: number;
  city: string;
  area: string | null;
  description: string | null;
  status: ListingStatus;
  battery_health: number | null;
  repair_history: string | null;
  photo_count: number;
  image_urls: string;
  verified: number;
  score: number | null;
  views: number;
  created_at: string;
  updated_at: string;
}

function mapRow(row: ListingRow): ListingRecord {
  return {
    id: row.id,
    sellerId: row.seller_id,
    brand: row.brand,
    model: row.model,
    storage: row.storage,
    color: row.color,
    condition: row.condition,
    price: row.price,
    negotiable: !!row.negotiable,
    city: row.city,
    area: row.area,
    description: row.description,
    status: row.status,
    batteryHealth: row.battery_health,
    repairHistory: row.repair_history,
    photoCount: row.photo_count,
    imageUrls: JSON.parse(row.image_urls || "[]"),
    verified: !!row.verified,
    score: row.score,
    views: row.views,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

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
  findById(id: string): ListingRecord | null {
    const row = db.prepare("SELECT * FROM listings WHERE id = ?").get(id) as ListingRow | undefined;
    return row ? mapRow(row) : null;
  },

  list(filters: ListingFilters = {}): ListingRecord[] {
    const clauses: string[] = [];
    const params: unknown[] = [];

    if (filters.sellerId) {
      clauses.push("seller_id = ?");
      params.push(filters.sellerId);
    }

    if (filters.status) {
      const statuses = Array.isArray(filters.status) ? filters.status : [filters.status];
      clauses.push(`status IN (${statuses.map(() => "?").join(",")})`);
      params.push(...statuses);
    }

    if (filters.q) {
      clauses.push("(brand LIKE ? OR model LIKE ?)");
      params.push(`%${filters.q}%`, `%${filters.q}%`);
    }

    if (filters.brands?.length) {
      clauses.push(`brand IN (${filters.brands.map(() => "?").join(",")})`);
      params.push(...filters.brands);
    }

    if (filters.conditions?.length) {
      clauses.push(`condition IN (${filters.conditions.map(() => "?").join(",")})`);
      params.push(...filters.conditions);
    }

    if (filters.cities?.length) {
      clauses.push(`city IN (${filters.cities.map(() => "?").join(",")})`);
      params.push(...filters.cities);
    }

    if (filters.verifiedOnly) {
      clauses.push("verified = 1");
    }

    if (typeof filters.minPrice === "number") {
      clauses.push("price >= ?");
      params.push(filters.minPrice);
    }

    if (typeof filters.maxPrice === "number") {
      clauses.push("price <= ?");
      params.push(filters.maxPrice);
    }

    let orderBy = "created_at DESC";
    if (filters.sort === "price-asc") orderBy = "price ASC";
    else if (filters.sort === "price-desc") orderBy = "price DESC";
    else if (filters.sort === "newest") orderBy = "created_at DESC";
    else if (filters.sort === "recommended") orderBy = "score DESC, created_at DESC";

    const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
    const rows = db
      .prepare(`SELECT * FROM listings ${where} ORDER BY ${orderBy}`)
      .all(...(params as [])) as ListingRow[];
    return rows.map(mapRow);
  },

  create(input: {
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
  }): ListingRecord {
    const id = generateId("lst_");
    db.prepare(
      `INSERT INTO listings
        (id, seller_id, brand, model, storage, color, condition, price, negotiable, city, area,
        description, battery_health, repair_history, photo_count, image_urls, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      id,
      input.sellerId,
      input.brand,
      input.model,
      input.storage,
      input.color ?? null,
      input.condition,
      input.price,
      input.negotiable ? 1 : 0,
      input.city,
      input.area ?? null,
      input.description ?? null,
      input.batteryHealth ?? null,
      input.repairHistory ?? null,
      input.photoCount ?? 0,
      JSON.stringify(input.imageUrls ?? []),
      input.status ?? "active"
    );
    return this.findById(id)!;
  },

  update(
    id: string,
    fields: Partial<{
      price: number;
      negotiable: boolean;
      condition: string;
      description: string;
      status: ListingStatus;
      verified: boolean;
      score: number;
    }>
  ): ListingRecord | null {
    const current = this.findById(id);
    if (current?.status === "sold" && typeof fields.status === "string" && fields.status !== "sold") {
      return current;
    }

    const columnMap: Record<string, string> = {
      price: "price",
      negotiable: "negotiable",
      condition: "condition",
      description: "description",
      status: "status",
      verified: "verified",
      score: "score",
    };
    const sets: string[] = [];
    const values: unknown[] = [];
    for (const [key, value] of Object.entries(fields)) {
      const column = columnMap[key];
      if (!column) continue;
      if (current?.status === "sold" && key === "status") continue;
      sets.push(`${column} = ?`);
      values.push(typeof value === "boolean" ? (value ? 1 : 0) : value);
    }
    if (sets.length === 0) return this.findById(id);
    sets.push("updated_at = datetime('now')");
    values.push(id);
    db.prepare(`UPDATE listings SET ${sets.join(", ")} WHERE id = ?`).run(...(values as []));
    return this.findById(id);
  },

  delete(id: string): void {
    db.prepare("DELETE FROM listings WHERE id = ?").run(id);
  },

  incrementViews(id: string): void {
    db.prepare("UPDATE listings SET views = views + 1 WHERE id = ?").run(id);
  },

  countBySeller(sellerId: string): { active: number; pending: number; sold: number; draft: number } {
    const rows = db
      .prepare("SELECT status, COUNT(*) as count FROM listings WHERE seller_id = ? GROUP BY status")
      .all(sellerId) as { status: ListingStatus; count: number }[];
    const result = { active: 0, pending: 0, sold: 0, draft: 0 };
    for (const row of rows) {
      if (row.status in result) result[row.status as keyof typeof result] = row.count;
    }
    return result;
  },
};
