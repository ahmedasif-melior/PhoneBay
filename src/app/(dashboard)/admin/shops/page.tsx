import type { Metadata } from "next";
import { AdminDataTable } from "@/components/dashboard/AdminDataTable";
import { getAdminData } from "../_data";

export const metadata: Metadata = { title: "Admin Shops" };

export default async function AdminShopsPage() {
  const { recentShops } = await getAdminData();
  return <AdminDataTable title="Shops" description="Registered shops and their verification status." rows={recentShops} columns={[
    { label: "Shop", value: (shop) => shop.shop_name },
    { label: "Owner", value: (shop) => shop.owner_name },
    { label: "City", value: (shop) => shop.city },
    { label: "Status", value: (shop) => shop.verified ? "Approved" : "Pending" },
  ]} />;
}
