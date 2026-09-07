import { jsonError, jsonOk, requireAdmin, isAuthError } from "@/server/http";
import { usersRepo, toPublicUser } from "@/server/repositories/users";
import { getAdminDb } from "@/server/db";
import { auditLogsRepo } from "@/server/repositories/audit-logs";

export async function GET() {
  try {
    const { user: adminUser } = await requireAdmin();

    const { data: users, error } = await getAdminDb()
      .from("users")
      .select("id, email, full_name, role, is_blocked, trust_score, created_at")
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);


    return jsonOk({
      users: (users ?? []).map((u) => ({
        id: u.id,
        email: u.email,
        fullName: u.full_name,
        role: u.role,
        isBlocked: !!u.is_blocked,
        trustScore: u.trust_score,
        createdAt: u.created_at,
      })),
    });
  } catch (err) {
    if (isAuthError(err)) return jsonError(err.message, 401);
    throw err;
  }
}

export async function POST(req: Request) {
  try {
    const { user: adminUser } = await requireAdmin();
    const body = await req.json().catch(() => null);

    if (!body?.userId || !body?.action) {
      return jsonError("Missing userId or action", 400);
    }

    const targetUser = await usersRepo.findById(body.userId);
    if (!targetUser) {
      return jsonError("User not found", 404);
    }

    if (body.action === "block") {
      const reason = body.reason || "No reason provided";
      const blocked = await usersRepo.blockUser(targetUser.id, reason);

      auditLogsRepo.log({
        adminId: adminUser.id,
        action: "BLOCK_USER",
        entityType: "USER",
        entityId: targetUser.id,
        changes: { reason },
      });

      return jsonOk({
        success: true,
        user: toPublicUser(blocked!),
      });
    } else if (body.action === "unblock") {
      const unblocked = await usersRepo.unblockUser(targetUser.id);

      auditLogsRepo.log({
        adminId: adminUser.id,
        action: "UNBLOCK_USER",
        entityType: "USER",
        entityId: targetUser.id,
      });

      return jsonOk({
        success: true,
        user: toPublicUser(unblocked!),
      });
    } else {
      return jsonError("Invalid action", 400);
    }
  } catch (err) {
    if (isAuthError(err)) return jsonError(err.message, 401);
    throw err;
  }
}
