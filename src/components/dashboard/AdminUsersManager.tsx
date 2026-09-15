"use client";

import * as React from "react";
import Link from "next/link";
import {
  Users,
  ShieldCheck,
  ShieldX,
  Search,
  Edit3,
  Save,
  X,
  UserCheck,
  UserX,
  Store,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

type UserItem = {
  id: string;
  full_name: string;
  email: string;
  role: string;
  trust_score: number;
  listing_count: number;
  sold_count: number;
  isBlocked?: boolean;
};

export function AdminUsersManager({ initialUsers }: { initialUsers: UserItem[] }) {
  const [users, setUsers] = React.useState<UserItem[]>(initialUsers);
  const [search, setSearch] = React.useState("");
  const [filter, setFilter] = React.useState<"all" | "USER" | "SHOP" | "ADMIN" | "blocked">("all");
  const [pendingAction, setPendingAction] = React.useState<Record<string, boolean>>({});
  const [editingUser, setEditingUser] = React.useState<UserItem | null>(null);
  const [blockReason, setBlockReason] = React.useState("");
  const [toast, setToast] = React.useState<{ msg: string; ok: boolean } | null>(null);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const handleToggleBlock = async (userId: string, currentlyBlocked: boolean) => {
    setPendingAction((p) => ({ ...p, [userId]: true }));
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          action: currentlyBlocked ? "unblock" : "block",
          reason: currentlyBlocked ? undefined : (blockReason || "Blocked by admin"),
        }),
      });
      if (!res.ok) { showToast("Action failed", false); return; }
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, isBlocked: !currentlyBlocked } : u))
      );
      showToast(currentlyBlocked ? "User unblocked." : "User blocked.");
      setBlockReason("");
    } catch {
      showToast("Network error", false);
    } finally {
      setPendingAction((p) => ({ ...p, [userId]: false }));
    }
  };

  const handleSaveEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingUser) return;
    setPendingAction((p) => ({ ...p, [editingUser.id]: true }));
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: editingUser.id,
          role: editingUser.role,
          trustScore: editingUser.trust_score,
        }),
      });
      if (!res.ok) { showToast("Save failed", false); return; }
      setUsers((prev) => prev.map((u) => (u.id === editingUser.id ? editingUser : u)));
      setEditingUser(null);
      showToast("User updated.");
    } catch {
      showToast("Network error", false);
    } finally {
      setPendingAction((p) => ({ ...p, [editingUser.id]: false }));
    }
  };

  const totalUsers = users.length;
  const shopCount = users.filter((u) => u.role === "SHOP").length;
  const blockedCount = users.filter((u) => u.isBlocked).length;

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    const matchesSearch =
      u.full_name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q);
    if (!matchesSearch) return false;
    if (filter === "blocked") return !!u.isBlocked;
    if (filter !== "all") return u.role === filter;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 rounded-[var(--pb-radius-sm)] px-4 py-2.5 text-sm font-medium text-white shadow-lg transition ${
            toast.ok ? "bg-verify-dark" : "bg-danger"
          }`}
        >
          {toast.msg}
        </div>
      )}

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-[var(--pb-radius-sm)] bg-brand-tint text-brand flex items-center justify-center shrink-0">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-ink-faint">Total Users</p>
            <p className="font-data text-2xl font-semibold text-ink">{totalUsers}</p>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-[var(--pb-radius-sm)] bg-verify-tint text-verify flex items-center justify-center shrink-0">
            <Store className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-ink-faint">Shop Accounts</p>
            <p className="font-data text-2xl font-semibold text-verify-dark">{shopCount}</p>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-[var(--pb-radius-sm)] bg-danger-tint text-danger flex items-center justify-center shrink-0">
            <ShieldX className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-ink-faint">Blocked</p>
            <p className="font-data text-2xl font-semibold text-danger">{blockedCount}</p>
          </div>
        </Card>
      </div>

      {/* Table card */}
      <Card className="p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-border">
          {/* Filter tabs */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: "all", label: `All (${totalUsers})` },
              { id: "USER", label: `Buyers` },
              { id: "SHOP", label: `Shops (${shopCount})` },
              { id: "ADMIN", label: "Admins" },
              { id: "blocked", label: `Blocked (${blockedCount})` },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilter(tab.id as typeof filter)}
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

          {/* Search */}
          <div className="relative min-w-[240px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-ink-faint" />
            <input
              type="text"
              placeholder="Search name, email, role..."
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
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Listings</th>
                <th className="px-4 py-3 font-medium">Trust</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Super Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-ink-faint text-sm">
                    No users found matching your search or filter.
                  </td>
                </tr>
              ) : (
                filtered.map((user) => (
                  <tr key={user.id} className="hover:bg-surface/50 transition">
                    <td className="px-4 py-3.5">
                      <Link href={`/admin/users/${user.id}`} className="font-semibold text-ink hover:text-brand transition block">{user.full_name}</Link>
                      <p className="text-xs text-ink-faint mt-0.5">{user.email}</p>
                    </td>
                    <td className="px-4 py-3.5">
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
                    </td>
                    <td className="px-4 py-3.5 text-ink-soft">
                      {user.listing_count}{" "}
                      <span className="text-ink-faint text-xs">({user.sold_count} sold)</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="font-data text-sm font-semibold text-ink">
                        {typeof user.trust_score === "number"
                          ? user.trust_score.toFixed(1)
                          : "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      {user.isBlocked ? (
                        <Badge tone="danger">Blocked</Badge>
                      ) : (
                        <Badge tone="verify">Active</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        {user.isBlocked ? (
                          <button
                            type="button"
                            onClick={() => handleToggleBlock(user.id, true)}
                            disabled={pendingAction[user.id]}
                            className="inline-flex items-center gap-1 rounded-full bg-verify text-white px-3 py-1 text-xs font-semibold hover:bg-verify-dark transition disabled:opacity-50"
                          >
                            <UserCheck className="h-3.5 w-3.5" /> Unblock
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleToggleBlock(user.id, false)}
                            disabled={pendingAction[user.id] || user.role === "ADMIN"}
                            className="inline-flex items-center gap-1 rounded-full border border-danger/30 text-danger px-2.5 py-1 text-xs font-medium hover:bg-danger-tint transition disabled:opacity-50"
                          >
                            <UserX className="h-3.5 w-3.5" /> Block
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setEditingUser(user)}
                          className="rounded-full border border-border bg-surface px-2.5 py-1 text-xs font-medium text-ink hover:border-brand hover:text-brand transition"
                        >
                          Edit
                        </button>
                        <Link
                          href={`/admin/users/${user.id}`}
                          className="rounded-full border border-border bg-surface px-2.5 py-1 text-xs font-medium text-ink hover:border-brand hover:text-brand transition"
                        >
                          View
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <Card className="w-full max-w-md p-6 bg-surface shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Edit3 className="h-5 w-5 text-brand" />
                <h3 className="font-semibold text-ink">Edit User</h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="text-ink-faint hover:text-ink p-1 rounded-full hover:bg-surface"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-3 text-sm text-ink-soft">
              <span className="font-medium text-ink">{editingUser.full_name}</span>{" "}
              &middot; {editingUser.email}
            </div>

            <form onSubmit={handleSaveEdit} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-medium text-ink-soft">Role</label>
                <select
                  value={editingUser.role}
                  onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                  className="mt-1 w-full rounded-[var(--pb-radius-sm)] border border-line bg-bg px-3 py-2 text-sm text-ink"
                >
                  <option value="USER">USER — Regular buyer/seller</option>
                  <option value="SHOP">SHOP — Verified shop owner</option>
                  <option value="ADMIN">ADMIN — Platform administrator</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-ink-soft">
                  Trust Score (0–10)
                </label>
                <input
                  type="number"
                  min={0}
                  max={10}
                  step={0.1}
                  value={editingUser.trust_score}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, trust_score: parseFloat(e.target.value) || 0 })
                  }
                  className="mt-1 w-full rounded-[var(--pb-radius-sm)] border border-line bg-bg px-3.5 py-2 text-sm text-ink"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
                <Button type="button" variant="outline" size="sm" onClick={() => setEditingUser(null)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" loading={pendingAction[editingUser.id]}>
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
