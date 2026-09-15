import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  ShieldX,
  Clock,
  MessageSquare,
  ShoppingBag,
  Package,
  Star,
  User as UserIcon,
} from "lucide-react";
import { requireAdmin } from "@/server/http";
import { usersRepo } from "@/server/repositories/users";
import { listingsRepo } from "@/server/repositories/listings";
import { conversationsRepo } from "@/server/repositories/messages";
import { getAdminDb } from "@/server/db";
import { formatPKR } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = { title: "User Detail — Admin" };

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  await requireAdmin();
  const { userId } = await params;

  const user = await usersRepo.findById(userId);
  if (!user) notFound();

  const db = getAdminDb();

  const [listings, ordersAsBuyer, ordersAsSeller, conversations] = await Promise.all([
    listingsRepo.list({ sellerId: userId }, true),
    db
      .from("orders")
      .select("id, listing_id, price, status, created_at")
      .eq("buyer_id", userId)
      .order("created_at", { ascending: false })
      .limit(30),
    db
      .from("orders")
      .select("id, listing_id, price, status, created_at")
      .eq("seller_id", userId)
      .order("created_at", { ascending: false })
      .limit(30),
    conversationsRepo.listForUser(userId),
  ]);

  // Enrich conversations with the other participant's name
  const otherIds = [
    ...new Set(
      conversations.flatMap((c) =>
        [c.participant1Id, c.participant2Id].filter((id) => id && id !== userId)
      )
    ),
  ];
  const participantMap = new Map<string, string>();
  if (otherIds.length > 0) {
    const { data: pRows } = await db
      .from("users")
      .select("id, full_name")
      .in("id", otherIds);
    for (const p of pRows ?? []) participantMap.set(p.id, p.full_name ?? "User");
  }

  // Enrich orders with listing title
  const allListingIds = [
    ...new Set([
      ...(ordersAsBuyer.data ?? []).map((o: any) => o.listing_id),
      ...(ordersAsSeller.data ?? []).map((o: any) => o.listing_id),
    ]),
  ].filter(Boolean);

  const orderListingMap = new Map<string, string>();
  if (allListingIds.length > 0) {
    const { data: lRows } = await db
      .from("listings")
      .select("id, brand, model")
      .in("id", allListingIds);
    for (const l of lRows ?? []) orderListingMap.set(l.id, `${l.brand} ${l.model}`);
  }

  // Last messages per conversation
  const convIds = conversations.map((c) => c.id);
  const lastMsgMap = new Map<string, string>();
  if (convIds.length > 0) {
    const { data: msgs } = await db
      .from("messages")
      .select("conversation_id, content, created_at")
      .in("conversation_id", convIds)
      .order("created_at", { ascending: false });
    for (const m of msgs ?? []) {
      if (!lastMsgMap.has(m.conversation_id)) lastMsgMap.set(m.conversation_id, m.content ?? "");
    }
  }

  const totalRevenue = (ordersAsSeller.data ?? []).reduce(
    (s: number, o: any) => s + Number(o.price ?? 0),
    0
  );
  const totalSpent = (ordersAsBuyer.data ?? []).reduce(
    (s: number, o: any) => s + Number(o.price ?? 0),
    0
  );

  const statusColor: Record<string, string> = {
    active: "bg-verify-tint text-verify-dark border-verify/20",
    sold: "bg-brand-tint text-brand border-brand/20",
    pending: "bg-warn-tint text-warn-dark border-warn/20",
    draft: "bg-surface text-ink-soft border-border",
    paused: "bg-surface text-ink-soft border-border",
    processing: "bg-warn-tint text-warn-dark border-warn/20",
    shipped: "bg-brand-tint text-brand border-brand/20",
    delivered: "bg-verify-tint text-verify-dark border-verify/20",
    cancelled: "bg-danger-tint text-danger border-danger/20",
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/admin/users"
          className="flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink transition"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Users
        </Link>
      </div>

      {/* Profile Card */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-start gap-5">
          <div className="h-16 w-16 rounded-full bg-brand-tint flex items-center justify-center text-brand shrink-0">
            <UserIcon className="h-8 w-8" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-semibold text-ink">{user.fullName}</h1>
              <span
                className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                  user.role === "ADMIN"
                    ? "bg-brand-tint border-brand/30 text-brand"
                    : user.role === "SHOP"
                    ? "bg-verify-tint border-verify/30 text-verify-dark"
                    : "bg-surface border-border text-ink-soft"
                }`}
              >
                {user.role}
              </span>
              {user.isBlocked && <Badge tone="danger">Blocked</Badge>}
            </div>

            <div className="mt-3 flex flex-wrap gap-4 text-sm text-ink-soft">
              <span className="flex items-center gap-1.5">
                <Mail className="h-4 w-4 shrink-0" /> {user.email}
              </span>
              {user.phone && (
                <span className="flex items-center gap-1.5">
                  <Phone className="h-4 w-4 shrink-0" /> {user.phone}
                </span>
              )}
              {user.city && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 shrink-0" /> {user.city}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 shrink-0" />
                Joined {new Date(user.createdAt).toLocaleDateString("en-PK", { dateStyle: "medium" })}
              </span>
            </div>

            {/* Verification badges */}
            <div className="mt-3 flex flex-wrap gap-2">
              <span
                className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                  user.emailVerified
                    ? "bg-verify-tint text-verify-dark"
                    : "bg-surface text-ink-faint border border-border"
                }`}
              >
                {user.emailVerified ? (
                  <ShieldCheck className="h-3.5 w-3.5" />
                ) : (
                  <ShieldX className="h-3.5 w-3.5" />
                )}
                Email {user.emailVerified ? "Verified" : "Unverified"}
              </span>
              <span
                className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                  user.phoneVerified
                    ? "bg-verify-tint text-verify-dark"
                    : "bg-surface text-ink-faint border border-border"
                }`}
              >
                {user.phoneVerified ? (
                  <ShieldCheck className="h-3.5 w-3.5" />
                ) : (
                  <ShieldX className="h-3.5 w-3.5" />
                )}
                Phone {user.phoneVerified ? "Verified" : "Unverified"}
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-brand-tint text-brand">
                <Star className="h-3.5 w-3.5" />
                Trust Score: {user.trustScore.toFixed(1)}
              </span>
            </div>

            {user.isBlocked && user.blockedReason && (
              <div className="mt-3 rounded-[var(--pb-radius-sm)] bg-danger-tint border border-danger/20 px-3 py-2 text-xs text-danger-dark">
                <span className="font-semibold">Block reason:</span> {user.blockedReason}
              </div>
            )}
          </div>

          {/* Quick actions */}
          <div className="flex flex-wrap gap-2 sm:flex-col sm:shrink-0">
            <Button
              href={`/admin/users`}
              variant="outline"
              size="sm"
            >
              ← All Users
            </Button>
          </div>
        </div>

        {/* Stats strip */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5 border-t border-border">
          {[
            { label: "Listings", value: listings.length, icon: Package },
            { label: "Purchases", value: ordersAsBuyer.data?.length ?? 0, icon: ShoppingBag },
            { label: "Sales", value: ordersAsSeller.data?.length ?? 0, icon: ShoppingBag },
            { label: "Conversations", value: conversations.length, icon: MessageSquare },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-[var(--pb-radius-sm)] bg-bg flex items-center justify-center text-ink-soft shrink-0">
                <Icon className="h-4.5 w-4.5" />
              </div>
              <div>
                <p className="font-data text-xl font-semibold text-ink">{value}</p>
                <p className="text-xs text-ink-faint">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Financial summary */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="p-4">
          <p className="text-xs font-medium text-ink-faint uppercase tracking-wide">Total Earned (Sales)</p>
          <p className="mt-1 font-data text-2xl font-semibold text-verify-dark">{formatPKR(totalRevenue)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-medium text-ink-faint uppercase tracking-wide">Total Spent (Purchases)</p>
          <p className="mt-1 font-data text-2xl font-semibold text-brand">{formatPKR(totalSpent)}</p>
        </Card>
      </div>

      {/* Listings */}
      <Card className="p-0">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold text-ink flex items-center gap-2">
            <Package className="h-4.5 w-4.5 text-ink-soft" /> Listings ({listings.length})
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-bg text-xs text-ink-faint uppercase tracking-wide">
              <tr>
                <th className="px-5 py-2.5 font-medium">Device</th>
                <th className="px-5 py-2.5 font-medium">Price</th>
                <th className="px-5 py-2.5 font-medium">Status</th>
                <th className="px-5 py-2.5 font-medium">City</th>
                <th className="px-5 py-2.5 font-medium">Listed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {listings.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-6 text-center text-ink-faint">No listings yet.</td>
                </tr>
              )}
              {listings.map((l) => (
                <tr key={l.id} className="hover:bg-surface/50 transition">
                  <td className="px-5 py-3">
                    <p className="font-medium text-ink">{l.brand} {l.model}</p>
                    <p className="text-xs text-ink-faint">{l.condition}{l.verified ? " · ✓ Verified" : ""}</p>
                  </td>
                  <td className="px-5 py-3 font-data font-semibold text-ink">{formatPKR(l.price)}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border capitalize ${statusColor[l.status] ?? "bg-surface border-border text-ink-soft"}`}>
                      {l.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-ink-soft">{l.city}</td>
                  <td className="px-5 py-3 text-ink-faint text-xs">
                    {new Date(l.createdAt).toLocaleDateString("en-PK", { dateStyle: "short" })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Orders as Buyer */}
      <Card className="p-0">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="font-semibold text-ink flex items-center gap-2">
            <ShoppingBag className="h-4.5 w-4.5 text-ink-soft" />
            Purchases ({ordersAsBuyer.data?.length ?? 0})
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-bg text-xs text-ink-faint uppercase tracking-wide">
              <tr>
                <th className="px-5 py-2.5 font-medium">Device</th>
                <th className="px-5 py-2.5 font-medium">Amount</th>
                <th className="px-5 py-2.5 font-medium">Status</th>
                <th className="px-5 py-2.5 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(ordersAsBuyer.data ?? []).length === 0 && (
                <tr><td colSpan={4} className="px-5 py-6 text-center text-ink-faint">No purchases.</td></tr>
              )}
              {(ordersAsBuyer.data ?? []).map((o: any) => (
                <tr key={o.id} className="hover:bg-surface/50 transition">
                  <td className="px-5 py-3 text-ink">{orderListingMap.get(o.listing_id) ?? "Device"}</td>
                  <td className="px-5 py-3 font-data font-semibold text-ink">{formatPKR(Number(o.price))}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border capitalize ${statusColor[o.status] ?? "bg-surface border-border text-ink-soft"}`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-xs text-ink-faint">
                    {new Date(o.created_at).toLocaleDateString("en-PK", { dateStyle: "short" })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Orders as Seller */}
      <Card className="p-0">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="font-semibold text-ink flex items-center gap-2">
            <ShoppingBag className="h-4.5 w-4.5 text-ink-soft" />
            Sales ({ordersAsSeller.data?.length ?? 0})
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-bg text-xs text-ink-faint uppercase tracking-wide">
              <tr>
                <th className="px-5 py-2.5 font-medium">Device</th>
                <th className="px-5 py-2.5 font-medium">Amount</th>
                <th className="px-5 py-2.5 font-medium">Status</th>
                <th className="px-5 py-2.5 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(ordersAsSeller.data ?? []).length === 0 && (
                <tr><td colSpan={4} className="px-5 py-6 text-center text-ink-faint">No sales.</td></tr>
              )}
              {(ordersAsSeller.data ?? []).map((o: any) => (
                <tr key={o.id} className="hover:bg-surface/50 transition">
                  <td className="px-5 py-3 text-ink">{orderListingMap.get(o.listing_id) ?? "Device"}</td>
                  <td className="px-5 py-3 font-data font-semibold text-verify-dark">{formatPKR(Number(o.price))}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border capitalize ${statusColor[o.status] ?? "bg-surface border-border text-ink-soft"}`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-xs text-ink-faint">
                    {new Date(o.created_at).toLocaleDateString("en-PK", { dateStyle: "short" })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Conversations */}
      <Card className="p-0">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="font-semibold text-ink flex items-center gap-2">
            <MessageSquare className="h-4.5 w-4.5 text-ink-soft" />
            Conversations ({conversations.length})
          </h2>
        </div>
        <div className="divide-y divide-border">
          {conversations.length === 0 && (
            <p className="px-5 py-6 text-center text-sm text-ink-faint">No conversations.</p>
          )}
          {conversations.map((c) => {
            const otherId =
              c.participant1Id === userId ? c.participant2Id : c.participant1Id;
            const otherName = participantMap.get(otherId ?? "") ?? "Unknown User";
            const lastMsg = lastMsgMap.get(c.id);
            return (
              <div key={c.id} className="px-5 py-3.5 flex items-start justify-between gap-3 hover:bg-surface/50 transition">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink">
                    Chat with{" "}
                    <Link
                      href={`/admin/users/${otherId}`}
                      className="text-brand hover:underline"
                    >
                      {otherName}
                    </Link>
                  </p>
                  {lastMsg && (
                    <p className="text-xs text-ink-faint mt-0.5 truncate max-w-[420px]">
                      {lastMsg}
                    </p>
                  )}
                </div>
                <time className="text-xs text-ink-faint shrink-0">
                  {new Date(c.updatedAt).toLocaleDateString("en-PK", { dateStyle: "short" })}
                </time>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
