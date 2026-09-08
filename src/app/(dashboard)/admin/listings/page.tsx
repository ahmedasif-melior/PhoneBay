import type { Metadata } from "next";
import { AdminDataTable } from "@/components/dashboard/AdminDataTable";
import { getAdminData } from "../_data";

export const metadata: Metadata = { title: "Admin Listings" };

export default async function AdminListingsPage() {
  const { recentListings } = await getAdminData();
  return <AdminDataTable title="Listings" description="Recent marketplace listings and moderation status." rows={recentListings} columns={[
    { label: "Device", value: (listing) => `${listing.brand} ${listing.model}` },
    { label: "Seller", value: (listing) => listing.seller },
    { label: "Status", value: (listing) => listing.status },
    { label: "Price", value: (listing) => `PKR ${listing.price.toLocaleString()}` },
  ]} />;
}
