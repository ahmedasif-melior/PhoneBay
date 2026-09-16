"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ShieldCheck,
  ShieldAlert,
  Eye,
  CheckCircle2,
  XCircle,
  PauseCircle,
  PlayCircle,
  Trash2,
  Smartphone,
  ExternalLink,
  DollarSign,
  User,
  Calendar,
  AlertTriangle,
} from "lucide-react";
import { AdminDataGrid, type ColumnDef, type FilterConfig } from "@/components/dashboard/AdminDataGrid";
import { Badge, StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { formatPKR, formatDate } from "@/lib/utils";
import type { AdminListing } from "@/app/(dashboard)/admin/_data";

export function AdminListingsManager({ initialListings }: { initialListings: AdminListing[] }) {
  const [listings, setListings] = React.useState<AdminListing[]>(initialListings);
  const [inspectListing, setInspectListing] = React.useState<AdminListing | null>(null);
  const [rejectingListing, setRejectingListing] = React.useState<AdminListing | null>(null);
  const [rejectionReason, setRejectionReason] = React.useState("Listing violates marketplace accuracy guidelines");
  const [actionPending, setActionPending] = React.useState<Record<string, boolean>>({});
  const [toast, setToast] = React.useState<{ msg: string; type: "success" | "error" } | null>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    setActionPending((prev) => ({ ...prev, [id]: true }));
    try {
      const res = await fetch(`/api/admin/listings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      // Optimistically or on success update local state
      setListings((prev) =>
        prev.map((l) => (l.id === id ? { ...l, status: newStatus } : l))
      );
      showToast(`Listing updated to ${newStatus.toUpperCase()}`);
    } catch {
      showToast("Network error updating listing", "error");
    } finally {
      setActionPending((prev) => ({ ...prev, [id]: false }));
      if (inspectListing?.id === id) {
        setInspectListing((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectingListing) return;
    await handleUpdateStatus(rejectingListing.id, "rejected");
    setRejectingListing(null);
  };

  const handleBatchStatus = async (selectedIds: string[], status: string, clearSelection: () => void) => {
    for (const id of selectedIds) {
      await handleUpdateStatus(id, status);
    }
    clearSelection();
    showToast(`Updated ${selectedIds.length} listings to ${status}`);
  };

  const columns: ColumnDef<AdminListing>[] = [
    {
      id: "device",
      header: "Device",
      sortable: true,
      accessor: (row) => `${row.brand} ${row.model}`,
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-[var(--pb-radius-sm)] border border-border bg-bg flex items-center justify-center">
            <Image
              src={row.image || "/images/phones/iphone-15.webp"}
              alt={row.model}
              width={36}
              height={36}
              className="object-contain"
            />
          </div>
          <div>
            <p className="font-semibold text-ink leading-tight">
              {row.brand} {row.model}
            </p>
            <p className="text-xs text-ink-soft">
              {row.storage} · {row.color} · {row.condition}
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "seller",
      header: "Seller",
      sortable: true,
      accessor: (row) => row.seller,
      cell: (row) => (
        <div className="flex items-center gap-1.5">
          <User className="h-3.5 w-3.5 text-ink-faint" />
          <span className="font-medium text-ink">{row.seller}</span>
        </div>
      ),
    },
    {
      id: "price",
      header: "Price",
      sortable: true,
      accessor: (row) => row.price,
      cell: (row) => (
        <span className="font-data font-semibold text-ink">
          {formatPKR(row.price)}
        </span>
      ),
    },
    {
      id: "status",
      header: "Status",
      sortable: true,
      accessor: (row) => row.status,
      cell: (row) => {
        const tone =
          row.status === "active"
            ? "verify"
            : row.status === "pending"
            ? "warn"
            : row.status === "sold"
            ? "neutral"
            : row.status === "paused"
            ? "warn"
            : "danger";
        return <Badge tone={tone} className="capitalize">{row.status}</Badge>;
      },
    },
    {
      id: "verification",
      header: "Trust / Score",
      sortable: true,
      accessor: (row) => row.score ?? 0,
      cell: (row) =>
        row.verified ? (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-verify-dark bg-verify-tint px-2 py-0.5 rounded-full">
            <ShieldCheck className="h-3.5 w-3.5" />
            {row.score ? `${row.score.toFixed(1)}/10` : "Verified"}
          </span>
        ) : (
          <span className="text-xs text-ink-faint">Standard</span>
        ),
    },
    {
      id: "created_at",
      header: "Listed",
      sortable: true,
      accessor: (row) => row.created_at,
      cell: (row) => (
        <span className="text-xs text-ink-soft whitespace-nowrap">
          {formatDate(row.created_at)}
        </span>
      ),
    },
  ];

  const filters: FilterConfig<AdminListing>[] = [
    {
      id: "status",
      label: "Status",
      options: [
        { label: "Active", value: "active" },
        { label: "Pending", value: "pending" },
        { label: "Sold", value: "sold" },
        { label: "Paused", value: "paused" },
        { label: "Rejected", value: "rejected" },
      ],
      predicate: (row, val) => row.status === val,
    },
    {
      id: "brand",
      label: "Brand",
      options: [
        { label: "Apple", value: "Apple" },
        { label: "Samsung", value: "Samsung" },
        { label: "Google", value: "Google" },
        { label: "OnePlus", value: "OnePlus" },
      ],
      predicate: (row, val) => row.brand.toLowerCase() === val.toLowerCase(),
    },
    {
      id: "verified",
      label: "Verification",
      options: [
        { label: "Verified Only", value: "verified" },
        { label: "Unverified", value: "unverified" },
      ],
      predicate: (row, val) => (val === "verified" ? row.verified : !row.verified),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Feedback toast */}
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

      {/* Main Data Grid */}
      <AdminDataGrid
        title="Marketplace Listings Moderation"
        description="Inspect, review, approve, pause, or delist phone listings across the platform."
        data={listings}
        columns={columns}
        filters={filters}
        enableSelection
        searchPlaceholder="Search model, brand, seller..."
        searchFields={[(r) => r.model, (r) => r.brand, (r) => r.seller, (r) => r.storage]}
        exportFilename="phonebay-listings.csv"
        batchActions={(selectedIds, clearSelection) => (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBatchStatus(selectedIds, "active", clearSelection)}
              className="h-7 text-xs"
            >
              Approve Selected
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBatchStatus(selectedIds, "paused", clearSelection)}
              className="h-7 text-xs"
            >
              Pause Selected
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBatchStatus(selectedIds, "rejected", clearSelection)}
              className="h-7 text-xs text-danger hover:bg-danger-tint"
            >
              Reject Selected
            </Button>
          </div>
        )}
        rowActions={(row) => {
          const isPending = actionPending[row.id];
          return (
            <div className="flex items-center justify-end gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setInspectListing(row)}
                className="h-8 px-2.5 text-xs"
                title="Inspect Details"
              >
                <Eye className="h-3.5 w-3.5 mr-1" />
                Inspect
              </Button>

              {row.status === "pending" && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleUpdateStatus(row.id, "active")}
                  loading={isPending}
                  className="h-8 px-2.5 text-xs bg-emerald-600 hover:bg-emerald-700"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                  Approve
                </Button>
              )}

              {row.status === "active" ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleUpdateStatus(row.id, "paused")}
                  loading={isPending}
                  className="h-8 px-2 text-xs"
                  title="Pause Listing"
                >
                  <PauseCircle className="h-3.5 w-3.5" />
                </Button>
              ) : row.status === "paused" ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleUpdateStatus(row.id, "active")}
                  loading={isPending}
                  className="h-8 px-2 text-xs text-emerald-600"
                  title="Resume Listing"
                >
                  <PlayCircle className="h-3.5 w-3.5" />
                </Button>
              ) : null}

              {row.status !== "rejected" && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setRejectingListing(row)}
                  className="h-8 px-2 text-xs text-danger hover:bg-danger-tint"
                  title="Reject or Delist"
                >
                  <XCircle className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          );
        }}
      />

      {/* Inspect Listing Details Modal */}
      {inspectListing && (
        <Modal
          open={!!inspectListing}
          onClose={() => setInspectListing(null)}
          title={`${inspectListing.brand} ${inspectListing.model}`}
          size="lg"
        >
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row gap-4 items-start pb-4 border-b border-border">
              <div className="relative h-28 w-28 shrink-0 rounded-[var(--pb-radius-md)] border border-border bg-bg p-2 flex items-center justify-center">
                <Image
                  src={inspectListing.image || "/images/phones/iphone-15.webp"}
                  alt={inspectListing.model}
                  width={96}
                  height={96}
                  className="object-contain"
                />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xl font-bold text-ink">
                    {formatPKR(inspectListing.price)}
                  </span>
                  <Badge
                    tone={
                      inspectListing.status === "active"
                        ? "verify"
                        : inspectListing.status === "pending"
                        ? "warn"
                        : "neutral"
                    }
                  >
                    {inspectListing.status}
                  </Badge>
                  {inspectListing.verified && (
                    <Badge tone="verify" icon={<ShieldCheck className="h-3 w-3" />}>
                      Verified {inspectListing.score ? `${inspectListing.score}/10` : ""}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-ink-soft">
                  Listing ID: <code className="font-mono text-xs bg-bg px-1.5 py-0.5 rounded">{inspectListing.id}</code>
                </p>
                <p className="text-sm text-ink-soft">
                  Seller: <strong>{inspectListing.seller}</strong>
                </p>
                <p className="text-sm text-ink-soft">
                  Listed Date: {formatDate(inspectListing.created_at)}
                </p>
              </div>
            </div>

            {/* Specs Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-bg p-3.5 rounded-[var(--pb-radius-md)] border border-border text-xs">
              <div>
                <span className="text-ink-faint">Storage</span>
                <p className="font-semibold text-ink mt-0.5">{inspectListing.storage}</p>
              </div>
              <div>
                <span className="text-ink-faint">Color</span>
                <p className="font-semibold text-ink mt-0.5">{inspectListing.color}</p>
              </div>
              <div>
                <span className="text-ink-faint">Condition</span>
                <p className="font-semibold text-ink mt-0.5">{inspectListing.condition}</p>
              </div>
              <div>
                <span className="text-ink-faint">Views</span>
                <p className="font-semibold text-ink mt-0.5">{inspectListing.views ?? 128}</p>
              </div>
            </div>

            {/* Quick Actions in Modal */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border">
              <Link
                href={`/marketplace/${inspectListing.id}`}
                target="_blank"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-brand hover:underline"
              >
                <span>View live marketplace page</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>

              <div className="flex items-center gap-2">
                {inspectListing.status !== "active" && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleUpdateStatus(inspectListing.id, "active")}
                    loading={actionPending[inspectListing.id]}
                    className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700"
                  >
                    Set Active
                  </Button>
                )}
                {inspectListing.status === "active" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUpdateStatus(inspectListing.id, "paused")}
                    loading={actionPending[inspectListing.id]}
                    className="h-8 text-xs"
                  >
                    Pause
                  </Button>
                )}
                {inspectListing.status !== "rejected" && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => {
                      setRejectingListing(inspectListing);
                      setInspectListing(null);
                    }}
                    className="h-8 text-xs"
                  >
                    Delist / Reject
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Reject Reason Confirmation Modal */}
      {rejectingListing && (
        <Modal
          open={!!rejectingListing}
          onClose={() => setRejectingListing(null)}
          title="Reject / Delist Listing"
          size="sm"
        >
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 rounded-[var(--pb-radius-sm)] bg-danger-tint text-danger text-xs">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>
                Rejecting will immediately remove <strong>{rejectingListing.brand} {rejectingListing.model}</strong> from the public marketplace.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
                Reason for Rejection
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
                className="w-full rounded-[var(--pb-radius-sm)] border border-border p-2.5 text-xs text-ink focus:outline-none focus:border-brand"
                placeholder="Explain why this listing was rejected..."
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRejectingListing(null)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleConfirmReject}
                loading={actionPending[rejectingListing.id]}
              >
                Confirm Rejection
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
