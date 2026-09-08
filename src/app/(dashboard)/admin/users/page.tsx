import type { Metadata } from "next";
import { AdminDataTable } from "@/components/dashboard/AdminDataTable";
import { getAdminData } from "../_data";

export const metadata: Metadata = { title: "Admin Users" };

export default async function AdminUsersPage() {
  const { usersWithListings } = await getAdminData();
  return <AdminDataTable title="Users" description="User directory and account health overview." rows={usersWithListings} columns={[
    { label: "Name", value: (user) => user.full_name },
    { label: "Email", value: (user) => user.email },
    { label: "Role", value: (user) => user.role },
    { label: "Listings", value: (user) => user.listing_count },
    { label: "Trust", value: (user) => user.trust_score.toFixed(1) },
  ]} />;
}
