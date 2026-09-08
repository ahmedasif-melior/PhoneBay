import type { Metadata } from "next";
import { AdminDataTable } from "@/components/dashboard/AdminDataTable";
import { getAdminData } from "../_data";

export const metadata: Metadata = { title: "Admin Sellers" };

export default async function AdminSellersPage() {
  const { usersWithListings } = await getAdminData();
  const sellers = usersWithListings.filter((user) => user.listing_count > 0);
  return <AdminDataTable title="Sellers" description="Seller activity, trust signals, and listing volume." rows={sellers} columns={[
    { label: "Name", value: (seller) => seller.full_name },
    { label: "Email", value: (seller) => seller.email },
    { label: "Active listings", value: (seller) => seller.listing_count },
    { label: "Sold listings", value: (seller) => seller.sold_count },
    { label: "Trust", value: (seller) => seller.trust_score.toFixed(1) },
  ]} />;
}
