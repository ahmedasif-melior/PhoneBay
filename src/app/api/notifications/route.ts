import { NextRequest } from "next/server";
import { jsonOk } from "@/server/http";
import { getCurrentUser } from "@/server/http";
import { notificationsRepo } from "@/server/repositories/notifications";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return jsonOk({ notifications: [], unreadCount: 0 });
    }

    const [notifications, unreadCount] = await Promise.all([
      notificationsRepo.listForUser(user.id, user.role, 30),
      notificationsRepo.countUnread(user.id, user.role),
    ]);

    return jsonOk({ notifications, unreadCount });
  } catch (err) {
    console.error("[NOTIFICATIONS API] GET failed:", err);
    return jsonOk({ notifications: [], unreadCount: 0 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return jsonOk({ success: false });
    }

    const body = await req.json().catch(() => null);

    if (body?.action === "markAllRead") {
      await notificationsRepo.markAllRead(user.id, user.role);
      return jsonOk({ success: true });
    }

    if (body?.action === "markRead" && body?.notificationId) {
      await notificationsRepo.markRead(body.notificationId, user.id);
      return jsonOk({ success: true });
    }

    return jsonOk({ success: true });
  } catch (err) {
    console.error("[NOTIFICATIONS API] POST failed:", err);
    return jsonOk({ success: false });
  }
}
