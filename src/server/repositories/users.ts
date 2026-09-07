import { getAdminDb, queryOne, queryRows } from "@/server/db";
import type { PublicUser, Role, UserRecord } from "@/server/types";

/**
 * UserRow represents a row from public.users.
 *
 * Authentication is managed entirely by Supabase Auth.
 * public.users.id must always match auth.users.id.
 */
type UserRow = {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
  bio: string | null;
  city: string | null;
  role: Role;
  account_purpose: "buyer" | "seller" | "both" | "shop" | null;
  shop_id: string | null;
  email_verified: boolean;
  phone_verified: boolean;
  trust_score: number;
  is_blocked: boolean;
  blocked_reason: string | null;
  blocked_at: string | null;
  created_at: string;
  updated_at: string;
};

const mapRow = (r: UserRow): UserRecord => ({
  id: r.id,
  email: r.email,
  fullName: r.full_name,
  phone: r.phone,
  avatarUrl: r.avatar_url,
  bio: r.bio,
  city: r.city,
  role: r.role,
  accountPurpose: r.account_purpose,
  shopId: r.shop_id,
  emailVerified: r.email_verified,
  phoneVerified: r.phone_verified,
  trustScore: r.trust_score,
  isBlocked: r.is_blocked,
  blockedReason: r.blocked_reason,
  blockedAt: r.blocked_at,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

export function toPublicUser(user: UserRecord): PublicUser {
  return user;
}

export const usersRepo = {
  /**
   * Find a user profile by email.
   *
   * This is a trusted server-side repository operation, so it uses
   * the server-only Supabase secret client.
   */
  async findByEmail(email: string) {
    const db = getAdminDb();

    const r = await queryOne<UserRow>(
      db
        .from("users")
        .select("*")
        .eq("email", email.toLowerCase().trim())
        .maybeSingle(),
    );

    return r ? mapRow(r) : null;
  },

  /**
   * Find a public profile by the Supabase Auth UUID.
   *
   * IMPORTANT:
   * This ID must be auth.users.id.
   */
  async findById(id: string) {
    const db = getAdminDb();

    const r = await queryOne<UserRow>(
      db
        .from("users")
        .select("*")
        .eq("id", id)
        .maybeSingle(),
    );

    return r ? mapRow(r) : null;
  },

  /**
   * Find all users with a particular role.
   */
  async findByRole(role: Role) {
    const db = getAdminDb();

    const rows = await queryRows<UserRow>(
      db
        .from("users")
        .select("*")
        .eq("role", role)
        .order("created_at", { ascending: false }),
    );

    return rows.map(mapRow);
  },

  /**
   * Find users belonging to a shop.
   */
  async findByShopId(shopId: string) {
    const db = getAdminDb();

    const rows = await queryRows<UserRow>(
      db
        .from("users")
        .select("*")
        .eq("shop_id", shopId),
    );

    return rows.map(mapRow);
  },

  /**
   * Create a public.users profile.
   *
   * Normally this should NOT be called after sign-up because the
   * database trigger on auth.users creates the profile automatically.
   *
   * This remains available for trusted server-side operations where
   * an explicit profile creation is genuinely required.
   */
  async create(input: {
    id: string;
    email: string;
    fullName: string;
    phone?: string | null;
    city?: string | null;
    role?: Role;
    shopId?: string | null;
  }) {
    const db = getAdminDb();

    const r = await queryOne<UserRow>(
      db
        .from("users")
        .insert({
          id: input.id,
          email: input.email.toLowerCase().trim(),
          full_name: input.fullName.trim(),
          phone: input.phone ?? null,
          city: input.city ?? null,
          role: input.role ?? "USER",
          shop_id: input.shopId ?? null,
        })
        .select()
        .single(),
    );

    if (!r) {
      throw new Error("Failed to create user profile");
    }

    return mapRow(r);
  },

  /**
   * Update a public.users profile.
   */
  async update(
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
      role: Role;
      isBlocked: boolean;
      blockedReason: string | null;
      accountPurpose: "buyer" | "seller" | "both" | "shop" | null;
    }>,
  ) {
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
      role: "role",
      isBlocked: "is_blocked",
      blockedReason: "blocked_reason",
      accountPurpose: "account_purpose",
    };

    const payload = Object.fromEntries(
      Object.entries(fields).flatMap(([key, value]) =>
        columnMap[key] ? [[columnMap[key], value]] : [],
      ),
    );

    if (!Object.keys(payload).length) {
      return this.findById(id);
    }

    const db = getAdminDb();

    const r = await queryOne<UserRow>(
      db
        .from("users")
        .update(payload)
        .eq("id", id)
        .select()
        .maybeSingle(),
    );

    return r ? mapRow(r) : null;
  },

  /**
   * Block a user.
   */
  async blockUser(userId: string, reason: string) {
    const db = getAdminDb();

    const r = await queryOne<UserRow>(
      db
        .from("users")
        .update({
          is_blocked: true,
          blocked_reason: reason,
          blocked_at: new Date().toISOString(),
        })
        .eq("id", userId)
        .select()
        .maybeSingle(),
    );

    return r ? mapRow(r) : null;
  },

  /**
   * Unblock a user.
   */
  async unblockUser(userId: string) {
    const db = getAdminDb();

    const r = await queryOne<UserRow>(
      db
        .from("users")
        .update({
          is_blocked: false,
          blocked_reason: null,
          blocked_at: null,
        })
        .eq("id", userId)
        .select()
        .maybeSingle(),
    );

    return r ? mapRow(r) : null;
  },
};