"use client";

import * as React from "react";
import {
  AlertTriangle,
  Scale,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Eye,
  DollarSign,
  User,
  MessageSquare,
  FileText,
  Clock,
  ArrowRight,
} from "lucide-react";
import { AdminDataGrid, type ColumnDef, type FilterConfig } from "@/components/dashboard/AdminDataGrid";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { formatPKR, formatDate } from "@/lib/utils";
import type { AdminDispute } from "@/app/(dashboard)/admin/_data";

export function AdminDisputesManager({
  initialDisputes,
}: {
  initialDisputes: AdminDispute[];
}) {
  const [disputes, setDisputes] = React.useState<AdminDispute[]>(initialDisputes);
  const [resolveDispute, setResolveDispute] = React.useState<AdminDispute | null>(null);
  const [resolutionAction, setResolutionAction] = React.useState<"refund_buyer" | "release_seller" | "partial" | "dismiss">("refund_buyer");
  const [resolutionMemo, setResolutionMemo] = React.useState("");
  const [actionPending, setActionPending] = React.useState(false);
  const [toast, setToast] = React.useState<{ msg: string; type: "success" | "error" } | null>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleResolveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolveDispute) return;
    setActionPending(true);

    try {
      const newStatus = resolutionAction === "dismiss" ? "dismissed" : "resolved";
      setDisputes((prev) =>
        prev.map((d) =>
          d.id === resolveDispute.id
            ? {
                ...d,
                status: newStatus,
                resolution_notes: resolutionMemo || `Resolved via ${resolutionAction.replace("_", " ")}`,
              }
            : d
        )
      );
      showToast(`Dispute ${resolveDispute.id} marked as ${newStatus.toUpperCase()}`);
      setResolveDispute(null);
      setResolutionMemo("");
    } finally {
      setActionPending(false);
    }
  };

  const columns: ColumnDef<AdminDispute>[] = [
    {
      id: "id",
      header: "Case ID",
      sortable: true,
      accessor: (r) => r.id,
      cell: (r) => (
        <div>
          <code className="font-mono text-xs font-semibold text-danger">{r.id}</code>
          <p className="text-[11px] text-ink-faint">{formatDate(r.created_at)}</p>
        </div>
      ),
    },
    {
      id: "order",
      header: "Order & Device",
      sortable: true,
      accessor: (r) => r.device_name,
      cell: (r) => (
        <div>
          <p className="font-semibold text-ink text-xs">{r.device_name}</p>
          <code className="text-[11px] text-brand font-mono">{r.order_id}</code>
        </div>
      ),
    },
    {
      id: "parties",
      header: "Parties Involved",
      sortable: true,
      accessor: (r) => r.buyer_name,
      cell: (r) => (
        <div className="text-xs">
          <p className="text-ink">
            <span className="text-ink-faint">Buyer:</span> <strong>{r.buyer_name}</strong>
          </p>
          <p className="text-ink-soft">
            <span className="text-ink-faint">Seller:</span> {r.seller_name}
          </p>
        </div>
      ),
    },
    {
      id: "reason",
      header: "Dispute Reason",
      sortable: false,
      accessor: (r) => r.reason,
      cell: (r) => (
        <span className="text-xs text-ink max-w-[260px] truncate block" title={r.reason}>
          {r.reason}
        </span>
      ),
    },
    {
      id: "amount",
      header: "Disputed Amount",
      sortable: true,
      accessor: (r) => r.amount,
      cell: (r) => (
        <span className="font-data font-bold text-ink text-xs">
          {formatPKR(r.amount)}
        </span>
      ),
    },
    {
      id: "priority",
      header: "Priority",
      sortable: true,
      accessor: (r) => r.priority,
      cell: (r) => (
        <Badge tone={r.priority === "high" ? "danger" : r.priority === "medium" ? "warn" : "neutral"} className="uppercase text-[10px]">
          {r.priority}
        </Badge>
      ),
    },
    {
      id: "status",
      header: "Status",
      sortable: true,
      accessor: (r) => r.status,
      cell: (r) => {
        const tone =
          r.status === "resolved"
            ? "verify"
            : r.status === "under_review"
            ? "brand"
            : r.status === "open"
            ? "danger"
            : "neutral";
        return <Badge tone={tone} className="capitalize text-xs">{r.status.replace("_", " ")}</Badge>;
      },
    },
  ];

  const filters: FilterConfig<AdminDispute>[] = [
    {
      id: "status",
      label: "Dispute Status",
      options: [
        { label: "Open", value: "open" },
        { label: "Under Review", value: "under_review" },
        { label: "Resolved", value: "resolved" },
        { label: "Dismissed", value: "dismissed" },
      ],
      predicate: (r, val) => r.status === val,
    },
    {
      id: "priority",
      label: "Priority",
      options: [
        { label: "High", value: "high" },
        { label: "Medium", value: "medium" },
        { label: "Low", value: "low" },
      ],
      predicate: (r, val) => r.priority === val,
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

      {/* Summary KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-[var(--pb-radius-md)] border border-red-200 bg-red-50/50 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-red-600">Open Disputes</p>
            <p className="text-2xl font-bold font-data text-red-950 mt-1">
              {disputes.filter((d) => d.status === "open").length}
            </p>
          </div>
          <AlertTriangle className="h-8 w-8 text-red-500 opacity-80" />
        </div>

        <div className="p-4 rounded-[var(--pb-radius-md)] border border-amber-200 bg-amber-50/50 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-700">Under Investigation</p>
            <p className="text-2xl font-bold font-data text-amber-950 mt-1">
              {disputes.filter((d) => d.status === "under_review").length}
            </p>
          </div>
          <Scale className="h-8 w-8 text-amber-600 opacity-80" />
        </div>

        <div className="p-4 rounded-[var(--pb-radius-md)] border border-emerald-200 bg-emerald-50/50 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Resolved Cases</p>
            <p className="text-2xl font-bold font-data text-emerald-950 mt-1">
              {disputes.filter((d) => d.status === "resolved").length}
            </p>
          </div>
          <CheckCircle2 className="h-8 w-8 text-emerald-600 opacity-80" />
        </div>
      </div>

      <AdminDataGrid
        title="Dispute Resolution Center"
        description="Arbitrate buyer claims, review physical condition complaints, and manage PhoneBay Escrow funds."
        data={disputes}
        columns={columns}
        filters={filters}
        searchPlaceholder="Search case ID, order ID, buyer, seller..."
        searchFields={[(r) => r.id, (r) => r.order_id, (r) => r.buyer_name, (r) => r.seller_name, (r) => r.reason]}
        exportFilename="phonebay-disputes.csv"
        rowActions={(row) => (
          <div className="flex items-center justify-end gap-1.5">
            <Button
              variant={row.status === "open" ? "primary" : "outline"}
              size="sm"
              onClick={() => {
                setResolveDispute(row);
                setResolutionMemo(row.resolution_notes || "");
              }}
              className={`h-8 px-2.5 text-xs ${
                row.status === "open" ? "bg-red-600 hover:bg-red-700" : ""
              }`}
            >
              <Scale className="h-3.5 w-3.5 mr-1" />
              {row.status === "open" ? "Arbitrate" : "Review"}
            </Button>
          </div>
        )}
      />

      {/* Resolution Modal */}
      {resolveDispute && (
        <Modal
          open={!!resolveDispute}
          onClose={() => setResolveDispute(null)}
          title={`Dispute Arbitration: ${resolveDispute.id}`}
          size="lg"
        >
          <form onSubmit={handleResolveSubmit} className="space-y-5">
            {/* Case Header */}
            <div className="rounded-[var(--pb-radius-md)] bg-bg border border-border p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-danger">{resolveDispute.id}</span>
                <Badge tone="danger" className="uppercase text-[10px]">
                  {resolveDispute.priority} Priority
                </Badge>
              </div>
              <h3 className="font-bold text-ink text-base">{resolveDispute.device_name}</h3>
              <p className="text-xs text-ink-soft">
                Order Reference: <code className="font-mono text-brand">{resolveDispute.order_id}</code> · Escrow Protected Amount:{" "}
                <strong className="text-ink">{formatPKR(resolveDispute.amount)}</strong>
              </p>
            </div>

            {/* Claim Details */}
            <div className="space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-ink-soft">
                Complainant Claim & Description
              </span>
              <div className="rounded-[var(--pb-radius-sm)] border border-border bg-surface p-3 text-xs text-ink space-y-2">
                <p><strong>Reason:</strong> {resolveDispute.reason}</p>
                <p className="text-ink-soft leading-relaxed">{resolveDispute.description}</p>
              </div>
            </div>

            {/* Arbitration Choice */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-ink-soft">
                Select Arbitration Decision
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <label
                  className={`p-3 rounded-[var(--pb-radius-sm)] border cursor-pointer flex flex-col gap-1 transition-all ${
                    resolutionAction === "refund_buyer"
                      ? "border-brand bg-brand-tint/30 text-ink"
                      : "border-border bg-surface text-ink-soft hover:border-border-strong"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="arbitration"
                      checked={resolutionAction === "refund_buyer"}
                      onChange={() => setResolutionAction("refund_buyer")}
                      className="text-brand focus:ring-brand"
                    />
                    <strong className="text-xs text-ink">Full Refund to Buyer</strong>
                  </div>
                  <p className="text-[11px] text-ink-faint pl-5">
                    Release 100% of escrow funds back to the buyer's account.
                  </p>
                </label>

                <label
                  className={`p-3 rounded-[var(--pb-radius-sm)] border cursor-pointer flex flex-col gap-1 transition-all ${
                    resolutionAction === "release_seller"
                      ? "border-brand bg-brand-tint/30 text-ink"
                      : "border-border bg-surface text-ink-soft hover:border-border-strong"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="arbitration"
                      checked={resolutionAction === "release_seller"}
                      onChange={() => setResolutionAction("release_seller")}
                      className="text-brand focus:ring-brand"
                    />
                    <strong className="text-xs text-ink">Release Escrow to Seller</strong>
                  </div>
                  <p className="text-[11px] text-ink-faint pl-5">
                    Dismiss buyer's claim and disburse full sale funds to seller.
                  </p>
                </label>
              </div>
            </div>

            {/* Official Arbitration Memo */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-ink-soft mb-1.5">
                Official Resolution Memo (sent to both parties)
              </label>
              <textarea
                rows={2}
                required
                value={resolutionMemo}
                onChange={(e) => setResolutionMemo(e.target.value)}
                placeholder="Explain the findings from diagnostic reports, serial validation, and reason for this settlement..."
                className="w-full p-2.5 rounded-[var(--pb-radius-sm)] border border-border text-xs text-ink focus:outline-none focus:border-brand"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => setResolveDispute(null)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                type="submit"
                loading={actionPending}
                className="bg-brand hover:bg-brand-dark"
              >
                Execute Settlement
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
