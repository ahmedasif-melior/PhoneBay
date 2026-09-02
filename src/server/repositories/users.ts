import { db, generateId } from "@/server/db";
import type { PublicUser, Role, UserRecord } from "@/server/types";

interface UserRow {
  id: string;
  email: string;
  password_hash: string;
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
  bio: string | null;
  city: string | null;
  role: Role;
  shop_id: string | null;
  email_verified: number;
  phone_verified: number;
  trust_score: number;
  is_blocked: number;
  blocked_reason: string | null;
  blocked_at: string | null;
  created_at: string;
  updated_at: string;
}

function mapRow(row: UserRow): UserRecord {
  return {
    id: row.id,
    email: row.email,
    passwordHash: row.password_hash,
    fullName: row.full_name,
    phone: row.phone,
    avatarUrl: row.avatar_url,
    bio: row.bio,
    city: row.city,
    role: row.role,
    shopId: row.shop_id,
    emailVerified: !!row.email_verified,
    phoneVerified: !!row.phone_verified,
    trustScore: row.trust_score,
    isBlocked: !!row.is_blocked,
    blockedReason: row.blocked_reason,
    blockedAt: row.blocked_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function toPublicUser(user: UserRecord): PublicUser {
  const { passwordHash: _passwordHash, ...rest } = user;
  return rest;
}

export const usersRepo = {
  findByEmail(email: string): UserRecord | null {
    const row = db
      .prepare("SELECT * FROM users WHERE email = ?")
      .get(email.toLowerCase().trim()) as UserRow | undefined;
    return row ? mapRow(row) : null;
  },

  findById(id: string): UserRecord | null {
    const row = db.prepare("SELECT * FROM users WHERE id = ?").get(id) as UserRow | undefined;
    return row ? mapRow(row) : null;
  },

  findByRole(role: Role): UserRecord[] {
    const rows = db.prepare("SELECT * FROM users WHERE role = ? ORDER BY created_at DESC").all(role) as UserRow[];
    return rows.map(mapRow);
  },

  findByShopId(shopId: string): UserRecord[] {
    const rows = db.prepare("SELECT * FROM users WHERE shop_id = ?").all(shopId) as UserRow[];
    return rows.map(mapRow);
  },

  create(input: {
    email: string;
    passwordHash: string;
    fullName: string;
    phone?: string | null;
    city?: string | null;
    role?: Role;
    shopId?: string | null;
  }): UserRecord {
    const id = generateId("usr_");
    db.prepare(
      `INSERT INTO users (id, email, password_hash, full_name, phone, city, role, shop_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      id,
      input.email.toLowerCase().trim(),
      input.passwordHash,
      input.fullName.trim(),
      input.phone ?? null,
      input.city ?? null,
      input.role ?? "USER",
      input.shopId ?? null
    );
    return this.findById(id)!;
  },

  update(
    id: string,
    fields: Partial<{
      fullName: string;
      phone: string | null;
      city: string | null;
      bio: string | null;
      avatarUrl: string | null;
      shopId: string | null;
      emailVerified: boolean;
      phoneVerified: boolean;
      trustScore: number;
      isBlocked: boolean;
      blockedReason: string | null;
    }>
  ): UserRecord | null {
    const columnMap: Record<string, string> = {
      fullName: "full_name",
      phone: "phone",
      city: "city",
      bio: "bio",
      avatarUrl: "avatar_url",
      shopId: "shop_id",
      emailVerified: "email_verified",
      phoneVerified: "phone_verified",
      trustScore: "trust_score",
      isBlocked: "is_blocked",
      blockedReason: "blocked_reason",
    };
    const sets: string[] = [];
    const values: unknown[] = [];
    for (const [key, value] of Object.entries(fields)) {
      const column = columnMap[key];
      if (!column) continue;
      sets.push(`${column} = ?`);
      values.push(typeof value === "boolean" ? (value ? 1 : 0) : value);
    }
    if (sets.length === 0) return this.findById(id);
    sets.push("updated_at = datetime('now')");
    values.push(id);
    db.prepare(`UPDATE users SET ${sets.join(", ")} WHERE id = ?`).run(...(values as []));
    return this.findById(id);
  },

  blockUser(userId: string, reason: string): UserRecord | null {
    db.prepare(`UPDATE users SET is_blocked = 1, blocked_reason = ?, blocked_at = datetime('now'), updated_at = datetime('now') WHERE id = ?`)
      .run(reason, userId);
    return this.findById(userId);
  },

  unblockUser(userId: string): UserRecord | null {
    db.prepare(`UPDATE users SET is_blocked = 0, blocked_reason = NULL, blocked_at = NULL, updated_at = datetime('now') WHERE id = ?`)
      .run(userId);
    return this.findById(userId);
  },
};
