import type { Metadata } from "next";
import { AdminReportsManager } from "@/components/dashboard/AdminReportsManager";
import { getAdminData } from "../_data";

export const metadata: Metadata = {
  title: "Admin Reports & Analytics | PhoneBay",
  description: "Marketplace GMV, take rates, financial audits, and operational KPIs.",
};

export default async function AdminReportsPage() {
  const { reports } = await getAdminData();

  return (
    <div className="space-y-6">
      <AdminReportsManager reports={reports} />
    </div>
  );
}
