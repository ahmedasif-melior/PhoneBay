"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  SlidersHorizontal,
  Clock,
  Truck,
  PackageCheck,
  XCircle,
  ShieldCheck,
  Eye,
  FileText,
  AlertTriangle,
  ArrowUpDown,
  CheckCircle2,
  ExternalLink,
  MapPin,
  Calendar,
  X,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { formatPKR, formatDate } from "@/lib/utils";

export type UserPurchaseItem = {
  id: string;
  model: string;
  brand?: string;
  price: number;
  status: "processing" | "shipped" | "delivered" | "cancelled";
  created_at: string;
  seller: string;
  seller_id?: string;
  image?: string;
  tracking_number?: string;
  shipping_city?: string;
};

const statusConfig = {
  processing: { label: "Processing", icon: Clock, tone: "warn" as const },
  shipped: { label: "Shipped", icon: Truck, tone: "brand" as const },
  delivered: { label: "Delivered", icon: PackageCheck, tone: "verify" as const },
  cancelled: { label: "Cancelled", icon: XCircle, tone: "danger" as const },
};

function imageForModel(model: string, fallback?: string): string {
  if (fallback) return fallback;
  const key = model.toLowerCase();
  if (key.includes("iphone 15 pro")) return "/images/phones/iphone-15-pro.svg";
  if (key.includes("iphone 14")) return "/images/phones/iphone-14.svg";
  if (key.includes("s24")) return "/images/phones/galaxy-s24.svg";
  if (key.includes("s23")) return "/images/phones/galaxy-s23.svg";
  if (key.includes("pixel")) return "/images/phones/pixel-9.svg";
  if (key.includes("oneplus")) return "/images/phones/oneplus-13.svg";
  return "/images/phones/iphone-15.webp";
}

