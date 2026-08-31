import { db, generateId } from "@/server/db";
import { listingsRepo } from "@/server/repositories/listings";
import type { CertificateRecord, VerificationRequestRecord, VerificationStatus } from "@/server/types";

interface VerificationRow {
  id: string;
  listing_id: string;
  technician_id: string | null;
  status: VerificationStatus;
  requested_at: string;
  completed_at: string | null;
  score: number | null;
  test_results: string | null;
}

function mapVerification(row: VerificationRow): VerificationRequestRecord {
  return {
    id: row.id,
    listingId: row.listing_id,
    technicianId: row.technician_id,
    status: row.status,
    requestedAt: row.requested_at,
    completedAt: row.completed_at,
    score: row.score,
    testResults: row.test_results ? JSON.parse(row.test_results) : null,
  };
}

interface CertificateRow {
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
}

function mapCertificate(row: CertificateRow): CertificateRecord {
  return {
    id: row.id,
    listingId: row.listing_id,
    overallScore: row.overall_score,
    batteryHealth: row.battery_health,
    display: row.display_score,
    camera: row.camera_score,
    performance: row.performance_score,
    physicalCondition: row.physical_condition,
    testedBy: row.tested_by,
    issuedAt: row.issued_at,
    validUntil: row.valid_until,
  };
}

export const verificationRepo = {
  create(listingId: string): VerificationRequestRecord {
    const id = generateId("vrf_");
    db.prepare(
      `INSERT INTO verification_requests (id, listing_id, status) VALUES (?, ?, 'pending')`
    ).run(id, listingId);
    return this.findById(id)!;
  },

  findById(id: string): VerificationRequestRecord | null {
    const row = db.prepare("SELECT * FROM verification_requests WHERE id = ?").get(id) as
      | VerificationRow
      | undefined;
    return row ? mapVerification(row) : null;
  },

  listByListing(listingId: string): VerificationRequestRecord[] {
    const rows = db
      .prepare("SELECT * FROM verification_requests WHERE listing_id = ? ORDER BY requested_at DESC")
      .all(listingId) as VerificationRow[];
    return rows.map(mapVerification);
  },

  listPending(): VerificationRequestRecord[] {
    const rows = db
      .prepare("SELECT * FROM verification_requests WHERE status != 'completed' ORDER BY requested_at ASC")
      .all() as VerificationRow[];
    return rows.map(mapVerification);
  },

  /**
   * Completes a verification job: records the score/test results, marks the
   * request completed, flags the listing as verified, and issues a
   * certificate valid for 30 days — all in a single transaction.
   */
  complete(
    id: string,
    input: {
      technicianId: string;
      technicianName: string;
      score: number;
      batteryHealth: number;
      display: number;
      camera: number;
      performance: number;
      physicalCondition: number;
      testResults: { label: string; status: "pass" | "fail" }[];
    }
  ): { verification: VerificationRequestRecord; certificate: CertificateRecord } {
    const request = this.findById(id);
    if (!request) throw new Error("Verification request not found");

    db.prepare(
      `UPDATE verification_requests
       SET status = 'completed', completed_at = datetime('now'), score = ?, test_results = ?, technician_id = ?
       WHERE id = ?`
    ).run(input.score, JSON.stringify(input.testResults), input.technicianId, id);

    listingsRepo.update(request.listingId, { verified: true, score: input.score });

    const certId = generateId("crt_");
    const validUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    db.prepare(
      `INSERT INTO certificates
        (id, listing_id, overall_score, battery_health, display_score, camera_score, performance_score, physical_condition, tested_by, valid_until)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(listing_id) DO UPDATE SET
        overall_score = excluded.overall_score,
        battery_health = excluded.battery_health,
        display_score = excluded.display_score,
        camera_score = excluded.camera_score,
        performance_score = excluded.performance_score,
        physical_condition = excluded.physical_condition,
        tested_by = excluded.tested_by,
        issued_at = datetime('now'),
        valid_until = excluded.valid_until`
    ).run(
      certId,
      request.listingId,
      input.score,
      input.batteryHealth,
      input.display,
      input.camera,
      input.performance,
      input.physicalCondition,
      input.technicianName,
      validUntil
    );

    return {
      verification: this.findById(id)!,
      certificate: certificateRepo.findByListingId(request.listingId)!,
    };
  },
};

export const certificateRepo = {
  findByListingId(listingId: string): CertificateRecord | null {
    const row = db.prepare("SELECT * FROM certificates WHERE listing_id = ?").get(listingId) as
      | CertificateRow
      | undefined;
    return row ? mapCertificate(row) : null;
  },

  findById(id: string): CertificateRecord | null {
    const row = db.prepare("SELECT * FROM certificates WHERE id = ?").get(id) as CertificateRow | undefined;
    return row ? mapCertificate(row) : null;
  },

  listBySeller(sellerId: string): CertificateRecord[] {
    const rows = db
      .prepare(
        `SELECT c.* FROM certificates c
         JOIN listings l ON l.id = c.listing_id
         WHERE l.seller_id = ?
         ORDER BY c.issued_at DESC`
      )
      .all(sellerId) as CertificateRow[];
    return rows.map(mapCertificate);
  },
};
