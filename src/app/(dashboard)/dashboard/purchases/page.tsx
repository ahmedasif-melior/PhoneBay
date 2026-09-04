import type { Metadata } from "next";
import Image from "next/image";
import {
  ShieldCheck,
  Truck,
  PackageCheck,
  Clock,
} from "lucide-react";

import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatPKR, formatDate } from "@/lib/utils";
import { getCurrentUser } from "@/server/http";
import { getAdminDb } from "@/server/db";

export const metadata: Metadata = {
  title: "Purchases",
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

type PurchaseRow = {
  id: string;
  price: number;
  status: keyof typeof statusConfig;
  created_at: string;
  seller_id: string;
  model: string;
};

export default async function PurchasesPage() {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  const db = getAdminDb();

  const { data, error } = await db
    .from("orders")
    .select(
      `
        id,
        price,
        status,
        created_at,
        listings!inner (
          model,
          seller_id
        )
      `,
    )
    .eq("buyer_id", user.id)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    console.error(
      "[PURCHASES] Failed to load purchases:",
      error.message,
    );
  }

  const rows = (data ?? []) as Array<
    PurchaseRow & {
      listings:
        | {
            model: string;
            seller_id: string;
          }
        | {
            model: string;
            seller_id: string;
          }[];
    }
  >;

  const sellerIds = [
    ...new Set(
      rows
        .map((row) => {
          const listing = Array.isArray(row.listings)
            ? row.listings[0]
            : row.listings;

          return listing?.seller_id;
        })
        .filter(Boolean),
    ),
  ] as string[];

  const sellerNames = new Map<string, string>();

  await Promise.all(
    sellerIds.map(async (sellerId) => {
      try {
        const {
          data: { user: seller },
          error: sellerError,
        } = await db.auth.admin.getUserById(sellerId);

        if (sellerError || !seller) {
          return;
        }

        const fullName =
          typeof seller.user_metadata?.full_name === "string"
            ? seller.user_metadata.full_name.trim()
            : "";

        sellerNames.set(
          sellerId,
          fullName || seller.email || "Seller",
        );
      } catch (error) {
        console.error(
          `[PURCHASES] Failed to load seller ${sellerId}:`,
          error,
        );
      }
    }),
  );

  const purchases = rows.map((row) => {
    const listing = Array.isArray(row.listings)
      ? row.listings[0]
      : row.listings;

    return {
      id: row.id,
      price: Number(row.price),
      status: row.status,
      created_at: row.created_at,
      model: listing?.model ?? "Phone",
      seller:
        sellerNames.get(listing?.seller_id ?? "") ??
        "Seller",
    };
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold text-ink">
        Purchases
      </h1>

      <p className="text-ink-soft mt-1">
        Track the phones you bought and their delivery status.
      </p>

      <div className="mt-7 flex flex-col gap-4">
        {purchases.length === 0 && (
          <Card>
            <p className="text-sm text-ink-faint">
              You have no purchases yet.
            </p>
          </Card>
        )}

        {purchases.map((purchase) => {
          const cfg =
            statusConfig[purchase.status] ??
            statusConfig.processing;

          const Icon = cfg.icon;

          return (
            <Card
              key={purchase.id}
              className="flex flex-col gap-4 sm:flex-row sm:items-center"
            >
              <div className="h-16 w-16 rounded-[var(--pb-radius-sm)] bg-bg border border-border flex items-center justify-center shrink-0">
                <Image
                  src={imageForModel(purchase.model)}
                  alt=""
                  width={48}
                  height={48}
                  className="object-contain h-4/5 w-4/5"
                />
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-medium text-ink">
                  {purchase.model}
                </p>

                <p className="text-xs text-ink-faint mt-0.5">
                  Purchase {purchase.id} ·{" "}
                  {formatDate(purchase.created_at)} · Sold by{" "}
                  {purchase.seller}
                </p>
              </div>

              <div className="flex items-center gap-6 sm:gap-8">
                <p className="font-data font-semibold text-ink">
                  {formatPKR(purchase.price)}
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
        All purchases are covered by PhoneBay Buyer Protection.
      </div>
    </div>
  );
}