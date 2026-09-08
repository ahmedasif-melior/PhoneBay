import type { Metadata } from "next";
import { AdminDataTable } from "@/components/dashboard/AdminDataTable";
import { getAdminData } from "../_data";

export const metadata: Metadata = { title: "Admin Orders" };

export default async function AdminOrdersPage() {
  const { recentOrders } = await getAdminData();
  return <AdminDataTable title="Orders" description="Buyer-seller order flow and fulfillment checkpoints." rows={recentOrders} columns={[
    { label: "Listing", value: (order) => order.listing_name },
    { label: "Buyer", value: (order) => order.buyer_name },
    { label: "Seller", value: (order) => order.seller_name },
    { label: "Status", value: (order) => order.status },
    { label: "Price", value: (order) => `PKR ${order.price.toLocaleString()}` },
  ]} />;
}
