import {
  generateId,
  getDb,
  queryOne,
  queryRows,
} from "@/server/db";
import { listingsRepo } from "@/server/repositories/listings";
import type {
  CertificateRecord,
  VerificationRequestRecord,
  VerificationStatus,
} from "@/server/types";

type V = {
  id: string;
  listing_id: string;
  technician_id: string | null;
  status: VerificationStatus;
  requested_at: string;
  completed_at: string | null;
  score: number | null;
  test_results: {
    label: string;
    status: "pass" | "fail";
  }[] | null;
};

type C = {
  id: string;
  listing_id: string;
  overall_score: number;
  battery_health: number;
  display_score: number;
  camera_score: number;
  performance_score: number;
  physical_condition: number;
  tested_by: string;
  issued_at: string;
  valid_until: string;
};

const mv = (r: V): VerificationRequestRecord => ({
  id: r.id,
  listingId: r.listing_id,
  technicianId: r.technician_id,
  status: r.status,
  requestedAt: r.requested_at,
  completedAt: r.completed_at,
  score: r.score,
  testResults: r.test_results,
});

const mc = (r: C): CertificateRecord => ({
  id: r.id,
  listingId: r.listing_id,
  overallScore: r.overall_score,
  batteryHealth: r.battery_health,
  display: r.display_score,
  camera: r.camera_score,
  performance: r.performance_score,
  physicalCondition: r.physical_condition,
  testedBy: r.tested_by,
  issuedAt: r.issued_at,
  validUntil: r.valid_until,
});

export const verificationRepo = {
  async create(listingId: string) {
    const r = await queryOne<V>(
      getDb()
        .from("verification_requests")
        .insert({
          id: generateId("vrf_"),
          listing_id: listingId,
          status: "pending",
        })
        .select()
        .single(),
    );

    return mv(r!);
  },

  async findById(id: string) {
    const r = await queryOne<V>(
      getDb()
        .from("verification_requests")
        .select("*")
        .eq("id", id)
        .maybeSingle(),
    );

    return r && mv(r);
  },

  async listByListing(id: string) {
    return (
      await queryRows<V>(
        getDb()
          .from("verification_requests")
          .select("*")
          .eq("listing_id", id)
          .order("requested_at", { ascending: false }),
      )
    ).map(mv);
  },

  async listPending() {
    return (
      await queryRows<V>(
        getDb()
          .from("verification_requests")
          .select("*")
          .neq("status", "completed")
          .order("requested_at"),
      )
    ).map(mv);
  },

  async complete(
    id: string,
    i: {
      technicianId: string;
      technicianName: string;
      score: number;
      batteryHealth: number;
      display: number;
      camera: number;
      performance: number;
      physicalCondition: number;
      testResults: {
        label: string;
        status: "pass" | "fail";
      }[];
    },
  ) {
    const request = await this.findById(id);

    if (!request) {
      throw new Error("Verification request not found");
    }

    const v = await queryOne<V>(
      getDb()
        .from("verification_requests")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
          score: i.score,
          test_results: i.testResults,
          technician_id: i.technicianId,
        })
        .eq("id", id)
        .select()
        .single(),
    );

    await listingsRepo.update(request.listingId, {
      verified: true,
      score: i.score,
    });

    const cert = await queryOne<C>(
      getDb()
        .from("certificates")
        .upsert(
          {
            id: generateId("crt_"),
            listing_id: request.listingId,
            overall_score: i.score,
            battery_health: i.batteryHealth,
            display_score: i.display,
            camera_score: i.camera,
            performance_score: i.performance,
            physical_condition: i.physicalCondition,
            tested_by: i.technicianName,
            valid_until: new Date(
              Date.now() + 2592e6,
            ).toISOString(),
          },
          { onConflict: "listing_id" },
        )
        .select()
        .single(),
    );

    return {
      verification: mv(v!),
      certificate: mc(cert!),
    };
  },
};

export const certificateRepo = {
  async findByListingId(id: string) {
    const r = await queryOne<C>(
      getDb()
        .from("certificates")
        .select("*")
        .eq("listing_id", id)
        .maybeSingle(),
    );

    return r && mc(r);
  },

  async findById(id: string) {
    const r = await queryOne<C>(
      getDb()
        .from("certificates")
        .select("*")
        .eq("id", id)
        .maybeSingle(),
    );

    return r && mc(r);
  },

  async listBySeller(id: string) {
    const listingIds = (
      await listingsRepo.list({
        sellerId: id,
      })
    ).map((x) => x.id);

    if (!listingIds.length) {
      return [];
    }

    return (
      await queryRows<C>(
        getDb()
          .from("certificates")
          .select("*")
          .in("listing_id", listingIds)
          .order("issued_at", { ascending: false }),
      )
    ).map(mc);
  },
};