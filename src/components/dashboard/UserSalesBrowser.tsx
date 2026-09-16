"use client";

import * as React from "react";
import Image from "next/image";
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
  DollarSign,
  ArrowUpDown,
  CheckCircle2,
  Printer,
  X,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { formatPKR, formatDate } from "@/lib/utils";

export type UserSaleItem = {
  id: string;
  model: string;
  price: number;
  status: "processing" | "shipped" | "delivered" | "cancelled";
  created_at: string;
  buyer: string;
  image?: string;
  tracking_number?: string;
  shipping_city?: string;
};

const statusConfig = {
  processing: { label: "Awaiting Dispatch", icon: Clock, tone: "warn" as const },
  shipped: { label: "In Transit", icon: Truck, tone: "brand" as const },
  delivered: { label: "Delivered & Paid", icon: PackageCheck, tone: "verify" as const },
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

export function UserSalesBrowser({ initialSales }: { initialSales: UserSaleItem[] }) {
  const [sales, setSales] = React.useState<UserSaleItem[]>(initialSales);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [sortBy, setSortBy] = React.useState<"newest" | "oldest" | "price-desc" | "price-asc">("newest");
  const [selectedSale, setSelectedSale] = React.useState<UserSaleItem | null>(null);
  const [trackingModalSale, setTrackingModalSale] = React.useState<UserSaleItem | null>(null);
  const [courierName, setCourierName] = React.useState("TCS Express");
  const [trackingInput, setTrackingInput] = React.useState("");
  const [toast, setToast] = React.useState<{ msg: string; type: "success" | "error" } | null>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleUpdateTracking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingModalSale) return;
    const finalTracking = `${courierName.split(" ")[0]}-${trackingInput || "928471628"}`;

    setSales((prev) =>
      prev.map((s) =>
        s.id === trackingModalSale.id
          ? { ...s, status: "shipped", tracking_number: finalTracking }
          : s
      )
    );
    showToast(`Order marked as In Transit with courier tracking ${finalTracking}`);
    setTrackingModalSale(null);
    setTrackingInput("");
  };

  const filteredSales = React.useMemo(() => {
    return sales
      .filter((item) => {
        if (statusFilter !== "all" && item.status !== statusFilter) {
          return false;
        }
        if (search.trim()) {
          const q = search.toLowerCase().trim();
          const match =
            item.model.toLowerCase().includes(q) ||
            item.id.toLowerCase().includes(q) ||
            item.buyer.toLowerCase().includes(q);
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
  }, [sales, search, statusFilter, sortBy]);

  const totalEarnings = sales
    .filter((s) => s.status === "delivered")
    .reduce((sum, s) => sum + s.price * 0.97, 0);

  const pendingEscrow = sales
    .filter((s) => s.status === "processing" || s.status === "shipped")
    .reduce((sum, s) => sum + s.price * 0.97, 0);

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

      {/* Seller Financial Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-faint">
              Disbursed Net Earnings
            </p>
            <p className="text-xl font-bold font-data text-emerald-700 mt-1">
              {formatPKR(totalEarnings)}
            </p>
          </div>
          <div className="h-9 w-9 rounded-[var(--pb-radius-sm)] bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <DollarSign className="h-5 w-5" />
          </div>
        </Card>

        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-faint">
              Escrow Pending Release
            </p>
            <p className="text-xl font-bold font-data text-amber-700 mt-1">
              {formatPKR(pendingEscrow)}
            </p>
          </div>
          <div className="h-9 w-9 rounded-[var(--pb-radius-sm)] bg-amber-50 text-amber-700 flex items-center justify-center">
            <ShieldCheck className="h-5 w-5" />
          </div>
        </Card>
      </div>

      {/* Controls */}
      <Card className="p-4 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-faint pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search sales by device model, sale ID, or buyer name..."
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
          {[
            { id: "all", label: "All Sales" },
            { id: "processing", label: "Awaiting Dispatch" },
            { id: "shipped", label: "In Transit" },
            { id: "delivered", label: "Completed" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                statusFilter === tab.id
                  ? "bg-brand text-white shadow-xs"
                  : "bg-bg text-ink-soft hover:bg-black/[0.04] hover:text-ink"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </Card>

      {/* Sales List */}
      <div className="space-y-3">
        {filteredSales.length === 0 ? (
          <Card className="py-12 text-center">
            <div className="h-12 w-12 rounded-full bg-brand-tint/60 text-brand mx-auto flex items-center justify-center mb-3">
              <SlidersHorizontal className="h-6 w-6" />
            </div>
            <p className="font-semibold text-ink">No sales found</p>
            <p className="mt-1 text-xs text-ink-soft">
              Try adjusting your search terms or filter selection.
            </p>
          </Card>
        ) : (
          filteredSales.map((sale) => {
            const cfg = statusConfig[sale.status] ?? statusConfig.processing;
            const Icon = cfg.icon;
            const netPayout = sale.price * 0.97;

            return (
              <Card
                key={sale.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-brand/30"
              >
                <div className="flex items-center gap-4">
                  <div className="relative h-16 w-16 rounded-[var(--pb-radius-sm)] bg-bg border border-border flex items-center justify-center shrink-0 p-2">
                    <Image
                      src={imageForModel(sale.model, sale.image)}
                      alt={sale.model}
                      width={48}
                      height={48}
                      className="object-contain max-h-full"
                    />
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-semibold text-ink text-sm sm:text-base leading-tight">
                      {sale.model}
                    </h3>
                    <p className="text-xs text-ink-soft">
                      Sale Reference: <code className="font-mono text-brand">{sale.id}</code> ·{" "}
                      {formatDate(sale.created_at)}
                    </p>
                    <p className="text-xs text-ink-faint">
                      Buyer: <strong className="text-ink-soft">{sale.buyer}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-border">
                  <div className="text-left sm:text-right">
                    <p className="font-data font-bold text-ink text-base sm:text-lg">
                      {formatPKR(sale.price)}
                    </p>
                    <p className="text-[11px] text-emerald-700 font-medium">
                      Net Payout: {formatPKR(netPayout)}
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
                      onClick={() => setSelectedSale(sale)}
                      className="h-8 px-2.5 text-xs"
                    >
                      <Eye className="h-3.5 w-3.5 mr-1" />
                      Details
                    </Button>

                    {sale.status === "processing" && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          setTrackingModalSale(sale);
                          setTrackingInput("");
                        }}
                        className="h-8 px-2.5 text-xs bg-sky-600 hover:bg-sky-700"
                      >
                        <Truck className="h-3.5 w-3.5 mr-1" />
                        Dispatch
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Sale Details Modal */}
      {selectedSale && (
        <Modal
          open={!!selectedSale}
          onClose={() => setSelectedSale(null)}
          title={`Sale Breakdown: ${selectedSale.id}`}
          size="md"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <h3 className="font-bold text-ink text-sm">{selectedSale.model}</h3>
                <p className="text-xs text-ink-soft">Sold to {selectedSale.buyer}</p>
              </div>
              <Badge tone={statusConfig[selectedSale.status]?.tone}>
                {statusConfig[selectedSale.status]?.label}
              </Badge>
            </div>

            {/* Financial Payout Calculation */}
            <div className="p-3.5 rounded-[var(--pb-radius-sm)] bg-bg border border-border space-y-2 text-xs">
              <div className="flex justify-between text-ink-soft">
                <span>Sale Gross Price:</span>
                <span className="font-data font-semibold text-ink">{formatPKR(selectedSale.price)}</span>
              </div>
              <div className="flex justify-between text-ink-soft">
                <span>PhoneBay Protection & Escrow Fee (3%):</span>
                <span className="text-danger font-data">- {formatPKR(selectedSale.price * 0.03)}</span>
              </div>
              <div className="pt-2 border-t border-border flex justify-between font-bold text-sm text-ink">
                <span>Your Net Bank Disbursement:</span>
                <span className="font-data text-emerald-700">{formatPKR(selectedSale.price * 0.97)}</span>
              </div>
            </div>

            {selectedSale.tracking_number && (
              <div className="p-3 rounded-[var(--pb-radius-sm)] bg-surface border border-border text-xs flex items-center justify-between">
                <span>Courier Tracking Number:</span>
                <code className="font-mono font-bold text-brand">{selectedSale.tracking_number}</code>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedSale(null)}
              >
                Close
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => showToast("Shipping packing slip generated and ready for print.")}
              >
                <Printer className="h-3.5 w-3.5 mr-1" />
                Print Packing Slip
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Enter Tracking & Dispatch Modal */}
      {trackingModalSale && (
        <Modal
          open={!!trackingModalSale}
          onClose={() => setTrackingModalSale(null)}
          title={`Dispatch Order: ${trackingModalSale.id}`}
          size="sm"
        >
          <form onSubmit={handleUpdateTracking} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-ink-soft mb-1">
                Courier Service
              </label>
              <select
                value={courierName}
                onChange={(e) => setCourierName(e.target.value)}
                className="w-full h-9 px-3 rounded-[var(--pb-radius-sm)] border border-border bg-surface text-xs font-medium text-ink focus:outline-none focus:border-brand"
              >
                <option value="TCS Express">TCS Express</option>
                <option value="Leopard Courier">Leopard Courier</option>
                <option value="M&P Logistics">M&P Logistics</option>
                <option value="PostEx">PostEx</option>
                <option value="Trax Logistics">Trax Logistics</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-ink-soft mb-1">
                Airway Bill / Tracking Number
              </label>
              <input
                required
                value={trackingInput}
                onChange={(e) => setTrackingInput(e.target.value)}
                placeholder="e.g. 984210385"
                className="w-full h-9 px-3 rounded-[var(--pb-radius-sm)] border border-border bg-surface text-xs text-ink focus:outline-none focus:border-brand"
              />
              <p className="text-[11px] text-ink-faint mt-1">
                The buyer will immediately receive SMS and email notification with tracking updates.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => setTrackingModalSale(null)}
              >
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit">
                Confirm Shipment
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
