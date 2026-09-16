import type { Metadata } from "next";
import { AdminOrdersManager } from "@/components/dashboard/AdminOrdersManager";
import { getAdminData } from "../_data";

export const metadata: Metadata = {
  title: "Admin Orders & Escrow | PhoneBay",
  description: "Monitor orders, tracking, fulfillment status, and escrow releases.",
};

export default async function AdminOrdersPage() {
  const { recentOrders } = await getAdminData();

  return (
    <div className="space-y-6">
      <AdminOrdersManager initialOrders={recentOrders} />
    </div>
  );
}
