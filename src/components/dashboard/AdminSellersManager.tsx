"use client";

import * as React from "react";
import Link from "next/link";
import {
  User,
  ShieldCheck,
  ShieldAlert,
  Smartphone,
  Eye,
  Edit3,
  Ban,
  CheckCircle2,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import { AdminDataGrid, type ColumnDef, type FilterConfig } from "@/components/dashboard/AdminDataGrid";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { formatPKR } from "@/lib/utils";

type SellerRow = {
  id: string;
  full_name: string;
  email: string;
  role: string;
  trust_score: number;
  listing_count: number;
  sold_count: number;
  isBlocked: boolean;
};

export function AdminSellersManager({ initialSellers }: { initialSellers: SellerRow[] }) {
  const [sellers, setSellers] = React.useState<SellerRow[]>(initialSellers);
  const [inspectSeller, setInspectSeller] = React.useState<SellerRow | null>(null);
  const [editScoreSeller, setEditScoreSeller] = React.useState<SellerRow | null>(null);
  const [newScore, setNewScore] = React.useState("9.0");
  const [toast, setToast] = React.useState<{ msg: string; type: "success" | "error" } | null>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleToggleBlock = async (id: string, isBlocked: boolean) => {
    try {
      await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: id,
          action: isBlocked ? "unblock" : "block",
          reason: isBlocked ? undefined : "Seller flagged by marketplace moderation",
        }),
      });

      setSellers((prev) =>
        prev.map((s) => (s.id === id ? { ...s, isBlocked: !isBlocked } : s))
      );
      showToast(isBlocked ? "Seller unrestricted" : "Seller restricted");
    } catch {
      showToast("Failed to update seller status", "error");
    }
  };

  const handleSaveScore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editScoreSeller) return;
    const scoreVal = parseFloat(newScore);
    const validScore = isNaN(scoreVal) ? editScoreSeller.trust_score : scoreVal;

    try {
      await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: editScoreSeller.id,
          trustScore: validScore,
        }),
      });

      setSellers((prev) =>
        prev.map((s) =>
          s.id === editScoreSeller.id ? { ...s, trust_score: validScore } : s
        )
      );
      showToast("Trust score updated successfully");
      setEditScoreSeller(null);
    } catch {
      showToast("Failed to update score", "error");
    }
  };

  const columns: ColumnDef<SellerRow>[] = [
    {
      id: "name",
      header: "Seller",
      sortable: true,
      accessor: (r) => r.full_name,
      cell: (r) => (
        <div>
          <p className="font-semibold text-ink text-xs">{r.full_name}</p>
          <p className="text-[11px] text-ink-faint">{r.email}</p>
        </div>
      ),
    },
    {
      id: "type",
      header: "Account Type",
      sortable: true,
      accessor: (r) => r.role,
      cell: (r) => (
        <Badge tone={r.role === "SHOP" ? "brand" : "neutral"} className="text-xs">
          {r.role === "SHOP" ? "Verified Shop" : "Individual Seller"}
        </Badge>
      ),
    },
    {
      id: "listings",
      header: "Active Listings",
      sortable: true,
      accessor: (r) => r.listing_count,
      cell: (r) => (
        <div className="flex items-center gap-1 text-xs font-semibold text-ink">
          <Smartphone className="h-3.5 w-3.5 text-brand" />
          <span>{r.listing_count}</span>
        </div>
      ),
    },
    {
      id: "sold",
      header: "Phones Sold",
      sortable: true,
      accessor: (r) => r.sold_count,
      cell: (r) => (
        <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
          {r.sold_count} sold
        </span>
      ),
    },
    {
      id: "trust_score",
      header: "Trust Score",
      sortable: true,
      accessor: (r) => r.trust_score,
      cell: (r) => (
        <div className="flex items-center gap-1.5">
          <span className="font-data font-bold text-xs text-ink">
            {r.trust_score.toFixed(1)}
          </span>
          <span className="text-[10px] text-ink-faint">/ 10</span>
        </div>
      ),
    },
    {
      id: "status",
      header: "Account Standing",
      sortable: true,
      accessor: (r) => (r.isBlocked ? "Restricted" : "Good Standing"),
      cell: (r) => (
        <Badge tone={r.isBlocked ? "danger" : "verify"} className="text-xs">
          {r.isBlocked ? "Restricted" : "Good Standing"}
        </Badge>
      ),
    },
  ];

  const filters: FilterConfig<SellerRow>[] = [
    {
      id: "type",
      label: "Account Type",
      options: [
        { label: "Shopkeepers", value: "SHOP" },
        { label: "Individuals", value: "USER" },
      ],
      predicate: (r, val) => r.role === val,
    },
    {
      id: "standing",
      label: "Standing",
      options: [
        { label: "Good Standing", value: "active" },
        { label: "Restricted", value: "blocked" },
      ],
      predicate: (r, val) => (val === "blocked" ? r.isBlocked : !r.isBlocked),
    },
  ];

  return (
    <div className="space-y-6">
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 rounded-[var(--pb-radius-md)] px-4 py-2.5 text-sm font-medium shadow-lg border animate-in slide-in-from-top-2 duration-200 ${
            toast.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-red-50 text-red-800 border-red-200"
          }`}
        >
          {toast.msg}
        </div>
      )}

      <AdminDataGrid
        title="Seller Trust & Merchant Operations"
        description="Monitor seller performance, phone inventory volume, trust metrics, and account standing."
        data={sellers}
        columns={columns}
        filters={filters}
        searchPlaceholder="Search seller name or email..."
        searchFields={[(r) => r.full_name, (r) => r.email]}
        exportFilename="phonebay-sellers.csv"
        rowActions={(row) => (
          <div className="flex items-center justify-end gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setEditScoreSeller(row);
                setNewScore(String(row.trust_score));
              }}
              className="h-8 px-2.5 text-xs"
              title="Calibrate Trust Score"
            >
              <Edit3 className="h-3.5 w-3.5 mr-1" />
              Score
            </Button>

            <Button
              variant={row.isBlocked ? "primary" : "ghost"}
              size="sm"
              onClick={() => handleToggleBlock(row.id, row.isBlocked)}
              className={`h-8 px-2 text-xs ${
                row.isBlocked
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : "text-danger hover:bg-danger-tint"
              }`}
              title={row.isBlocked ? "Unrestrict Seller" : "Restrict Seller"}
            >
              <Ban className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      />

      {/* Edit Trust Score Modal */}
      {editScoreSeller && (
        <Modal
          open={!!editScoreSeller}
          onClose={() => setEditScoreSeller(null)}
          title={`Adjust Trust Score: ${editScoreSeller.full_name}`}
          size="sm"
        >
          <form onSubmit={handleSaveScore} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-ink-soft mb-1">
                Seller Trust Score (0.0 - 10.0)
              </label>
              <input
                type="number"
                step="0.1"
                min="0.0"
                max="10.0"
                required
                value={newScore}
                onChange={(e) => setNewScore(e.target.value)}
                className="w-full h-10 px-3 rounded-[var(--pb-radius-sm)] border border-border bg-surface text-sm font-semibold text-ink focus:outline-none focus:border-brand"
              />
              <p className="text-[11px] text-ink-faint mt-1">
                Based on verified inspections, order completion rate, and customer feedback.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => setEditScoreSeller(null)}
              >
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit">
                Save Changes
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
