"use client";

import * as React from "react";
import Link from "next/link";
import { Store, ShieldCheck, Clock, Ban, CheckCircle2, XCircle, Search, Edit3, Save, X } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

type ShopItem = {
  id: string;
  shop_name: string;
  shop_type: string;
  owner_name: string;
  verified: number;
  services: string;
  email: string;
  city: string;
};

export function AdminShopsManager({ initialShops }: { initialShops: ShopItem[] }) {
  const [shops, setShops] = React.useState<ShopItem[]>(initialShops);
  const [search, setSearch] = React.useState("");
  const [filter, setFilter] = React.useState<"all" | "pending" | "approved" | "inactive">("all");
  const [pendingAction, setPendingAction] = React.useState<Record<string, boolean>>({});
  const [editingShop, setEditingShop] = React.useState<ShopItem | null>(null);

  const handleVerify = async (shopId: string, status: "approved" | "rejected") => {
    setPendingAction((prev) => ({ ...prev, [shopId]: true }));
    try {
      const res = await fetch("/api/admin/shops", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shopId, status }),
      });
      if (!res.ok) return;
      setShops((prev) =>
        prev.map((s) => (s.id === shopId ? { ...s, verified: status === "approved" ? 1 : 0 } : s))
      );
    } catch (err) {
      console.error("Failed to update shop status:", err);
    } finally {
      setPendingAction((prev) => ({ ...prev, [shopId]: false }));
    }
  };

  const handleSaveEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingShop) return;

    setPendingAction((prev) => ({ ...prev, [editingShop.id]: true }));
    try {
      const res = await fetch("/api/admin/shops", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shopId: editingShop.id,
          shopName: editingShop.shop_name,
          city: editingShop.city,
          shopType: editingShop.shop_type,
          services: editingShop.services,
          shopEmail: editingShop.email,
        }),
      });

      if (res.ok) {
        setShops((prev) => prev.map((s) => (s.id === editingShop.id ? editingShop : s)));
        setEditingShop(null);
      }
    } catch (err) {
      console.error("Failed to save shop edits:", err);
    } finally {
      setPendingAction((prev) => ({ ...prev, [editingShop.id]: false }));
    }
  };

  const filteredShops = shops.filter((s) => {
    const matchesSearch =
      s.shop_name.toLowerCase().includes(search.toLowerCase()) ||
      s.owner_name.toLowerCase().includes(search.toLowerCase()) ||
      s.city.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;
    if (filter === "pending") return !s.verified;
    if (filter === "approved") return !!s.verified;
    return true;
  });

  const totalShops = shops.length;
  const approvedShops = shops.filter((s) => s.verified).length;
  const pendingShops = shops.filter((s) => !s.verified).length;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-[var(--pb-radius-sm)] bg-brand-tint text-brand flex items-center justify-center shrink-0">
            <Store className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-ink-faint">Total Shops</p>
            <p className="font-data text-2xl font-semibold text-ink">{totalShops}</p>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-[var(--pb-radius-sm)] bg-verify-tint text-verify flex items-center justify-center shrink-0">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-ink-faint">Verified / Approved</p>
            <p className="font-data text-2xl font-semibold text-verify-dark">{approvedShops}</p>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-[var(--pb-radius-sm)] bg-warn-tint text-warn flex items-center justify-center shrink-0">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-ink-faint">Pending Approval</p>
            <p className="font-data text-2xl font-semibold text-warn-dark">{pendingShops}</p>
          </div>
        </Card>
      </div>

      <Card className="p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-border">
          <div className="flex flex-wrap gap-2">
            {[
              { id: "all", label: `All (${totalShops})` },
              { id: "pending", label: `Pending Approval (${pendingShops})` },
              { id: "approved", label: `Approved (${approvedShops})` },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilter(tab.id as any)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                  filter === tab.id
                    ? "bg-brand text-white"
                    : "bg-surface border border-border text-ink-soft hover:text-ink"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative min-w-[240px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-ink-faint" />
            <input
              type="text"
              placeholder="Search shop, owner, city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-[var(--pb-radius-sm)] border border-line bg-surface pl-9 pr-3 py-1.5 text-xs text-ink placeholder:text-ink-faint focus:outline-none focus:border-brand"
            />
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-bg text-ink-faint text-xs uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3 font-medium">Shop Name</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Owner</th>
                <th className="px-4 py-3 font-medium">City / Contact</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Super Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredShops.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-ink-faint text-sm">
                    No shops found matching your search or filter.
                  </td>
                </tr>
              ) : (
                filteredShops.map((shop) => (
                  <tr key={shop.id} className="hover:bg-surface/50 transition">
                    <td className="px-4 py-3.5">
                      <Link href={`/admin/shops/${shop.id}`} className="font-semibold text-ink hover:text-brand transition">{shop.shop_name}</Link>
                      {shop.services && (
                        <p className="text-xs text-ink-faint line-clamp-1 mt-0.5">{shop.services}</p>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-surface border border-border text-ink-soft">
                        {shop.shop_type === "new_phones" ? "New Stock Only" : "General Store"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-ink-soft">{shop.owner_name}</td>
                    <td className="px-4 py-3.5">
                      <p className="text-ink">{shop.city || "—"}</p>
                      <p className="text-xs text-ink-faint">{shop.email}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge tone={shop.verified ? "verify" : "warn"}>
                        {shop.verified ? "Approved" : "Pending Review"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5 text-right space-x-2">
                      {!shop.verified ? (
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleVerify(shop.id, "approved")}
                            disabled={pendingAction[shop.id]}
                            className="rounded-full bg-brand px-3 py-1 text-xs font-semibold text-white hover:bg-brand-dark transition disabled:opacity-50"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => handleVerify(shop.id, "rejected")}
                            disabled={pendingAction[shop.id]}
                            className="rounded-full border border-border px-2.5 py-1 text-xs font-medium text-ink hover:bg-surface transition disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleVerify(shop.id, "rejected")}
                          disabled={pendingAction[shop.id]}
                          className="rounded-full border border-danger/30 text-danger px-2.5 py-1 text-xs font-medium hover:bg-danger-tint transition disabled:opacity-50"
                        >
                          Revoke
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => setEditingShop(shop)}
                        className="rounded-full border border-border bg-surface px-2.5 py-1 text-xs font-medium text-ink hover:border-brand hover:text-brand transition"
                      >
                        Edit
                      </button>

                      <Link
                        href={`/admin/shops/${shop.id}`}
                        className="rounded-full border border-border bg-surface px-2.5 py-1 text-xs font-medium text-ink hover:border-brand hover:text-brand transition"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Edit Shop Modal */}
      {editingShop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <Card className="w-full max-w-lg p-6 bg-surface shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Edit3 className="h-5 w-5 text-brand" />
                <h3 className="font-semibold text-ink">Edit Shop Details</h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingShop(null)}
                className="text-ink-faint hover:text-ink p-1 rounded-full hover:bg-surface"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-medium text-ink-soft">Shop Name</label>
                <input
                  type="text"
                  value={editingShop.shop_name}
                  onChange={(e) => setEditingShop({ ...editingShop, shop_name: e.target.value })}
                  className="mt-1 w-full rounded-[var(--pb-radius-sm)] border border-line bg-bg px-3.5 py-2 text-sm text-ink"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-ink-soft">City</label>
                  <input
                    type="text"
                    value={editingShop.city}
                    onChange={(e) => setEditingShop({ ...editingShop, city: e.target.value })}
                    className="mt-1 w-full rounded-[var(--pb-radius-sm)] border border-line bg-bg px-3.5 py-2 text-sm text-ink"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-ink-soft">Shop Type</label>
                  <select
                    value={editingShop.shop_type}
                    onChange={(e) => setEditingShop({ ...editingShop, shop_type: e.target.value })}
                    className="mt-1 w-full rounded-[var(--pb-radius-sm)] border border-line bg-bg px-3 py-2 text-sm text-ink"
                  >
                    <option value="general">General (New + Used)</option>
                    <option value="new_phones">New Phones Only</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-ink-soft">Contact Email</label>
                <input
                  type="email"
                  value={editingShop.email}
                  onChange={(e) => setEditingShop({ ...editingShop, email: e.target.value })}
                  className="mt-1 w-full rounded-[var(--pb-radius-sm)] border border-line bg-bg px-3.5 py-2 text-sm text-ink"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-ink-soft">Services Offered</label>
                <input
                  type="text"
                  value={editingShop.services}
                  onChange={(e) => setEditingShop({ ...editingShop, services: e.target.value })}
                  placeholder="e.g. Diagnostics, Screen Repairs, Buyback"
                  className="mt-1 w-full rounded-[var(--pb-radius-sm)] border border-line bg-bg px-3.5 py-2 text-sm text-ink"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
                <Button type="button" variant="outline" size="sm" onClick={() => setEditingShop(null)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" loading={pendingAction[editingShop.id]}>
                  <Save className="h-4 w-4 mr-1.5" /> Save Changes
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