export function UserPurchasesBrowser({
  initialPurchases,
}: {
  initialPurchases: UserPurchaseItem[];
}) {
  const [purchases, setPurchases] = React.useState<UserPurchaseItem[]>(initialPurchases);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [sortBy, setSortBy] = React.useState<"newest" | "oldest" | "price-desc" | "price-asc">("newest");
  const [selectedOrder, setSelectedOrder] = React.useState<UserPurchaseItem | null>(null);
  const [disputeOrder, setDisputeOrder] = React.useState<UserPurchaseItem | null>(null);
  const [disputeReason, setDisputeReason] = React.useState("Physical condition does not match listing description");
  const [disputeNotes, setDisputeNotes] = React.useState("");
  const [toast, setToast] = React.useState<{ msg: string; type: "success" | "error" } | null>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleDisputeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    showToast("Dispute ticket opened. PhoneBay escrow payment has been safely placed on hold.");
    setDisputeOrder(null);
    setDisputeNotes("");
  };

  const filteredPurchases = React.useMemo(() => {
    return purchases
      .filter((item) => {
        if (statusFilter !== "all" && item.status !== statusFilter) {
          return false;
        }
        if (search.trim()) {
          const q = search.toLowerCase().trim();
          const match =
            item.model.toLowerCase().includes(q) ||
            item.id.toLowerCase().includes(q) ||
            item.seller.toLowerCase().includes(q);
          if (!match) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "newest") {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        if (sortBy === "oldest") {
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        }
        if (sortBy === "price-desc") {
          return b.price - a.price;
        }
        if (sortBy === "price-asc") {
          return a.price - b.price;
        }
        return 0;
      });
  }, [purchases, search, statusFilter, sortBy]);

  const counts = {
    all: purchases.length,
    processing: purchases.filter((p) => p.status === "processing").length,
    shipped: purchases.filter((p) => p.status === "shipped").length,
    delivered: purchases.filter((p) => p.status === "delivered").length,
    cancelled: purchases.filter((p) => p.status === "cancelled").length,
  };

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

      {/* Control bar */}
      <Card className="p-4 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-faint pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search purchases by phone model, order ID, or seller..."
              className="w-full h-10 pl-9 pr-8 rounded-[var(--pb-radius-sm)] border border-border bg-surface text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-brand"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Sort selector */}
          <div className="flex items-center gap-2 self-end md:self-auto">
            <span className="text-xs text-ink-soft flex items-center gap-1">
              <ArrowUpDown className="h-3.5 w-3.5" /> Sort:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="h-9 px-3 rounded-[var(--pb-radius-sm)] border border-border bg-surface text-xs font-medium text-ink focus:outline-none focus:border-brand cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="price-asc">Price: Low to High</option>
            </select>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-border">
          {(
            [
              { id: "all", label: "All Orders", count: counts.all },
              { id: "processing", label: "Processing", count: counts.processing },
              { id: "shipped", label: "In Transit", count: counts.shipped },
              { id: "delivered", label: "Delivered", count: counts.delivered },
              { id: "cancelled", label: "Cancelled", count: counts.cancelled },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                statusFilter === tab.id
                  ? "bg-brand text-white shadow-xs"
                  : "bg-bg text-ink-soft hover:bg-black/[0.04] hover:text-ink"
              }`}
            >
              {tab.label}{" "}
              <span
                className={`ml-1 text-[11px] ${
                  statusFilter === tab.id ? "text-white/80" : "text-ink-faint"
                }`}
              >
                ({tab.count})
              </span>
            </button>
          ))}
        </div>
      </Card>

      {/* Purchase Cards List */}
      <div className="space-y-3">
        {filteredPurchases.length === 0 ? (
          <Card className="py-12 text-center">
            <div className="h-12 w-12 rounded-full bg-brand-tint/60 text-brand mx-auto flex items-center justify-center mb-3">
              <SlidersHorizontal className="h-6 w-6" />
            </div>
            <p className="font-semibold text-ink">No purchases match your criteria</p>
            <p className="mt-1 text-xs text-ink-soft">
              Try searching with different terms or reset your filters.
            </p>
            {(search || statusFilter !== "all") && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("all");
                }}
                className="mt-4"
              >
                Reset filters
              </Button>
            )}
          </Card>
        ) : (
          filteredPurchases.map((purchase) => {
            const cfg = statusConfig[purchase.status] ?? statusConfig.processing;
            const Icon = cfg.icon;

            return (
              <Card
                key={purchase.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-brand/30 hover:shadow-xs"
              >
                <div className="flex items-center gap-4">
                  <div className="relative h-16 w-16 rounded-[var(--pb-radius-sm)] bg-bg border border-border flex items-center justify-center shrink-0 p-2">
                    <Image
                      src={imageForModel(purchase.model, purchase.image)}
                      alt={purchase.model}
                      width={48}
                      height={48}
                      className="object-contain max-h-full"
                    />
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-semibold text-ink text-sm sm:text-base leading-tight">
                      {purchase.model}
                    </h3>
                    <p className="text-xs text-ink-soft">
                      Order <code className="font-mono text-brand">{purchase.id}</code> ·{" "}
                      {formatDate(purchase.created_at)}
                    </p>
                    <p className="text-xs text-ink-faint">
                      Sold by <strong className="text-ink-soft">{purchase.seller}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-border">
                  <div className="text-left sm:text-right">
                    <p className="font-data font-bold text-ink text-base sm:text-lg">
                      {formatPKR(purchase.price)}
                    </p>
                    <div className="mt-1">
                      <Badge tone={cfg.tone} icon={<Icon className="h-3 w-3" />}>
                        {cfg.label}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedOrder(purchase)}
                      className="h-8 px-2.5 text-xs"
                    >
                      <Eye className="h-3.5 w-3.5 mr-1" />
                      Details
                    </Button>

                    {purchase.status !== "cancelled" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDisputeOrder(purchase)}
                        className="h-8 px-2 text-xs text-ink-faint hover:text-danger hover:bg-danger-tint"
                        title="Report an issue / Open dispute"
                      >
                        Help
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Buyer Protection Footer Note */}
      <div className="flex items-center gap-2 text-xs text-ink-soft bg-surface p-3.5 rounded-[var(--pb-radius-sm)] border border-border">
        <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
        <span>
          <strong>PhoneBay Buyer Guarantee:</strong> Your payment is held safely in escrow and only released to the seller after you receive and confirm your phone matches the verified condition.
        </span>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <Modal
          open={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          title={`Order Tracker: ${selectedOrder.id}`}
          size="lg"
        >
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-border">
              <div className="relative h-14 w-14 rounded-[var(--pb-radius-sm)] bg-bg border border-border p-2 flex items-center justify-center shrink-0">
                <Image
                  src={imageForModel(selectedOrder.model, selectedOrder.image)}
                  alt="Phone"
                  width={40}
                  height={40}
                  className="object-contain"
                />
              </div>
              <div>
                <h3 className="font-bold text-ink text-base">{selectedOrder.model}</h3>
                <p className="text-xs text-ink-soft">
                  Purchased from <strong>{selectedOrder.seller}</strong> on {formatDate(selectedOrder.created_at)}
                </p>
                <p className="font-data font-bold text-brand text-sm mt-0.5">
                  {formatPKR(selectedOrder.price)}
                </p>
              </div>
            </div>

            {/* Delivery Progress Bar */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-soft">
                Fulfillment & Courier Tracking
              </h4>
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div
                  className={`p-2.5 rounded-[var(--pb-radius-sm)] border ${
                    selectedOrder.status !== "cancelled"
                      ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                      : "bg-bg border-border text-ink-faint"
                  }`}
                >
                  <CheckCircle2 className="h-4 w-4 mx-auto mb-1 text-emerald-600" />
                  <strong>1. Verified</strong>
                </div>

                <div
                  className={`p-2.5 rounded-[var(--pb-radius-sm)] border ${
                    selectedOrder.status === "shipped" || selectedOrder.status === "delivered"
                      ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                      : "bg-bg border-border text-ink-faint"
                  }`}
                >
                  <Truck className="h-4 w-4 mx-auto mb-1 text-brand" />
                  <strong>2. Shipped</strong>
                </div>

                <div
                  className={`p-2.5 rounded-[var(--pb-radius-sm)] border ${
                    selectedOrder.status === "delivered"
                      ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                      : "bg-bg border-border text-ink-faint"
                  }`}
                >
                  <PackageCheck className="h-4 w-4 mx-auto mb-1 text-emerald-600" />
                  <strong>3. Delivered</strong>
                </div>

                <div
                  className={`p-2.5 rounded-[var(--pb-radius-sm)] border ${
                    selectedOrder.status === "delivered"
                      ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                      : "bg-bg border-border text-ink-faint"
                  }`}
                >
                  <ShieldCheck className="h-4 w-4 mx-auto mb-1 text-emerald-600" />
                  <strong>4. Released</strong>
                </div>
              </div>
            </div>

            {/* Courier Tracking Box */}
            <div className="p-3.5 rounded-[var(--pb-radius-sm)] bg-surface border border-border flex items-center justify-between text-xs">
              <div>
                <span className="text-ink-faint">Insured Express Courier</span>
                <p className="font-semibold text-ink">
                  {selectedOrder.tracking_number || "TCS-928471628"}
                </p>
              </div>
              <Badge tone="brand">Tracked Live</Badge>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedOrder(null)}
              >
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setDisputeOrder(selectedOrder);
                  setSelectedOrder(null);
                }}
              >
                Need Help with Order?
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Open Dispute Modal */}
      {disputeOrder && (
        <Modal
          open={!!disputeOrder}
          onClose={() => setDisputeOrder(null)}
          title={`Open Buyer Protection Claim: ${disputeOrder.id}`}
          size="md"
        >
          <form onSubmit={handleDisputeSubmit} className="space-y-4">
            <div className="p-3 rounded-[var(--pb-radius-sm)] bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
              <span>
                Filing an issue freezes the escrow payment immediately. Our arbitration team will inspect the verified inspection report and contact both parties within 24 hours.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-ink-soft mb-1">
                Issue Category
              </label>
              <select
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value)}
                className="w-full h-9 px-3 rounded-[var(--pb-radius-sm)] border border-border bg-surface text-xs font-medium text-ink focus:outline-none focus:border-brand"
              >
                <option value="Physical condition does not match listing description">
                  Physical condition does not match listing description
                </option>
                <option value="Battery health significantly lower than certified">
                  Battery health significantly lower than certified
                </option>
                <option value="PTA tax / SIM registration issue">
                  PTA tax / SIM registration issue
                </option>
                <option value="Package damaged in transit">
                  Package damaged in transit
                </option>
                <option value="Wrong phone model received">
                  Wrong phone model received
                </option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-ink-soft mb-1">
                Describe the discrepancy
              </label>
              <textarea
                rows={3}
                required
                value={disputeNotes}
                onChange={(e) => setDisputeNotes(e.target.value)}
                placeholder="Detail what you observed upon receiving the device..."
                className="w-full p-2.5 rounded-[var(--pb-radius-sm)] border border-border text-xs text-ink focus:outline-none focus:border-brand"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => setDisputeOrder(null)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                type="submit"
              >
                Submit Protection Claim
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
