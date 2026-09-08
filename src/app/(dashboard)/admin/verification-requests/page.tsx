import type { Metadata } from "next";
import { AdminDataTable } from "@/components/dashboard/AdminDataTable";
import { getAdminData } from "../_data";

export const metadata: Metadata = { title: "Admin Verification Requests" };

export default async function AdminVerificationRequestsPage() {
  const { verificationQueue } = await getAdminData();
  return <AdminDataTable title="Verification Requests" description="Live device certification and review queue." rows={verificationQueue} columns={[
    { label: "Device", value: (request) => `${request.brand} ${request.model}` },
    { label: "Seller", value: (request) => request.seller_name },
    { label: "Status", value: (request) => request.status },
    { label: "Score", value: (request) => request.score ?? "Awaiting" },
  ]} />;
}
