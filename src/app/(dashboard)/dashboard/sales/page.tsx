import type { Metadata } from "next";
import Image from "next/image";
import { ShieldCheck, Truck, PackageCheck, Clock } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatPKR, formatDate } from "@/lib/utils";
import { getCurrentUser } from "@/server/http";
import { db } from "@/server/db";

export const metadata: Metadata = { title: "Sales" };

const statusConfig = {
  processing: { label: "Processing", icon: Clock, tone: "warn" as const },
  shipped: { label: "Shipped", icon: Truck, tone: "brand" as const },
  delivered: { label: "Delivered", icon: PackageCheck, tone: "verify" as const },
  cancelled: { label: "Cancelled", icon: Clock, tone: "danger" as const },
};

function imageForModel(model: string): string {
  const key = model.toLowerCase();
  if (key.includes("iphone 15 pro")) return "/images/phones/iphone-15-pro.svg";
  if (key.includes("iphone 14")) return "/images/phones/iphone-14.svg";
  if (key.includes("s24")) return "/images/phones/galaxy-s24.svg";
  if (key.includes("s23")) return "/images/phones/galaxy-s23.svg";
  if (key.includes("pixel")) return "/images/phones/pixel-9.svg";
  return "/images/phones/iphone-15.webp";
}

export default async function SalesPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const sales = db.prepare(
    `SELECT o.id, o.price, o.status, o.created_at, l.model, u.full_name AS buyer
     FROM orders o JOIN listings l ON l.id = o.listing_id JOIN users u ON u.id = o.buyer_id
     WHERE l.seller_id = ? ORDER BY o.created_at DESC`
  ).all(user.id) as {
    id: string;
    price: number;
    status: keyof typeof statusConfig;
    created_at: string;
    model: string;
    buyer: string;
  }[];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-ink">Sales</h1>
      <p className="text-ink-soft mt-1">Manage and monitor your phone sales to buyers.</p>

      <div className="mt-7 flex flex-col gap-4">
        {sales.length === 0 && (
          <Card>
            <p className="text-sm text-ink-faint">You have no sales yet.</p>
          </Card>
        )}

        {sales.map((sale) => {
          const cfg = statusConfig[sale.status];
          return (
            <Card key={sale.id} className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="h-16 w-16 rounded-[var(--pb-radius-sm)] bg-bg border border-border flex items-center justify-center shrink-0">
                <Image src={imageForModel(sale.model)} alt="" width={48} height={48} className="object-contain h-4/5 w-4/5" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-medium text-ink">{sale.model}</p>
                <p className="text-xs text-ink-faint mt-0.5">
                  Sale {sale.id} · {formatDate(sale.created_at)} · Bought by {sale.buyer}
                </p>
              </div>

              <div className="flex items-center gap-6 sm:gap-8">
                <p className="font-data font-semibold text-ink">{formatPKR(sale.price)}</p>
                <Badge tone={cfg.tone} icon={<cfg.icon className="h-3 w-3" />}>
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
