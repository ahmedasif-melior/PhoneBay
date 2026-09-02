import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser, isAdminRole } from "@/server/http";
import { db } from "@/server/db";
import { AdminConsole } from "@/components/dashboard/AdminConsole";

export const metadata: Metadata = { title: "Admin Console" };

export default async function AdminOverviewPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/sign-in");
  if (!isAdminRole(user.role)) redirect("/dashboard");

  const stats = {
    totalUsers: Number((db.prepare("SELECT COUNT(*) as count FROM users WHERE role IN ('USER', 'SHOP', 'ADMIN')").get() as { count: number }).count),
    totalSellers: Number((db.prepare("SELECT COUNT(DISTINCT seller_id) as count FROM listings").get() as { count: number }).count),
    totalShopkeepers: Number((db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'SHOP'").get() as { count: number }).count),
    totalPhonesListed: Number((db.prepare("SELECT COUNT(*) as count FROM listings").get() as { count: number }).count),
    activeListings: Number((db.prepare("SELECT COUNT(*) as count FROM listings WHERE status = 'active'").get() as { count: number }).count),
    totalSold: Number((db.prepare("SELECT COUNT(*) as count FROM listings WHERE status = 'sold'").get() as { count: number }).count),
    pendingVerification: Number((db.prepare("SELECT COUNT(*) as count FROM verification_requests WHERE status != 'completed'").get() as { count: number }).count),
    revenue: Number((db.prepare("SELECT COALESCE(SUM(price), 0) as total FROM orders").get() as { total: number }).total),
  };

  const pipeline = {
    users: [
      { label: "New signups", value: Number((db.prepare("SELECT COUNT(*) as count FROM users WHERE created_at >= datetime('now', '-30 days')").get() as { count: number }).count) },
      { label: "Active buyers", value: Number((db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'USER'").get() as { count: number }).count) },
      { label: "Sellers", value: Number((db.prepare("SELECT COUNT(DISTINCT seller_id) as count FROM listings").get() as { count: number }).count) },
      { label: "Shop accounts", value: Number((db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'SHOP'").get() as { count: number }).count) },
      { label: "Verified users", value: Number((db.prepare("SELECT COUNT(*) as count FROM users WHERE email_verified = 1 OR phone_verified = 1").get() as { count: number }).count) },
    ],
    listings: [
      { label: "New listings", value: Number((db.prepare("SELECT COUNT(*) as count FROM listings WHERE created_at >= datetime('now', '-30 days')").get() as { count: number }).count) },
      { label: "Active", value: Number((db.prepare("SELECT COUNT(*) as count FROM listings WHERE status = 'active'").get() as { count: number }).count) },
      { label: "Pending review", value: Number((db.prepare("SELECT COUNT(*) as count FROM listings WHERE status = 'pending'").get() as { count: number }).count) },
      { label: "Sold", value: Number((db.prepare("SELECT COUNT(*) as count FROM listings WHERE status = 'sold'").get() as { count: number }).count) },
      { label: "Paused", value: Number((db.prepare("SELECT COUNT(*) as count FROM listings WHERE status = 'paused'").get() as { count: number }).count) },
    ],
    orders: [
      { label: "New orders", value: Number((db.prepare("SELECT COUNT(*) as count FROM orders WHERE created_at >= datetime('now', '-30 days')").get() as { count: number }).count) },
      { label: "Processing", value: Number((db.prepare("SELECT COUNT(*) as count FROM orders WHERE status = 'processing'").get() as { count: number }).count) },
      { label: "Shipped", value: Number((db.prepare("SELECT COUNT(*) as count FROM orders WHERE status = 'shipped'").get() as { count: number }).count) },
      { label: "Delivered", value: Number((db.prepare("SELECT COUNT(*) as count FROM orders WHERE status = 'delivered'").get() as { count: number }).count) },
      { label: "Cancelled", value: Number((db.prepare("SELECT COUNT(*) as count FROM orders WHERE status = 'cancelled'").get() as { count: number }).count) },
    ],
    messages: [
      { label: "Conversations", value: Number((db.prepare("SELECT COUNT(*) as count FROM conversations").get() as { count: number }).count) },
      { label: "Active threads", value: Number((db.prepare("SELECT COUNT(*) as count FROM conversations WHERE updated_at >= datetime('now', '-7 days')").get() as { count: number }).count) },
      { label: "Messages", value: Number((db.prepare("SELECT COUNT(*) as count FROM messages").get() as { count: number }).count) },
      { label: "Unread", value: Number((db.prepare("SELECT COUNT(*) as count FROM messages WHERE read = 0").get() as { count: number }).count) },
      { label: "Converted leads", value: Number((db.prepare("SELECT COUNT(*) as count FROM orders").get() as { count: number }).count) },
    ],
    shops: [
      { label: "Total shops", value: Number((db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'SHOP'").get() as { count: number }).count) },
      { label: "Verified", value: Number((db.prepare("SELECT COUNT(*) as count FROM shop_profiles WHERE verified = 1").get() as { count: number }).count) },
      { label: "Pending", value: Number((db.prepare("SELECT COUNT(*) as count FROM shop_profiles WHERE verified = 0").get() as { count: number }).count) },
      { label: "Services", value: Number((db.prepare("SELECT COUNT(*) as count FROM shop_profiles WHERE services != ''").get() as { count: number }).count) },
      { label: "Active stores", value: Number((db.prepare("SELECT COUNT(*) as count FROM shop_profiles").get() as { count: number }).count) },
    ],
    verification: [
      { label: "Pending", value: Number((db.prepare("SELECT COUNT(*) as count FROM verification_requests WHERE status = 'pending'").get() as { count: number }).count) },
      { label: "In progress", value: Number((db.prepare("SELECT COUNT(*) as count FROM verification_requests WHERE status = 'in_progress'").get() as { count: number }).count) },
      { label: "Completed", value: Number((db.prepare("SELECT COUNT(*) as count FROM verification_requests WHERE status = 'completed'").get() as { count: number }).count) },
      { label: "Awaiting score", value: Number((db.prepare("SELECT COUNT(*) as count FROM verification_requests WHERE score IS NULL").get() as { count: number }).count) },
      { label: "Queue", value: Number((db.prepare("SELECT COUNT(*) as count FROM verification_requests WHERE status != 'completed'").get() as { count: number }).count) },
    ],
  };

  const recentListings = (db.prepare(
    `SELECT l.id, l.model, l.brand, l.status, l.price, u.full_name AS seller
     FROM listings l JOIN users u ON u.id = l.seller_id ORDER BY l.created_at DESC LIMIT 8`
  ).all() as Array<{ id: string; model: string; brand: string; status: string; price: number; seller: string }>).map((row) => ({ ...row }));

  const usersWithListings = (db.prepare(
    `SELECT u.id, u.full_name, u.email, u.role, u.trust_score, COUNT(l.id) as listing_count,
            COALESCE(SUM(CASE WHEN l.status = 'sold' THEN 1 ELSE 0 END), 0) AS sold_count
     FROM users u
     LEFT JOIN listings l ON l.seller_id = u.id
     GROUP BY u.id
     ORDER BY listing_count DESC, u.created_at DESC LIMIT 8`
  ).all() as Array<{ id: string; full_name: string; email: string; role: string; trust_score: number; listing_count: number; sold_count: number }>).map((row) => ({ ...row }));

  const conversations = (db.prepare(
    `SELECT c.id, bu.full_name AS buyer_name, su.full_name AS seller_name, l.model AS listing_name, m.text AS last_text, c.created_at
     FROM conversations c
     LEFT JOIN listings l ON l.id = c.listing_id
     LEFT JOIN users bu ON bu.id = c.buyer_id
     LEFT JOIN users su ON su.id = c.seller_id
     LEFT JOIN messages m ON m.id = (
       SELECT msg.id FROM messages msg WHERE msg.conversation_id = c.id ORDER BY msg.created_at DESC LIMIT 1
     )
     ORDER BY c.updated_at DESC LIMIT 6`
  ).all() as Array<{ id: string; buyer_name: string; seller_name: string; listing_name: string; last_text: string; created_at: string }>).map((row) => ({ ...row }));

  const recentOrders = (db.prepare(
    `SELECT o.id, o.status, o.price, o.created_at, l.model AS listing_name, u.full_name AS buyer_name, s.full_name AS seller_name
     FROM orders o
     JOIN listings l ON l.id = o.listing_id
     JOIN users u ON u.id = o.buyer_id
     JOIN users s ON s.id = l.seller_id
     ORDER BY o.created_at DESC LIMIT 6`
  ).all() as Array<{ id: string; status: string; price: number; created_at: string; listing_name: string; buyer_name: string; seller_name: string }>).map((row) => ({ ...row }));

  const recentShops = (db.prepare(
    `SELECT sp.id, sp.shop_name, u.full_name AS owner_name, sp.verified, sp.services, u.email, u.city
     FROM shop_profiles sp
     JOIN users u ON u.id = sp.user_id
     ORDER BY sp.created_at DESC LIMIT 6`
  ).all() as Array<{ id: string; shop_name: string; owner_name: string; verified: number; services: string; email: string; city: string }>).map((row) => ({ ...row }));

  const verificationQueue = (db.prepare(
    `SELECT vr.id, vr.status, vr.requested_at, vr.score, l.brand, l.model, u.full_name AS seller_name
     FROM verification_requests vr
     JOIN listings l ON l.id = vr.listing_id
     JOIN users u ON u.id = l.seller_id
     ORDER BY vr.requested_at DESC LIMIT 6`
  ).all() as Array<{ id: string; status: string; requested_at: string; score: number | null; brand: string; model: string; seller_name: string }>).map((row) => ({ ...row }));

  return (
    <AdminConsole
      initialListings={recentListings}
      initialUsers={usersWithListings}
      initialConversations={conversations}
      initialOrders={recentOrders}
      initialShops={recentShops}
      initialVerifications={verificationQueue}
      stats={stats}
      pipelines={pipeline}
    />
  );
}
