import {
  generateId,
  getAdminDb,
  queryOne,
  queryRows,
} from "@/server/db";
import type {
  ShopProfileRecord,
  ShopVerificationStatus,
} from "@/server/types";

type R = {
  id: string;
  shop_name: string;
  shop_email: string;
  verified: boolean;
  verification_status: ShopVerificationStatus;
  services: string;
  verification_notes: string | null;
  verified_at: string | null;
  verified_by_admin_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

const map = (r: R): ShopProfileRecord => ({
  id: r.id,
  shopName: r.shop_name,
  shopEmail: r.shop_email,
  verified: r.verified,
  verificationStatus: r.verification_status,
  services: r.services,
  verificationNotes: r.verification_notes,
  verifiedAt: r.verified_at,
  verifiedByAdminId: r.verified_by_admin_id,
  isActive: r.is_active,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

export const shopsRepo = {
  async findById(id: string) {
    const r = await queryOne<R>(
      getAdminDb()
        .from("shop_profiles")
        .select("*")
        .eq("id", id)
        .maybeSingle(),
    );

    return r && map(r);
  },

  async findByEmail(email: string) {
    const r = await queryOne<R>(
      getAdminDb()
        .from("shop_profiles")
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
          .from("shop_profiles")
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
          .from("shop_profiles")
          .select("*")
          .eq("is_active", true)
          .order("shop_name"),
      )
    ).map(map);
  },

  async findAll() {
    return (
      await queryRows<R>(
        getAdminDb()
          .from("shop_profiles")
          .select("*")
          .order("created_at", { ascending: false }),
      )
    ).map(map);
  },

  async create(i: {
    shopName: string;
    shopEmail: string;
    services?: string;
  }) {
    const r = await queryOne<R>(
      getAdminDb()
        .from("shop_profiles")
        .insert({
          id: generateId("shp_"),
          shop_name: i.shopName,
          shop_email: i.shopEmail.toLowerCase().trim(),
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
        .from("shop_profiles")
        .update({
          verification_status: s,
          verified: s === "approved",
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
      services: string;
      isActive: boolean;
    }>,
  ) {
    const p = {
      ...(f.shopName !== undefined
        ? { shop_name: f.shopName }
        : {}),
      ...(f.services !== undefined
        ? { services: f.services }
        : {}),
      ...(f.isActive !== undefined
        ? { is_active: f.isActive }
        : {}),
    };

    if (!Object.keys(p).length) {
      return this.findById(id);
    }

    const r = await queryOne<R>(
      getAdminDb()
        .from("shop_profiles")
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