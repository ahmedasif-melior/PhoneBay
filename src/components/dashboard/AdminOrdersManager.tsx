"use client";

import * as React from "react";
import Image from "next/image";
import {
  Truck,
  PackageCheck,
  Clock,
  XCircle,
  Eye,
  CheckCircle2,
  DollarSign,
  ShieldCheck,
  User,
  MapPin,
  FileText,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { AdminDataGrid, type ColumnDef, type FilterConfig } from "@/components/dashboard/AdminDataGrid";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { formatPKR, formatDate } from "@/lib/utils";
import type { AdminOrder } from "@/app/(dashboard)/admin/_data";

export function AdminOrdersManager({ initialOrders }: { initialOrders: AdminOrder[] }) {
  const [orders, setOrders] = React.useState<AdminOrder[]>(initialOrders);
  const [inspectOrder, setInspectOrder] = React.useState<AdminOrder | null>(null);
  const [actionPending, setActionPending] = React.useState<Record<string, boolean>>({});
  const [toast, setToast] = React.useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [newTracking, setNewTracking] = React.useState("");

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleUpdateStatus = async (
    id: string,
    newStatus: string,
    paymentStatus?: "escrow_held" | "escrow_released" | "refunded"
  ) => {
    setActionPending((prev) => ({ ...prev, [id]: true }));
    try {
      await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, paymentStatus }),
      });

      setOrders((prev) =>
        prev.map((o) =>
          o.id === id
            ? {
                ...o,
                status: newStatus,
                payment_status: paymentStatus ?? o.payment_status,
              }
            : o
        )
      );

      showToast(`Order ${id} updated to ${newStatus.toUpperCase()}`);
    } catch {
      showToast("Failed to update order status", "error");
    } finally {
      setActionPending((prev) => ({ ...prev, [id]: false }));
      if (inspectOrder?.id === id) {
        setInspectOrder((prev) =>
          prev
            ? {
                ...prev,
                status: newStatus,
                payment_status: paymentStatus ?? prev.payment_status,
              }
            : null
        );
      }
    }
  };

  const columns: ColumnDef<AdminOrder>[] = [
    {
      id: "id",
      header: "Order ID",
      sortable: true,
      accessor: (r) => r.id,
      cell: (r) => (
        <div>
          <code className="font-mono text-xs font-semibold text-brand">{r.id}</code>
          <p className="text-[11px] text-ink-faint">{formatDate(r.created_at)}</p>
        </div>
      ),
    },
    {
      id: "device",
      header: "Listing Item",
      sortable: true,
      accessor: (r) => r.listing_name,
      cell: (r) => (
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 shrink-0 overflow-hidden rounded-[var(--pb-radius-sm)] border border-border bg-bg flex items-center justify-center">
            <Image
              src={r.image || "/images/phones/iphone-15-pro.svg"}
              alt="Device"
              width={32}
              height={32}
              className="object-contain"
            />
          </div>
          <span className="font-medium text-ink max-w-[220px] truncate block text-xs">
            {r.listing_name}
          </span>
        </div>
      ),
    },
    {
      id: "buyer",
      header: "Buyer",
      sortable: true,
      accessor: (r) => r.buyer_name,
      cell: (r) => (
        <div>
          <p className="font-medium text-ink text-xs">{r.buyer_name}</p>
          <p className="text-[11px] text-ink-faint truncate max-w-[150px]">{r.buyer_email || r.shipping_city}</p>
        </div>
      ),
    },
    {
      id: "seller",
      header: "Seller",
      sortable: true,
      accessor: (r) => r.seller_name,
      cell: (r) => (
        <div>
          <p className="font-medium text-ink text-xs">{r.seller_name}</p>
          <p className="text-[11px] text-ink-faint truncate max-w-[150px]">{r.seller_email}</p>
        </div>
      ),
    },
    {
      id: "price",
      header: "Amount",
      sortable: true,
      accessor: (r) => r.price,
      cell: (r) => (
        <span className="font-data font-semibold text-ink text-xs">
          {formatPKR(r.price)}
        </span>
      ),
    },
    {
      id: "status",
      header: "Fulfillment",
      sortable: true,
      accessor: (r) => r.status,
      cell: (r) => {
        const tone =
          r.status === "delivered"
            ? "verify"
            : r.status === "shipped"
            ? "brand"
            : r.status === "processing"
            ? "warn"
            : "danger";
        return <Badge tone={tone} className="capitalize text-xs">{r.status}</Badge>;
      },
    },
    {
      id: "payment",
      header: "Escrow Protection",
      sortable: true,
      accessor: (r) => r.payment_status,
      cell: (r) => {
        const isReleased = r.payment_status === "escrow_released";
        const isRefunded = r.payment_status === "refunded";
        return (
          <span
            className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${
              isReleased
                ? "bg-emerald-50 text-emerald-700"
                : isRefunded
                ? "bg-red-50 text-red-700"
                : "bg-amber-50 text-amber-700"
            }`}
          >
            <ShieldCheck className="h-3 w-3" />
            {isReleased ? "Released" : isRefunded ? "Refunded" : "Escrow Held"}
          </span>
        );
      },
    },
  ];

  const filters: FilterConfig<AdminOrder>[] = [
    {
      id: "status",
      label: "Fulfillment Status",
      options: [
        { label: "Processing", value: "processing" },
        { label: "Shipped", value: "shipped" },
        { label: "Delivered", value: "delivered" },
        { label: "Cancelled", value: "cancelled" },
      ],
      predicate: (r, val) => r.status === val,
    },
    {
      id: "payment_status",
      label: "Escrow Status",
      options: [
        { label: "Held in Escrow", value: "escrow_held" },
        { label: "Released to Seller", value: "escrow_released" },
        { label: "Refunded to Buyer", value: "refunded" },
      ],
      predicate: (r, val) => r.payment_status === val,
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
        title="Orders & Escrow Operations"
        description="Monitor buyer orders, shipping fulfillment, courier tracking, and PhoneBay escrow fund releases."
        data={orders}
        columns={columns}
        filters={filters}
        enableSelection
        searchPlaceholder="Search order ID, buyer, seller, phone..."
        searchFields={[(r) => r.id, (r) => r.listing_name, (r) => r.buyer_name, (r) => r.seller_name, (r) => r.shipping_city]}
        exportFilename="phonebay-orders.csv"
        batchActions={(selectedIds, clearSelection) => (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                selectedIds.forEach((id) => handleUpdateStatus(id, "shipped"));
                clearSelection();
                showToast(`Marked ${selectedIds.length} orders as Shipped`);
              }}
              className="h-7 text-xs"
            >
              Batch Mark Shipped
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                selectedIds.forEach((id) => handleUpdateStatus(id, "delivered", "escrow_released"));
                clearSelection();
                showToast(`Released escrow for ${selectedIds.length} orders`);
              }}
              className="h-7 text-xs text-emerald-700 hover:bg-emerald-50"
            >
              Batch Release Escrow
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
                onClick={() => setInspectOrder(row)}
                className="h-8 px-2.5 text-xs"
              >
                <Eye className="h-3.5 w-3.5 mr-1" />
                Details
              </Button>

              {row.status === "processing" && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleUpdateStatus(row.id, "shipped")}
                  loading={isPending}
                  className="h-8 px-2.5 text-xs bg-sky-600 hover:bg-sky-700"
                >
                  <Truck className="h-3.5 w-3.5 mr-1" />
                  Ship
                </Button>
              )}

              {row.status === "shipped" && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleUpdateStatus(row.id, "delivered", "escrow_released")}
                  loading={isPending}
                  className="h-8 px-2.5 text-xs bg-emerald-600 hover:bg-emerald-700"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                  Complete
                </Button>
              )}
            </div>
          );
        }}
      />

      {/* Order Detail Modal */}
      {inspectOrder && (
        <Modal
          open={!!inspectOrder}
          onClose={() => setInspectOrder(null)}
          title={`Order ${inspectOrder.id}`}
          size="lg"
        >
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start justify-between gap-4 pb-4 border-b border-border">
              <div>
                <h3 className="text-lg font-bold text-ink">{inspectOrder.listing_name}</h3>
                <p className="text-xs text-ink-soft mt-0.5">
                  Ordered on {formatDate(inspectOrder.created_at)}
                </p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold font-data text-ink">
                  {formatPKR(inspectOrder.price)}
                </span>
                <div className="mt-1 flex items-center justify-end gap-1.5">
                  <Badge tone={inspectOrder.status === "delivered" ? "verify" : "brand"}>
                    {inspectOrder.status}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Buyer & Seller Info Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-[var(--pb-radius-md)] border border-border bg-bg p-4 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-ink-faint">
                  <User className="h-3.5 w-3.5 text-brand" /> Buyer Information
                </div>
                <p className="font-semibold text-ink text-sm">{inspectOrder.buyer_name}</p>
                <p className="text-xs text-ink-soft">{inspectOrder.buyer_email || "N/A"}</p>
                <p className="text-xs text-ink-soft flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-ink-faint" />
                  Delivery City: <strong>{inspectOrder.shipping_city}</strong>
                </p>
              </div>

              <div className="rounded-[var(--pb-radius-md)] border border-border bg-bg p-4 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-ink-faint">
                  <User className="h-3.5 w-3.5 text-verify-dark" /> Seller Information
                </div>
                <p className="font-semibold text-ink text-sm">{inspectOrder.seller_name}</p>
                <p className="text-xs text-ink-soft">{inspectOrder.seller_email || "N/A"}</p>
                <p className="text-xs text-ink-soft">
                  Disbursement:{" "}
                  <strong>
                    {inspectOrder.payment_status === "escrow_released"
                      ? "Paid to Seller"
                      : "Protected in Escrow"}
                  </strong>
                </p>
              </div>
            </div>

            {/* Courier Tracking Section */}
            <div className="rounded-[var(--pb-radius-md)] border border-border p-4 bg-surface space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-ink">
                  <Truck className="h-4 w-4 text-brand" /> Courier & Shipping Details
                </div>
                <span className="text-xs font-mono bg-bg px-2 py-1 rounded border border-border">
                  {inspectOrder.tracking_number || "TCS-Pending"}
                </span>
              </div>
              <p className="text-xs text-ink-soft">
                All PhoneBay packages are insured and shipped with tamper-evident security tags.
              </p>
            </div>

            {/* Escrow Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border">
              <div className="text-xs text-ink-soft">
                Escrow State:{" "}
                <span className="font-semibold capitalize text-ink">
                  {inspectOrder.payment_status.replace("_", " ")}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {inspectOrder.status !== "delivered" && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() =>
                      handleUpdateStatus(inspectOrder.id, "delivered", "escrow_released")
                    }
                    loading={actionPending[inspectOrder.id]}
                    className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700"
                  >
                    Release Escrow & Complete
                  </Button>
                )}
                {inspectOrder.status !== "cancelled" && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() =>
                      handleUpdateStatus(inspectOrder.id, "cancelled", "refunded")
                    }
                    loading={actionPending[inspectOrder.id]}
                    className="h-8 text-xs"
                  >
                    Cancel & Refund Buyer
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
