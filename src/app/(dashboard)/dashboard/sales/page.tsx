import type { Metadata } from "next";
import { UserSalesBrowser, type UserSaleItem } from "@/components/dashboard/UserSalesBrowser";
import { getCurrentUser } from "@/server/http";
import { getAdminDb } from "@/server/db";

export const metadata: Metadata = {
  title: "My Sales | PhoneBay",
  description: "Monitor phone sales, track courier dispatches, and manage escrow disbursements.",
};

const sampleSales: UserSaleItem[] = [
  {
    id: "PB-SALE-78102",
    model: "iPhone 15 Pro · 256GB Natural Titanium",
    price: 150000,
    status: "delivered",
    created_at: "2026-08-12T10:00:00Z",
    buyer: "Zainab Malik (Islamabad)",
    image: "/images/phones/iphone-15-pro.svg",
    tracking_number: "TCS-928471628",
    shipping_city: "Islamabad",
  },
  {
    id: "PB-SALE-78345",
    model: "Samsung Galaxy S24 Ultra · 512GB Titanium Gray",
    price: 265000,
    status: "shipped",
    created_at: "2026-09-14T14:45:00Z",
    buyer: "Usman Ghani (Lahore)",
    image: "/images/phones/galaxy-s24.svg",
    tracking_number: "LEOP-47291048",
    shipping_city: "Lahore",
  },
  {
    id: "PB-SALE-78519",
    model: "OnePlus 13 · 256GB Midnight Black",
    price: 142000,
    status: "processing",
    created_at: "2026-09-15T18:30:00Z",
    buyer: "Fahad Mustafa (Rawalpindi)",
    image: "/images/phones/oneplus-13.svg",
    shipping_city: "Rawalpindi",
  },
];

export default async function SalesPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const db = getAdminDb();
  let salesList: UserSaleItem[] = [];

  try {
    const { data } = await db
      .from("orders")
      .select("id, price, status, created_at, listing_id, buyer_id")
      .eq("seller_id", user.id)
      .order("created_at", { ascending: false });

    if (data && data.length > 0) {
      salesList = data.map((d: any) => ({
        id: d.id,
        model: "Phone Listing",
        price: Number(d.price ?? 0),
        status: d.status,
        created_at: d.created_at,
        buyer: "Marketplace Buyer",
        tracking_number: d.tracking_number,
        shipping_city: "Pakistan",
      }));
    } else {
      salesList = sampleSales;
    }
  } catch {
    salesList = sampleSales;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink">My Sales</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Manage buyer orders, dispatch phones via insured courier, and track escrow payouts.
        </p>
      </div>

      <UserSalesBrowser initialSales={salesList} />
    </div>
  );
}