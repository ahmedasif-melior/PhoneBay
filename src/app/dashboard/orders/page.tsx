import type { Metadata } from "next";
import Image from "next/image";
import { ShieldCheck, Truck, PackageCheck, Clock } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatPKR, formatDate } from "@/lib/utils";
import { orders } from "@/data/orders";

export const metadata: Metadata = { title: "Orders" };

const statusConfig = {
  processing: { label: "Processing", icon: Clock, tone: "warn" as const },
  shipped: { label: "Shipped", icon: Truck, tone: "brand" as const },
  delivered: { label: "Delivered", icon: PackageCheck, tone: "verify" as const },
  cancelled: { label: "Cancelled", icon: Clock, tone: "danger" as const },
};

export default function OrdersPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-ink">Orders</h1>
      <p className="text-ink-soft mt-1">Track your purchases and their delivery status.</p>

      <div className="mt-7 flex flex-col gap-4">
        {orders.map((order) => {
          const cfg = statusConfig[order.status];
          return (
            <Card key={order.id} className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="h-16 w-16 rounded-[var(--pb-radius-sm)] bg-bg border border-border flex items-center justify-center shrink-0">
                <Image src={order.image} alt="" width={48} height={48} className="object-contain h-4/5 w-4/5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-ink">{order.device}</p>
                <p className="text-xs text-ink-faint mt-0.5">
                  Order {order.id} · {formatDate(order.date)} · Sold by {order.seller}
                </p>
              </div>
              <div className="flex items-center gap-6 sm:gap-8">
                <p className="font-data font-semibold text-ink">{formatPKR(order.price)}</p>
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
        All orders are covered by PhoneBay Buyer Protection.
      </div>
    </div>
  );
}
