import type { Metadata } from "next";
import Image from "next/image";
import { ShieldCheck, Truck, PackageCheck, Clock } from "lucide-react";

import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatPKR, formatDate } from "@/lib/utils";
import { getCurrentUser } from "@/server/http";
import { getAdminDb } from "@/server/db";

export const metadata: Metadata = {
  title: "Sales",
};

const statusConfig = {
  processing: {
    label: "Processing",
    icon: Clock,
    tone: "warn" as const,
  },
  shipped: {
    label: "Shipped",
    icon: Truck,
    tone: "brand" as const,
  },
  delivered: {
    label: "Delivered",
    icon: PackageCheck,
    tone: "verify" as const,
  },
  cancelled: {
    label: "Cancelled",
    icon: Clock,
    tone: "danger" as const,
  },
};

function imageForModel(model: string): string {
  const key = model.toLowerCase();

  if (key.includes("iphone 15 pro")) {
    return "/images/phones/iphone-15-pro.svg";
  }

  if (key.includes("iphone 14")) {
    return "/images/phones/iphone-14.svg";
  }

  if (key.includes("s24")) {
    return "/images/phones/galaxy-s24.svg";
  }

  if (key.includes("s23")) {
    return "/images/phones/galaxy-s23.svg";
  }

  if (key.includes("pixel")) {
    return "/images/phones/pixel-9.svg";
  }

  return "/images/phones/iphone-15.webp";
}

type SaleRow = {
  id: string;
  price: number;
  status: keyof typeof statusConfig;
  created_at: string;
  buyer_id: string;
  model: string;
};

export default async function SalesPage() {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  const db = getAdminDb();

  // 1. Fetch orders where user is the seller
  const [ordersResult, soldListings] = await Promise.all([
    db
      .from("orders")
      .select("id, price, status, created_at, buyer_id, listing_id")
      .eq("seller_id", user.id)
      .order("created_at", { ascending: false }),
    db
      .from("listings")
      .select("id, model, brand, price, created_at, status")
      .eq("seller_id", user.id)
      .eq("status", "sold")
      .order("created_at", { ascending: false }),
  ]);

  const ordersData = (ordersResult.data ?? []) as Array<{
    id: string;
    price: number;
    status: keyof typeof statusConfig;
    created_at: string;
    buyer_id: string;
    listing_id: string;
  }>;

  const soldListingsData = (soldListings.data ?? []) as Array<{
    id: string;
    model: string;
    brand: string;
    price: number;
    created_at: string;
    status: string;
  }>;

  // Fetch listing details for orders
  const orderListingIds = [...new Set(ordersData.map((o) => o.listing_id).filter(Boolean))];
  const listingsMap = new Map<string, string>();
  if (orderListingIds.length > 0) {
    const { data: listings } = await db
      .from("listings")
      .select("id, model")
      .in("id", orderListingIds);
    (listings ?? []).forEach((l: any) => listingsMap.set(l.id, l.model));
  }

  // Fetch buyer names cleanly from public.users table
  const buyerIds = [...new Set(ordersData.map((o) => o.buyer_id).filter(Boolean))];
  const buyerNames = new Map<string, string>();
  if (buyerIds.length > 0) {
    const { data: buyers } = await db
      .from("users")
      .select("id, full_name, email")
      .in("id", buyerIds);
    (buyers ?? []).forEach((b: any) => {
      buyerNames.set(b.id, b.full_name?.trim() || b.email || "Buyer");
    });
  }

  const existingOrderListingIds = new Set(ordersData.map((o) => o.listing_id));

  // Combine order-based sales with directly sold listings
  const sales: Array<{
    id: string;
    price: number;
    status: keyof typeof statusConfig;
    created_at: string;
    model: string;
    buyer: string;
  }> = [
    ...ordersData.map((order) => ({
      id: order.id,
      price: Number(order.price),
      status: (statusConfig[order.status] ? order.status : "processing") as keyof typeof statusConfig,
      created_at: order.created_at,
      model: listingsMap.get(order.listing_id) ?? "Phone",
      buyer: buyerNames.get(order.buyer_id) ?? "Buyer",
    })),
    ...soldListingsData
      .filter((l) => !existingOrderListingIds.has(l.id))
      .map((listing) => ({
        id: `DIRECT-${listing.id.slice(0, 8)}`,
        price: Number(listing.price),
        status: "delivered" as const,
        created_at: listing.created_at,
        model: listing.model,
        buyer: "Direct Buyer / Meetup",
      })),
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-ink">
        Sales
      </h1>

      <p className="text-ink-soft mt-1">
        Manage and monitor your phone sales to buyers.
      </p>

      <div className="mt-7 flex flex-col gap-4">
        {sales.length === 0 && (
          <Card>
            <p className="text-sm text-ink-faint">
              You have no sales yet.
            </p>
          </Card>
        )}

        {sales.map((sale) => {
          const cfg =
            statusConfig[sale.status] ??
            statusConfig.processing;

          const Icon = cfg.icon;

          return (
            <Card
              key={sale.id}
              className="flex flex-col gap-4 sm:flex-row sm:items-center"
            >
              <div className="h-16 w-16 rounded-[var(--pb-radius-sm)] bg-bg border border-border flex items-center justify-center shrink-0">
                <Image
                  src={imageForModel(sale.model)}
                  alt=""
                  width={48}
                  height={48}
                  className="object-contain h-4/5 w-4/5"
                />
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-medium text-ink">
                  {sale.model}
                </p>

                <p className="text-xs text-ink-faint mt-0.5">
                  Sale {sale.id} ·{" "}
                  {formatDate(sale.created_at)} · Bought by{" "}
                  {sale.buyer}
                </p>
              </div>

              <div className="flex items-center gap-6 sm:gap-8">
                <p className="font-data font-semibold text-ink">
                  {formatPKR(sale.price)}
                </p>

                <Badge
                  tone={cfg.tone}
                  icon={<Icon className="h-3 w-3" />}
                >
                  {cfg.label}
                </Badge>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="mt-6 flex items-center gap-2.5 text-sm text-ink-faint">
        <ShieldCheck className="h-4 w-4 text-verify" />
        Verified sales are protected by PhoneBay seller safeguards.
      </div>
    </div>
  );
}