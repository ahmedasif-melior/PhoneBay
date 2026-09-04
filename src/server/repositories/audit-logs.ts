import { generateId, getDb, queryOne, queryRows } from "@/server/db";
import type { AdminAuditLogRecord } from "@/server/types";

type R = {
  id: string;
  admin_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  changes: Record<string, unknown> | null;
  created_at: string;
};

const map = (r: R): AdminAuditLogRecord => ({
  id: r.id,
  adminId: r.admin_id,
  action: r.action,
  entityType: r.entity_type,
  entityId: r.entity_id,
  changes: r.changes,
  createdAt: r.created_at,
});

export const auditLogsRepo = {
  async findById(id: string) {
    const r = await queryOne<R>(
      getDb()
        .from("admin_audit_logs")
        .select("*")
        .eq("id", id)
        .maybeSingle(),
    );

    return r && map(r);
  },

  async findByAdmin(id: string, limit = 100) {
    return (
      await queryRows<R>(
        getDb()
          .from("admin_audit_logs")
          .select("*")
          .eq("admin_id", id)
          .order("created_at", { ascending: false })
          .limit(limit),
      )
    ).map(map);
  },

  async findByEntity(t: string, id: string) {
    return (
      await queryRows<R>(
        getDb()
          .from("admin_audit_logs")
          .select("*")
          .eq("entity_type", t)
          .eq("entity_id", id)
          .order("created_at", { ascending: false }),
      )
    ).map(map);
  },

  async findAll(limit = 500) {
    return (
      await queryRows<R>(
        getDb()
          .from("admin_audit_logs")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(limit),
      )
    ).map(map);
  },

  async log(i: {
    adminId: string;
    action: string;
    entityType: string;
    entityId: string;
    changes?: Record<string, unknown>;
  }) {
    const r = await queryOne<R>(
      getDb()
        .from("admin_audit_logs")
        .insert({
          id: generateId("aud_"),
          admin_id: i.adminId,
          action: i.action,
          entity_type: i.entityType,
          entity_id: i.entityId,
          changes: i.changes ?? null,
        })
        .select()
        .single(),
    );

    return map(r!);
  },
};