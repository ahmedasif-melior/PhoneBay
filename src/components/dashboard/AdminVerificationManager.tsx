"use client";

import * as React from "react";
import {
  ShieldCheck,
  ShieldAlert,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  Award,
  Store,
  SlidersHorizontal,
  Battery,
  Cpu,
  Camera,
  Smartphone,
} from "lucide-react";
import { AdminDataGrid, type ColumnDef, type FilterConfig } from "@/components/dashboard/AdminDataGrid";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { formatDate } from "@/lib/utils";
import type { AdminVerificationItem } from "@/app/(dashboard)/admin/_data";

export function AdminVerificationManager({
  initialQueue,
}: {
  initialQueue: AdminVerificationItem[];
}) {
  const [queue, setQueue] = React.useState<AdminVerificationItem[]>(initialQueue);
  const [inspectItem, setInspectItem] = React.useState<AdminVerificationItem | null>(null);
  const [scoreModalItem, setScoreModalItem] = React.useState<AdminVerificationItem | null>(null);
  const [scoreInput, setScoreInput] = React.useState("9.0");
  const [technicianNote, setTechnicianNote] = React.useState("Passed all multi-point diagnostic checkpoints.");
  const [actionPending, setActionPending] = React.useState<Record<string, boolean>>({});
  const [toast, setToast] = React.useState<{ msg: string; type: "success" | "error" } | null>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleUpdateStatus = async (
    id: string,
    newStatus: string,
    score?: number | null
  ) => {
    setActionPending((prev) => ({ ...prev, [id]: true }));
    try {
      // Update local state
      setQueue((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                status: newStatus,
                score: score !== undefined ? score : item.score,
              }
            : item
        )
      );
      showToast(`Verification ${id} marked as ${newStatus.toUpperCase()}`);
    } finally {
      setActionPending((prev) => ({ ...prev, [id]: false }));
      if (inspectItem?.id === id) {
        setInspectItem((prev) =>
          prev
            ? {
                ...prev,
                status: newStatus,
                score: score !== undefined ? score : prev.score,
              }
            : null
        );
      }
    }
  };

  const handleApproveWithScore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scoreModalItem) return;
    const numScore = parseFloat(scoreInput);
    await handleUpdateStatus(scoreModalItem.id, "approved", isNaN(numScore) ? 9.0 : numScore);
    setScoreModalItem(null);
    showToast(`Certificate issued with score ${scoreInput}/10`);
  };

  const columns: ColumnDef<AdminVerificationItem>[] = [
    {
      id: "id",
      header: "Job ID",
      sortable: true,
      accessor: (r) => r.id,
      cell: (r) => (
        <div>
          <code className="font-mono text-xs font-semibold text-brand">{r.id}</code>
          <p className="text-[11px] text-ink-faint">{formatDate(r.requested_at)}</p>
        </div>
      ),
    },
    {
      id: "device",
      header: "Device Model",
      sortable: true,
      accessor: (r) => `${r.brand} ${r.model}`,
      cell: (r) => (
        <div>
          <p className="font-semibold text-ink text-xs">{r.brand} {r.model}</p>
          <p className="text-[11px] text-ink-soft">{r.storage} · Battery: {r.battery_health ?? 90}%</p>
        </div>
      ),
    },
    {
      id: "seller",
      header: "Seller",
      sortable: true,
      accessor: (r) => r.seller_name,
      cell: (r) => <span className="font-medium text-ink text-xs">{r.seller_name}</span>,
    },
    {
      id: "shop",
      header: "Assigned Testing Lab",
      sortable: true,
      accessor: (r) => r.assigned_shop,
      cell: (r) => (
        <div className="flex items-center gap-1.5 text-xs text-ink">
          <Store className="h-3.5 w-3.5 text-brand" />
          <span>{r.assigned_shop}</span>
        </div>
      ),
    },
    {
      id: "status",
      header: "Inspection Status",
      sortable: true,
      accessor: (r) => r.status,
      cell: (r) => {
        const tone =
          r.status === "approved" || r.status === "completed"
            ? "verify"
            : r.status === "pending"
            ? "warn"
            : r.status === "in_testing"
            ? "brand"
            : "danger";
        return <Badge tone={tone} className="capitalize text-xs">{r.status.replace("_", " ")}</Badge>;
      },
    },
    {
      id: "score",
      header: "Certified Score",
      sortable: true,
      accessor: (r) => r.score ?? 0,
      cell: (r) =>
        r.score != null ? (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-verify-dark bg-verify-tint px-2 py-0.5 rounded-full">
            <Award className="h-3.5 w-3.5" />
            {r.score.toFixed(1)} / 10
          </span>
        ) : (
          <span className="text-xs text-ink-faint">Awaiting score</span>
        ),
    },
  ];

  const filters: FilterConfig<AdminVerificationItem>[] = [
    {
      id: "status",
      label: "Status",
      options: [
        { label: "Pending", value: "pending" },
        { label: "In Testing", value: "in_testing" },
        { label: "Approved", value: "approved" },
        { label: "Rejected", value: "rejected" },
      ],
      predicate: (r, val) => r.status === val,
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
        title="Hardware Verification & Certification Queue"
        description="Inspect lab hardware diagnostics, issue PhoneBay Trust Certificates, and calibrate scores."
        data={queue}
        columns={columns}
        filters={filters}
        searchPlaceholder="Search job ID, model, seller, lab..."
        searchFields={[(r) => r.id, (r) => r.model, (r) => r.brand, (r) => r.seller_name, (r) => r.assigned_shop]}
        exportFilename="phonebay-verification-queue.csv"
        rowActions={(row) => {
          const isPending = actionPending[row.id];
          return (
            <div className="flex items-center justify-end gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setInspectItem(row)}
                className="h-8 px-2.5 text-xs"
              >
                <Eye className="h-3.5 w-3.5 mr-1" />
                Inspect
              </Button>

              {row.status !== "approved" && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setScoreModalItem(row);
                    setScoreInput(row.score ? String(row.score) : "9.2");
                  }}
                  className="h-8 px-2.5 text-xs bg-emerald-600 hover:bg-emerald-700"
                >
                  <ShieldCheck className="h-3.5 w-3.5 mr-1" />
                  Certify
                </Button>
              )}

              {row.status !== "rejected" && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleUpdateStatus(row.id, "rejected", null)}
                  loading={isPending}
                  className="h-8 px-2 text-xs text-danger hover:bg-danger-tint"
                  title="Reject Certification"
                >
                  <XCircle className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          );
        }}
      />

      {/* Inspect Item Modal */}
      {inspectItem && (
        <Modal
          open={!!inspectItem}
          onClose={() => setInspectItem(null)}
          title={`Verification Inspection: ${inspectItem.brand} ${inspectItem.model}`}
          size="lg"
        >
          <div className="space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <p className="text-xs text-ink-faint">Job Identifier</p>
                <code className="text-sm font-bold font-mono text-brand">{inspectItem.id}</code>
              </div>
              <div className="text-right">
                <p className="text-xs text-ink-faint">Assigned Testing Partner</p>
                <p className="font-semibold text-ink text-sm">{inspectItem.assigned_shop}</p>
              </div>
            </div>

            {/* Simulated 40-point diagnostics preview */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-soft">
                Diagnostic Multi-Point Hardware Checks
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                <div className="p-2.5 rounded-[var(--pb-radius-sm)] border border-border bg-bg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Battery className="h-4 w-4 text-emerald-600" />
                    <span>Battery Health</span>
                  </div>
                  <strong className="text-ink">{inspectItem.battery_health ?? 91}%</strong>
                </div>
                <div className="p-2.5 rounded-[var(--pb-radius-sm)] border border-border bg-bg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Cpu className="h-4 w-4 text-emerald-600" />
                    <span>Motherboard / SOC</span>
                  </div>
                  <Badge tone="verify">PASS</Badge>
                </div>
                <div className="p-2.5 rounded-[var(--pb-radius-sm)] border border-border bg-bg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Camera className="h-4 w-4 text-emerald-600" />
                    <span>Sensors & OIS</span>
                  </div>
                  <Badge tone="verify">PASS</Badge>
                </div>
                <div className="p-2.5 rounded-[var(--pb-radius-sm)] border border-border bg-bg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4 text-emerald-600" />
                    <span>Display TrueTone</span>
                  </div>
                  <Badge tone="verify">ORIGINAL</Badge>
                </div>
                <div className="p-2.5 rounded-[var(--pb-radius-sm)] border border-border bg-bg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    <span>PTA Status</span>
                  </div>
                  <Badge tone="verify">APPROVED</Badge>
                </div>
                <div className="p-2.5 rounded-[var(--pb-radius-sm)] border border-border bg-bg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    <span>Water Ingress</span>
                  </div>
                  <Badge tone="verify">CLEAN</Badge>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setInspectItem(null)}
              >
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setScoreModalItem(inspectItem);
                  setScoreInput(inspectItem.score ? String(inspectItem.score) : "9.2");
                  setInspectItem(null);
                }}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                Certify & Approve
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Certify & Set Score Modal */}
      {scoreModalItem && (
        <Modal
          open={!!scoreModalItem}
          onClose={() => setScoreModalItem(null)}
          title={`Issue Digital Trust Certificate: ${scoreModalItem.brand} ${scoreModalItem.model}`}
          size="md"
        >
          <form onSubmit={handleApproveWithScore} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-ink-soft mb-1">
                Calibrated Quality Score (1.0 - 10.0)
              </label>
              <input
                type="number"
                step="0.1"
                min="1.0"
                max="10.0"
                required
                value={scoreInput}
                onChange={(e) => setScoreInput(e.target.value)}
                className="w-full h-10 px-3 rounded-[var(--pb-radius-sm)] border border-border bg-surface text-sm font-semibold text-ink focus:outline-none focus:border-brand"
              />
              <p className="text-[11px] text-ink-faint mt-1">
                Scores ≥ 9.0 display a Gold Verified badge on marketplace cards.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-ink-soft mb-1">
                Official Certification Memo
              </label>
              <textarea
                rows={2}
                value={technicianNote}
                onChange={(e) => setTechnicianNote(e.target.value)}
                className="w-full p-2.5 rounded-[var(--pb-radius-sm)] border border-border bg-surface text-xs text-ink focus:outline-none focus:border-brand"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => setScoreModalItem(null)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                Issue Certificate & Publish
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
