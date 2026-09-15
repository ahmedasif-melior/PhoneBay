import {
  getAdminDb,
  queryOne,
  queryRows,
} from "@/server/db";
import type {
  ShopProfileRecord,
  ShopType,
  ShopVerificationStatus,
} from "@/server/types";

type R = {
  id: string;
  owner_id: string;
  name: string;
  shop_email: string | null;
  description: string | null;
  logo_url: string | null;
  banner_url: string | null;
  city: string | null;
  area: string | null;
  phone: string | null;
  website: string | null;
  shop_type: ShopType;
  verification_status: ShopVerificationStatus;
  services: string;
  verification_notes: string | null;
  verified_at: string | null;
  verified_by_admin_id: string | null;
  rating: number | null;
  total_reviews: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

const map = (r: R): ShopProfileRecord => ({
  id: r.id,
  ownerId: r.owner_id,
  shopName: r.name,
  shopEmail: r.shop_email,
  description: r.description,
  logoUrl: r.logo_url,
  bannerUrl: r.banner_url,
  city: r.city,
  area: r.area,
  phone: r.phone,
  website: r.website,
  shopType: r.shop_type,
  verified: r.verification_status === "approved",
  verificationStatus: r.verification_status,
  services: r.services,
  verificationNotes: r.verification_notes,
  verifiedAt: r.verified_at,
  verifiedByAdminId: r.verified_by_admin_id,
  rating: r.rating,
  totalReviews: r.total_reviews,
  isActive: r.is_active,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

export const shopsRepo = {
  async findById(id: string) {
    const r = await queryOne<R>(
      getAdminDb()
        .from("shops")
        .select("*")
        .eq("id", id)
        .maybeSingle(),
    );

    return r && map(r);
  },

  async findByOwnerId(ownerId: string) {
    const r = await queryOne<R>(
      getAdminDb()
        .from("shops")
        .select("*")
        .eq("owner_id", ownerId)
        .maybeSingle(),
    );

    return r && map(r);
  },

  async findByEmail(email: string) {
    const r = await queryOne<R>(
      getAdminDb()
        .from("shops")
        .select("*")
        .eq("shop_email", email.toLowerCase().trim())
        .maybeSingle(),
    );

    return r && map(r);
  },

  async findByVerificationStatus(s: ShopVerificationStatus) {
    return (
      await queryRows<R>(
        getAdminDb()
          .from("shops")
          .select("*")
          .eq("verification_status", s)
          .order("created_at", { ascending: false }),
      )
    ).map(map);
  },

  async findActive() {
    return (
      await queryRows<R>(
        getAdminDb()
          .from("shops")
          .select("*")
          .eq("is_active", true)
          .order("name"),
      )
    ).map(map);
  },

  /** Active shops of a given type, e.g. shops that only sell brand-new phones. */
  async findActiveByType(shopType: ShopType) {
    return (
      await queryRows<R>(
        getAdminDb()
          .from("shops")
          .select("*")
          .eq("is_active", true)
          .eq("shop_type", shopType)
          .order("name"),
      )
    ).map(map);
  },

  async findAll() {
    return (
      await queryRows<R>(
        getAdminDb()
          .from("shops")
          .select("*")
          .order("created_at", { ascending: false }),
      )
    ).map(map);
  },

  /**
   * Create a shop profile linked to an existing auth user (owner_id).
   *
   * Used by both the shop sign-up flow and the "convert my account to
   * a shop" flow for existing users.
   */
  async create(i: {
    ownerId: string;
    shopName: string;
    shopEmail?: string | null;
    city?: string | null;
    shopType?: ShopType;
    services?: string;
  }) {
    const r = await queryOne<R>(
      getAdminDb()
        .from("shops")
        .insert({
          owner_id: i.ownerId,
          name: i.shopName,
          shop_email: i.shopEmail ? i.shopEmail.toLowerCase().trim() : null,
          city: i.city ?? null,
          shop_type: i.shopType ?? "general",
          services: i.services ?? "",
        })
        .select()
        .single(),
    );

    return map(r!);
  },

  async updateVerificationStatus(
    id: string,
    s: ShopVerificationStatus,
    adminId: string,
    notes?: string,
  ) {
    const r = await queryOne<R>(
      getAdminDb()
        .from("shops")
        .update({
          verification_status: s,
          verified_at:
            s === "approved" ? new Date().toISOString() : null,
          verified_by_admin_id: adminId,
          verification_notes: notes ?? null,
        })
        .eq("id", id)
        .select()
        .maybeSingle(),
    );

    return r && map(r);
  },

  async update(
    id: string,
    f: Partial<{
      shopName: string;
      shopEmail: string | null;
      description: string | null;
      city: string | null;
      area: string | null;
      phone: string | null;
      website: string | null;
      logoUrl: string | null;
      bannerUrl: string | null;
      shopType: ShopType;
      services: string;
      isActive: boolean;
    }>,
  ) {
    const p = {
      ...(f.shopName !== undefined ? { name: f.shopName } : {}),
      ...(f.shopEmail !== undefined
        ? { shop_email: f.shopEmail ? f.shopEmail.toLowerCase().trim() : null }
        : {}),
      ...(f.description !== undefined ? { description: f.description } : {}),
      ...(f.city !== undefined ? { city: f.city } : {}),
      ...(f.area !== undefined ? { area: f.area } : {}),
      ...(f.phone !== undefined ? { phone: f.phone } : {}),
      ...(f.website !== undefined ? { website: f.website } : {}),
      ...(f.logoUrl !== undefined ? { logo_url: f.logoUrl } : {}),
      ...(f.bannerUrl !== undefined ? { banner_url: f.bannerUrl } : {}),
      ...(f.shopType !== undefined ? { shop_type: f.shopType } : {}),
      ...(f.services !== undefined ? { services: f.services } : {}),
      ...(f.isActive !== undefined ? { is_active: f.isActive } : {}),
    };

    if (!Object.keys(p).length) {
      return this.findById(id);
    }

    const r = await queryOne<R>(
      getAdminDb()
        .from("shops")
        .update(p)
        .eq("id", id)
        .select()
        .maybeSingle(),
    );

    return r && map(r);
  },

  async deactivate(id: string) {
    return this.update(id, { isActive: false });
  },

  async activate(id: string) {
    return this.update(id, { isActive: true });
  },
};
