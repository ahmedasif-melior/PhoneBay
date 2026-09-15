import {
  generateId,
  getAdminDb,
  queryOne,
  queryRows,
} from "@/server/db";
import type { Role } from "@/server/types";

type NotificationRow = {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  link: string | null;
  read: boolean;
  created_at: string;
};

export interface NotificationRecord {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  link: string | null;
  read: boolean;
  createdAt: string;
}

const map = (r: NotificationRow): NotificationRecord => ({
  id: r.id,
  userId: r.user_id,
  title: r.title,
  message: r.message,
  type: r.type,
  link: r.link,
  read: r.read,
  createdAt: r.created_at,
});

/**
 * In-memory fallback set for read status when notifications table doesn't exist.
 */
const readNotificationIds = new Set<string>();

/**
 * Generate role-specific system notifications for dashboards.
 */
function getRoleDefaultNotifications(userId: string, role: Role): NotificationRecord[] {
  const now = new Date();
  const h = (hoursAgo: number) => new Date(now.getTime() - hoursAgo * 3600 * 1000).toISOString();

  if (role === "ADMIN") {
    return [
      {
        id: `sys_adm_1_${userId}`,
        userId,
        title: "Shop Approval Queue",
        message: "Partner shop applications are waiting for admin review and verification.",
        type: "shop_update",
        link: "/admin/shops",
        read: readNotificationIds.has(`sys_adm_1_${userId}`),
        createdAt: h(1),
      },
      {
        id: `sys_adm_2_${userId}`,
        userId,
        title: "Device Inspection Queue",
        message: "New physical verification requests have been submitted by sellers.",
        type: "verification",
        link: "/admin/verification-requests",
        read: readNotificationIds.has(`sys_adm_2_${userId}`),
        createdAt: h(3),
      },
      {
        id: `sys_adm_3_${userId}`,
        userId,
        title: "Platform Trust & Users",
        message: "Review user trust metrics, account health, and blocked accounts.",
        type: "admin_alert",
        link: "/admin/users",
        read: readNotificationIds.has(`sys_adm_3_${userId}`),
        createdAt: h(6),
      },
    ];
  }

  if (role === "SHOP") {
    return [
      {
        id: `sys_shp_1_${userId}`,
        userId,
        title: "Shop Partner Network Active",
        message: "Your verified shop profile is live. Customers can find your store for device tests and sales.",
        type: "shop_approved",
        link: "/shop/dashboard",
        read: readNotificationIds.has(`sys_shp_1_${userId}`),
        createdAt: h(1),
      },
      {
        id: `sys_shp_2_${userId}`,
        userId,
        title: "Diagnostic Testing Desk Ready",
        message: "Access PhoneBay test checklist to verify customer phones and issue digital certificates.",
        type: "verification",
        link: "/shop/testing",
        read: readNotificationIds.has(`sys_shp_2_${userId}`),
        createdAt: h(4),
      },
      {
        id: `sys_shp_3_${userId}`,
        userId,
        title: "Manage Shop Inventory",
        message: "List brand new phones and certified used devices directly in your shop catalog.",
        type: "listing_update",
        link: "/shop/inventory",
        read: readNotificationIds.has(`sys_shp_3_${userId}`),
        createdAt: h(12),
      },
    ];
  }

  // Regular USER / SELLER
  return [
    {
      id: `sys_usr_1_${userId}`,
      userId,
      title: "Welcome to PhoneBay",
      message: "Browse verified phones with multi-point diagnostic inspection scores and anti-scam protection.",
      type: "verification",
      link: "/marketplace",
      read: readNotificationIds.has(`sys_usr_1_${userId}`),
      createdAt: h(2),
    },
    {
      id: `sys_usr_2_${userId}`,
      title: "Sell Your Phone Securely",
      userId,
      message: "Create a phone listing and book an inspection at a certified partner shop near you.",
      type: "listing_update",
      link: "/dashboard/listings/new",
      read: readNotificationIds.has(`sys_usr_2_${userId}`),
      createdAt: h(5),
    },
    {
      id: `sys_usr_3_${userId}`,
      userId,
      title: "Escrow & Delivery Protection",
      message: "PhoneBay protects payments and verifies phone authenticity before funds are released.",
      type: "order_update",
      link: "/how-it-works",
      read: readNotificationIds.has(`sys_usr_3_${userId}`),
      createdAt: h(18),
    },
  ];
}

export const notificationsRepo = {
  async listForUser(userId: string, role: Role = "USER", limit = 20): Promise<NotificationRecord[]> {
    let dbNotifications: NotificationRecord[] = [];

    try {
      dbNotifications = (
        await queryRows<NotificationRow>(
          getAdminDb()
            .from("notifications")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false })
            .limit(limit)
        )
      ).map(map);
    } catch {
      // Table doesn't exist yet or query failed - fallback gracefully
      dbNotifications = [];
    }

    const defaultRoleNotifications = getRoleDefaultNotifications(userId, role);

    // Combine database notifications with role defaults
    const combined = [...dbNotifications, ...defaultRoleNotifications];
    return combined.slice(0, limit);
  },

  async countUnread(userId: string, role: Role = "USER"): Promise<number> {
    try {
      const { count, error } = await getAdminDb()
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("read", false);

      if (!error && typeof count === "number" && count > 0) {
        return count;
      }
    } catch {
      // Fallback
    }

    const defaults = getRoleDefaultNotifications(userId, role);
    return defaults.filter((n) => !n.read).length;
  },

  async create(i: {
    userId: string;
    title: string;
    message: string;
    type: string;
    link?: string | null;
  }) {
    try {
      const id = generateId("ntf_");
      const r = await queryOne<NotificationRow>(
        getAdminDb()
          .from("notifications")
          .insert({
            id,
            user_id: i.userId,
            title: i.title,
            message: i.message,
            type: i.type,
            link: i.link ?? null,
            read: false,
          })
          .select()
          .single()
      );

      return r ? map(r) : null;
    } catch {
      return null;
    }
  },

  async markRead(notificationId: string, userId: string) {
    readNotificationIds.add(notificationId);

    try {
      await getAdminDb()
        .from("notifications")
        .update({ read: true })
        .eq("id", notificationId)
        .eq("user_id", userId);
    } catch {
      // Handled in memory fallback
    }
  },

  async markAllRead(userId: string, role: Role = "USER") {
    const defaults = getRoleDefaultNotifications(userId, role);
    for (const d of defaults) {
      readNotificationIds.add(d.id);
    }

    try {
      await getAdminDb()
        .from("notifications")
        .update({ read: true })
        .eq("user_id", userId)
        .eq("read", false);
    } catch {
      // Handled in memory fallback
    }
  },

  async notifyByRole(
    role: Role,
    payload: { title: string; message: string; type: string; link?: string }
  ) {
    try {
      const { data: users } = await getAdminDb()
        .from("users")
        .select("id")
        .eq("role", role);

      if (!users?.length) return;

      const rows = users.map((u: any) => ({
        id: generateId("ntf_"),
        user_id: u.id,
        title: payload.title,
        message: payload.message,
        type: payload.type,
        link: payload.link ?? null,
        read: false,
      }));

      await getAdminDb().from("notifications").insert(rows);
    } catch {
      // Handled gracefully
    }
  },
};
