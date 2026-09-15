import type { Metadata } from "next";
import { AdminShopsManager } from "@/components/dashboard/AdminShopsManager";
import { getAdminData } from "../_data";

export const metadata: Metadata = { title: "Admin Shops" };

export default async function AdminShopsPage() {
  const { recentShops } = await getAdminData();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Shop Network Management</h1>
        <p className="mt-1 text-ink-soft">
          Approve, review, edit, and moderate registered partner shops across the PhoneBay platform.
        </p>
      </div>

      <AdminShopsManager initialShops={recentShops} />
    </div>
  );
}
