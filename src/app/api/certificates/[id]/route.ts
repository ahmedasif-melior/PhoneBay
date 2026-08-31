import { NextRequest } from "next/server";
import { jsonError, jsonOk } from "@/server/http";
import { certificateRepo } from "@/server/repositories/verification";
import { listingsRepo } from "@/server/repositories/listings";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const certificate = certificateRepo.findById(id);
  if (!certificate) return jsonError("Certificate not found.", 404);

  const listing = listingsRepo.findById(certificate.listingId);
  return jsonOk({ certificate, listing });
}
