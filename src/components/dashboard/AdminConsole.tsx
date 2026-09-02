"use client";

import * as React from "react";
import Link from "next/link";
import { Activity, BadgeDollarSign, ShieldCheck, Users, MessageSquareText } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatPKR } from "@/lib/utils";

type ListingRow = {
  id: string;
  model: string;
  brand: string;
  status: string;
  price: number;
  seller: string;
};

type UserRow = {
  id: string;
  full_name: string;
  email: string;
  role: string;
  trust_score: number;
  listing_count: number;
  sold_count: number;
};

type ConversationRow = {
  id: string;
  buyer_name: string;
  seller_name: string;
  listing_name: string;
  last_text: string;
  created_at: string;
};

type OrderRow = {
  id: string;
  status: string;
  price: number;
  created_at: string;
  listing_name: string;
  buyer_name: string;
  seller_name: string;
};

type ShopRow = {
  id: string;
  shop_name: string;
  owner_name: string;
  verified: number;
  services: string;
  email: string;
  city: string;
};

type VerificationRow = {
  id: string;
  status: string;
  requested_at: string;
  score: number | null;
  brand: string;
  model: string;
  seller_name: string;
};

function formatDateLabel(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toISOString().slice(0, 10);
}

type StageItem = {
  label: string;
  value: number;
};

