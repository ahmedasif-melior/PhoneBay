import { db, generateId } from "@/server/db";
import type { AdminAuditLogRecord } from "@/server/types";

interface AuditLogRow {
  id: string;
  admin_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  changes: string | null;
  created_at: string;
}

function mapRow(row: AuditLogRow): AdminAuditLogRecord {
  return {
    id: row.id,
    adminId: row.admin_id,
    action: row.action,
    entityType: row.entity_type,
    entityId: row.entity_id,
    changes: row.changes ? JSON.parse(row.changes) : null,
    createdAt: row.created_at,
  };
}

export const auditLogsRepo = {
  findById(id: string): AdminAuditLogRecord | null {
    const row = db.prepare("SELECT * FROM admin_audit_logs WHERE id = ?").get(id) as AuditLogRow | undefined;
    return row ? mapRow(row) : null;
  },

  findByAdmin(adminId: string, limit = 100): AdminAuditLogRecord[] {
    const rows = db
      .prepare("SELECT * FROM admin_audit_logs WHERE admin_id = ? ORDER BY created_at DESC LIMIT ?")
      .all(adminId, limit) as AuditLogRow[];
    return rows.map(mapRow);
  },

  findByEntity(entityType: string, entityId: string): AdminAuditLogRecord[] {
    const rows = db
      .prepare("SELECT * FROM admin_audit_logs WHERE entity_type = ? AND entity_id = ? ORDER BY created_at DESC")
      .all(entityType, entityId) as AuditLogRow[];
    return rows.map(mapRow);
  },

  findAll(limit = 500): AdminAuditLogRecord[] {
    const rows = db
      .prepare("SELECT * FROM admin_audit_logs ORDER BY created_at DESC LIMIT ?")
      .all(limit) as AuditLogRow[];
    return rows.map(mapRow);
  },

  log(input: {
    adminId: string;
    action: string;
    entityType: string;
    entityId: string;
    changes?: Record<string, unknown>;
  }): AdminAuditLogRecord {
    const id = generateId("aud_");
    db.prepare(
      `INSERT INTO admin_audit_logs (id, admin_id, action, entity_type, entity_id, changes)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).run(id, input.adminId, input.action, input.entityType, input.entityId, input.changes ? JSON.stringify(input.changes) : null);

    return this.findById(id)!;
  },
};
