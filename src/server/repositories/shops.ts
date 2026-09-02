import { db, generateId } from "@/server/db";
import type { ShopProfileRecord, ShopVerificationStatus } from "@/server/types";

interface ShopRow {
  id: string;
  shop_name: string;
  shop_email: string;
  verified: number;
  verification_status: ShopVerificationStatus;
  services: string;
  verification_notes: string | null;
  verified_at: string | null;
  verified_by_admin_id: string | null;
  is_active: number;
  created_at: string;
  updated_at: string;
}

function mapRow(row: ShopRow): ShopProfileRecord {
  return {
    id: row.id,
    shopName: row.shop_name,
    shopEmail: row.shop_email,
    verified: !!row.verified,
    verificationStatus: row.verification_status,
    services: row.services,
    verificationNotes: row.verification_notes,
    verifiedAt: row.verified_at,
    verifiedByAdminId: row.verified_by_admin_id,
    isActive: !!row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const shopsRepo = {
  findById(id: string): ShopProfileRecord | null {
    const row = db.prepare("SELECT * FROM shop_profiles WHERE id = ?").get(id) as ShopRow | undefined;
    return row ? mapRow(row) : null;
  },

  findByEmail(email: string): ShopProfileRecord | null {
    const row = db
      .prepare("SELECT * FROM shop_profiles WHERE shop_email = ?")
      .get(email.toLowerCase().trim()) as ShopRow | undefined;
    return row ? mapRow(row) : null;
  },

  findByVerificationStatus(status: ShopVerificationStatus): ShopProfileRecord[] {
    const rows = db
      .prepare("SELECT * FROM shop_profiles WHERE verification_status = ? ORDER BY created_at DESC")
      .all(status) as ShopRow[];
    return rows.map(mapRow);
  },

  findActive(): ShopProfileRecord[] {
    const rows = db
      .prepare("SELECT * FROM shop_profiles WHERE is_active = 1 ORDER BY shop_name")
      .all() as ShopRow[];
    return rows.map(mapRow);
  },

  findAll(): ShopProfileRecord[] {
    const rows = db.prepare("SELECT * FROM shop_profiles ORDER BY created_at DESC").all() as ShopRow[];
    return rows.map(mapRow);
  },

  create(input: {
    shopName: string;
    shopEmail: string;
    services?: string;
  }): ShopProfileRecord {
    const id = generateId("shp_");
    db.prepare(
      `INSERT INTO shop_profiles (id, shop_name, shop_email, services)
       VALUES (?, ?, ?, ?)`
    ).run(id, input.shopName, input.shopEmail.toLowerCase().trim(), input.services ?? "");

    return this.findById(id)!;
  },

  updateVerificationStatus(
    shopId: string,
    status: ShopVerificationStatus,
    adminId: string,
    notes?: string
  ): ShopProfileRecord | null {
    const verified = status === "approved" ? 1 : 0;
    const verifiedAt = status === "approved" ? "datetime('now')" : null;

    db.prepare(
      `UPDATE shop_profiles 
       SET verification_status = ?, 
           verified = ?, 
           verified_at = ${verifiedAt ? "datetime('now')" : "NULL"}, 
           verified_by_admin_id = ?, 
           verification_notes = ?,
           updated_at = datetime('now')
       WHERE id = ?`
    ).run(status, verified, adminId, notes ?? null, shopId);

    return this.findById(shopId);
  },

  update(
    shopId: string,
    fields: Partial<{
      shopName: string;
      services: string;
      isActive: boolean;
    }>
  ): ShopProfileRecord | null {
    const columnMap: Record<string, string> = {
      shopName: "shop_name",
      services: "services",
      isActive: "is_active",
    };

    const sets: string[] = [];
    const values: unknown[] = [];

    for (const [key, value] of Object.entries(fields)) {
      const column = columnMap[key];
      if (!column) continue;
      sets.push(`${column} = ?`);
      values.push(typeof value === "boolean" ? (value ? 1 : 0) : value);
    }

    if (sets.length === 0) return this.findById(shopId);

    sets.push("updated_at = datetime('now')");
    values.push(shopId);

    db.prepare(`UPDATE shop_profiles SET ${sets.join(", ")} WHERE id = ?`).run(...(values as []));

    return this.findById(shopId);
  },

  deactivate(shopId: string): ShopProfileRecord | null {
    db.prepare(
      `UPDATE shop_profiles 
       SET is_active = 0, updated_at = datetime('now')
       WHERE id = ?`
    ).run(shopId);

    return this.findById(shopId);
  },

  activate(shopId: string): ShopProfileRecord | null {
    db.prepare(
      `UPDATE shop_profiles 
       SET is_active = 1, updated_at = datetime('now')
       WHERE id = ?`
    ).run(shopId);

    return this.findById(shopId);
  },
};