export function AdminConsole({
  initialListings,
  initialUsers,
  initialConversations,
  initialOrders,
  initialShops,
  initialVerifications,
  stats,
  pipelines,
}: {
  initialListings: ListingRow[];
  initialUsers: UserRow[];
  initialConversations: ConversationRow[];
  initialOrders: OrderRow[];
  initialShops: ShopRow[];
  initialVerifications: VerificationRow[];
  stats: {
    totalUsers: number;
    totalSellers: number;
    totalShopkeepers: number;
    totalPhonesListed: number;
    activeListings: number;
    totalSold: number;
    pendingVerification: number;
    revenue: number;
  };
  pipelines: {
    users: StageItem[];
    listings: StageItem[];
    orders: StageItem[];
    messages: StageItem[];
    shops: StageItem[];
    verification: StageItem[];
  };
}) {
  const [listings, setListings] = React.useState(initialListings);
  const [pending, setPending] = React.useState<Record<string, boolean>>({});

  const updateStatus = async (id: string, status: string) => {
    setPending((prev) => ({ ...prev, [id]: true }));
    try {
      const response = await fetch(`/api/admin/listings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) return;
      const payload = await response.json();
      setListings((prev) =>
        prev.map((listing) => (listing.id === id ? { ...listing, status: payload.listing.status } : listing))
      );
    } finally {
      setPending((prev) => ({ ...prev, [id]: false }));
    }
  };

  const adminCards = [
    { label: "Total users", value: stats.totalUsers, icon: Users },
    { label: "Sellers", value: stats.totalSellers, icon: Activity },
    { label: "Shopkeepers", value: stats.totalShopkeepers, icon: ShieldCheck },
    { label: "Phones listed", value: stats.totalPhonesListed, icon: BadgeDollarSign },
    { label: "Phones sold", value: stats.totalSold, icon: Activity },
    { label: "Verification queue", value: stats.pendingVerification, icon: ShieldCheck },
    { label: "Active market", value: stats.activeListings, icon: Users },
    { label: "Sales audit", value: formatPKR(stats.revenue), icon: BadgeDollarSign },
  ];

  const StageProgression = ({ title, stages }: { title: string; stages: StageItem[] }) => (
    <div className="mt-5 rounded-[var(--pb-radius-md)] border border-border bg-bg p-4">
      <h3 className="text-sm font-semibold uppercase tracking-[0.08em] text-ink-faint">{title}</h3>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {stages.map((stage) => (
          <div key={stage.label} className="rounded-[var(--pb-radius-sm)] border border-border bg-surface p-3">
            <p className="text-xs text-ink-faint">{stage.label}</p>
            <p className="mt-2 font-data text-2xl font-semibold text-ink">{stage.value}</p>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div id="overview">
        <p className="text-sm uppercase tracking-[0.12em] text-brand font-medium">Admin console</p>
        <h1 className="mt-2 text-3xl font-semibold text-ink">Marketplace operations overview</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {adminCards.map(({ label, value, icon: Icon }) => (
          <Card key={label} className="p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm text-ink-faint">{label}</p>
                <p className="mt-2 font-data text-3xl font-semibold text-ink">{String(value)}</p>
              </div>
              <span className="flex h-11 w-11 items-center justify-center rounded-[var(--pb-radius-sm)] bg-brand-tint text-brand">
                <Icon className="h-5 w-5" />
              </span>
            </div>
          </Card>
        ))}
      </div>

      <div id="users" className="space-y-6">
        <Card className="p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-ink">User account overview</h2>
            <Link href="/admin/users" className="text-sm font-medium text-brand">View all</Link>
          </div>
          <StageProgression title="Stage progression" stages={pipelines.users} />
          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-ink-faint">
                  <th className="pb-2 pr-4">Name</th>
                  <th className="pb-2 pr-4">Role</th>
                  <th className="pb-2 pr-4">Listings</th>
                  <th className="pb-2 pr-4">Sold</th>
                  <th className="pb-2 pr-4">Trust</th>
                </tr>
              </thead>
              <tbody>
                {initialUsers.map((userRow) => (
                  <tr key={userRow.id} className="border-b border-border last:border-b-0">
                    <td className="py-3 pr-4 text-ink">{userRow.full_name}</td>
                    <td className="py-3 pr-4 text-ink-soft">{userRow.role}</td>
                    <td className="py-3 pr-4 text-ink-soft">{userRow.listing_count}</td>
                    <td className="py-3 pr-4 text-ink-soft">{userRow.sold_count}</td>
                    <td className="py-3 pr-4 text-ink-soft">{userRow.trust_score.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <div id="listings" className="grid gap-6 xl:grid-cols-2">
        <Card className="p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-ink">Marketplace moderation</h2>
            <Link href="/admin/listings" className="text-sm font-medium text-brand">View all</Link>
          </div>
          <StageProgression title="Stage progression" stages={pipelines.listings} />
          <div className="mt-5 space-y-3">
            {listings.map((listing) => (
              <div key={listing.id} className="rounded-[var(--pb-radius-md)] border border-border bg-bg p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-ink">{listing.brand} {listing.model}</p>
                    <p className="text-xs text-ink-faint">Seller: {listing.seller}</p>
                  </div>
                  <Badge tone={listing.status === "active" ? "verify" : listing.status === "paused" ? "warn" : "neutral"}>{listing.status}</Badge>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {listing.status === "sold" ? (
                    <span className="rounded-full border border-border-strong bg-surface px-2.5 py-1 text-xs font-medium text-ink">Sold and locked</span>
                  ) : (
                    [
                      ["active", "Approve"],
                      ["paused", "Pause"],
                      ["pending", "Review"],
                      ["sold", "Mark sold"],
                    ].map(([nextStatus, label]) => (
                      <button
                        key={label}
                        type="button"
                        onClick={() => updateStatus(listing.id, nextStatus)}
                        disabled={pending[listing.id] || listing.status === nextStatus}
                        className="rounded-full border border-border-strong bg-surface px-2.5 py-1 text-xs font-medium text-ink disabled:opacity-50"
                      >
                        {label}
                      </button>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div id="orders">
          <Card className="p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-semibold text-ink">Recent orders</h2>
              <Link href="/admin/orders" className="text-sm font-medium text-brand">View all</Link>
            </div>
            <StageProgression title="Stage progression" stages={pipelines.orders} />
            <div className="mt-5 space-y-3">
              {initialOrders.length === 0 ? (
                <p className="text-sm text-ink-faint">No orders yet.</p>
              ) : (
                initialOrders.map((order) => (
                  <div key={order.id} className="rounded-[var(--pb-radius-md)] border border-border bg-bg p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-medium text-ink">{order.listing_name}</p>
                        <p className="text-xs text-ink-faint">{order.buyer_name} → {order.seller_name}</p>
                      </div>
                      <Badge tone={order.status === "delivered" ? "verify" : order.status === "cancelled" ? "warn" : "neutral"}>{order.status}</Badge>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-sm text-ink-soft">
                      <span>{formatDateLabel(order.created_at)}</span>
                      <span>{formatPKR(order.price)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>

      <div id="messages" className="space-y-6">
        <Card className="p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-ink">Live chat overview</h2>
            <Link href="/admin/messages" className="text-sm font-medium text-brand">View all</Link>
          </div>
          <StageProgression title="Stage progression" stages={pipelines.messages} />
          <div className="mt-5 space-y-3">
            {initialConversations.length === 0 ? (
              <p className="text-sm text-ink-faint">No active chats yet.</p>
            ) : (
              initialConversations.map((conversation) => (
                <div key={conversation.id} className="rounded-[var(--pb-radius-md)] border border-border bg-bg p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-ink">{conversation.buyer_name} → {conversation.seller_name}</p>
                    <span className="flex items-center gap-1 text-xs text-ink-faint"><MessageSquareText className="h-3.5 w-3.5" /> {formatDateLabel(conversation.created_at)}</span>
                  </div>
                  <p className="mt-1 text-xs text-ink-faint">Listing: {conversation.listing_name}</p>
                  <p className="mt-2 text-sm text-ink-soft">{conversation.last_text}</p>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      <div id="shops" className="space-y-6">
        <Card className="p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-ink">Verified shop network</h2>
            <Link href="/admin/shops" className="text-sm font-medium text-brand">View all</Link>
          </div>
          <StageProgression title="Stage progression" stages={pipelines.shops} />
          <div className="mt-5 space-y-3">
            {initialShops.length === 0 ? (
              <p className="text-sm text-ink-faint">No shops registered yet.</p>
            ) : (
              initialShops.map((shop) => (
                <div key={shop.id} className="rounded-[var(--pb-radius-md)] border border-border bg-bg p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-ink">{shop.shop_name}</p>
                      <p className="text-xs text-ink-faint">Owner: {shop.owner_name} · {shop.city}</p>
                    </div>
                    <Badge tone={shop.verified ? "verify" : "warn"}>{shop.verified ? "Verified" : "Pending"}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-ink-soft">{shop.services || "No service list added yet."}</p>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      <div id="verification" className="space-y-6">
        <Card className="p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-ink">Verification queue</h2>
            <Link href="/admin/verification-requests" className="text-sm font-medium text-brand">View all</Link>
          </div>
          <StageProgression title="Stage progression" stages={pipelines.verification} />
          <div className="mt-5 space-y-3">
            {initialVerifications.length === 0 ? (
              <p className="text-sm text-ink-faint">No verification requests.</p>
            ) : (
              initialVerifications.map((item) => (
                <div key={item.id} className="rounded-[var(--pb-radius-md)] border border-border bg-bg p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-ink">{item.brand} {item.model}</p>
                      <p className="text-xs text-ink-faint">Seller: {item.seller_name}</p>
                    </div>
                    <Badge tone={item.status === "completed" ? "verify" : item.status === "in_progress" ? "warn" : "neutral"}>{item.status}</Badge>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-sm text-ink-soft">
                    <span>{formatDateLabel(item.requested_at)}</span>
                    <span>{item.score ? `${item.score.toFixed(1)}/10` : "Awaiting score"}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
