import type { Metadata } from "next";
import { AdminListingsManager } from "@/components/dashboard/AdminListingsManager";
import { getAdminData } from "../_data";

export const metadata: Metadata = {
  title: "Admin Listings Moderation | PhoneBay",
  description: "Review, approve, pause, and moderate smartphone listings across the marketplace.",
};

export default async function AdminListingsPage() {
  const { recentListings } = await getAdminData();

  return (
    <div className="space-y-6">
      <AdminListingsManager initialListings={recentListings} />
    </div>
  );
}
