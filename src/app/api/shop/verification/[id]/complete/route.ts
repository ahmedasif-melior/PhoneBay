import { NextRequest } from "next/server";
import { jsonError, jsonOk, requireUser, isAuthError } from "@/server/http";
import { completeVerificationSchema } from "@/server/validation";
import { verificationRepo } from "@/server/repositories/verification";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { user } = await requireUser();
    if (user.role !== "SHOP" && user.role !== "ADMIN") {
      return jsonError("Only shop accounts can complete verification jobs.", 403);
    }

    const body = await req.json().catch(() => null);
    const parsed = completeVerificationSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError("Invalid test results.", 422, parsed.error.flatten());
    }

    const result = verificationRepo.complete(id, {
      technicianId: user.id,
      technicianName: user.fullName,
      ...parsed.data,
    });

    return jsonOk(result);
  } catch (err) {
    if (isAuthError(err)) return jsonError(err.message, 401);
    if (err instanceof Error) return jsonError(err.message, 400);
    throw err;
  }
}
