import type { Metadata } from "next";
import { AdminSellersManager } from "@/components/dashboard/AdminSellersManager";
import { getAdminData } from "../_data";

export const metadata: Metadata = {
  title: "Admin Sellers | PhoneBay",
  description: "Monitor seller metrics, trust scores, and listing volume.",
};

export default async function AdminSellersPage() {
  const { usersWithListings } = await getAdminData();
  const sellers = usersWithListings.filter((user) => user.listing_count > 0 || user.role === "SHOP");

  return (
    <div className="space-y-6">
      <AdminSellersManager initialSellers={sellers} />
    </div>
  );
}
