"use client";

import * as React from "react";
import Link from "next/link";
import {
  Bell,
  ShieldCheck,
  MessageSquare,
  Package,
  Store,
  AlertTriangle,
  Check,
  CheckCheck,
} from "lucide-react";

type Notification = {
  id: string;
  title: string;
  message: string;
  type: string;
  link: string | null;
  read: boolean;
  createdAt: string;
};

const typeIcons: Record<string, React.ReactNode> = {
  shop_approved: <ShieldCheck className="h-4 w-4 text-verify" />,
  shop_rejected: <AlertTriangle className="h-4 w-4 text-danger" />,
  new_message: <MessageSquare className="h-4 w-4 text-brand" />,
  order_update: <Package className="h-4 w-4 text-warn-dark" />,
  listing_update: <Package className="h-4 w-4 text-brand" />,
  shop_update: <Store className="h-4 w-4 text-verify" />,
  admin_alert: <AlertTriangle className="h-4 w-4 text-danger" />,
  verification: <ShieldCheck className="h-4 w-4 text-brand" />,
};

export function NotificationBell() {
  const [open, setOpen] = React.useState(false);
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  const fetchNotifications = React.useCallback(async () => {
    try {
      const res = await fetch("/api/notifications");
      if (!res.ok) return;
      const data = await res.json();
      setNotifications(data.notifications ?? []);
      setUnreadCount(data.unreadCount ?? 0);
    } catch {
      // fail silently — notifications table may not exist yet
    }
  }, []);

  // Fetch on mount & poll every 30 seconds
  React.useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30_000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Close dropdown on outside click
  React.useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const handleMarkAllRead = async () => {
    setLoading(true);
    try {
      await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "markAllRead" }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (notificationId: string) => {
    try {
      await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "markRead", notificationId }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // ignore
    }
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-label="Notifications"
        className="relative h-10 w-10 rounded-full flex items-center justify-center hover:bg-black/[0.04] transition"
      >
        <Bell className="h-5 w-5 text-ink-soft" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex items-center justify-center h-4.5 min-w-[18px] rounded-full bg-danger text-white text-[10px] font-bold px-1">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-[360px] max-h-[480px] bg-surface border border-border rounded-[var(--pb-radius-md)] shadow-lg overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-bg shrink-0">
            <h3 className="text-sm font-semibold text-ink">Notifications</h3>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                disabled={loading}
                className="text-xs text-brand font-medium hover:underline disabled:opacity-50 flex items-center gap-1"
              >
                <CheckCheck className="h-3.5 w-3.5" /> Mark all read
              </button>
            )}
          </div>

          {/* Notification list */}
          <div className="overflow-y-auto flex-1">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <Bell className="h-8 w-8 text-ink-faint mx-auto mb-2" />
                <p className="text-sm text-ink-faint">No notifications yet</p>
                <p className="text-xs text-ink-faint mt-0.5">
                  You{"'"}ll be notified about orders, messages, and shop updates.
                </p>
              </div>
            ) : (
              notifications.map((n) => {
                const content = (
                  <div
                    key={n.id}
                    className={`px-4 py-3 flex items-start gap-3 border-b border-border/50 hover:bg-bg/50 transition cursor-pointer ${
                      !n.read ? "bg-brand-tint/30" : ""
                    }`}
                    onClick={() => {
                      if (!n.read) handleMarkRead(n.id);
                    }}
                  >
                    <div className="h-8 w-8 rounded-full bg-bg flex items-center justify-center shrink-0 mt-0.5">
                      {typeIcons[n.type] ?? <Bell className="h-4 w-4 text-ink-faint" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm leading-snug ${!n.read ? "font-semibold text-ink" : "text-ink"}`}>
                          {n.title}
                        </p>
                        {!n.read && (
                          <span className="h-2 w-2 rounded-full bg-brand shrink-0 mt-1.5" />
                        )}
                      </div>
                      <p className="text-xs text-ink-soft mt-0.5 line-clamp-2">{n.message}</p>
                      <p className="text-[10px] text-ink-faint mt-1">{timeAgo(n.createdAt)}</p>
                    </div>
                  </div>
                );

                if (n.link) {
                  return (
                    <Link key={n.id} href={n.link} onClick={() => setOpen(false)}>
                      {content}
                    </Link>
                  );
                }
                return <div key={n.id}>{content}</div>;
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
