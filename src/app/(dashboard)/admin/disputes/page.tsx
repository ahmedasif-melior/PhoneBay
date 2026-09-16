import type { Metadata } from "next";
import { AdminDisputesManager } from "@/components/dashboard/AdminDisputesManager";
import { getAdminData } from "../_data";

export const metadata: Metadata = {
  title: "Admin Disputes Resolution | PhoneBay",
  description: "Escrow arbitration, buyer complaints, and condition mismatch resolutions.",
};

export default async function AdminDisputesPage() {
  const { disputes } = await getAdminData();

  return (
    <div className="space-y-6">
      <AdminDisputesManager initialDisputes={disputes} />
    </div>
  );
}
