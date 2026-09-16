import type { Metadata } from "next";
import { AdminOpportunitiesManager } from "@/components/dashboard/AdminOpportunitiesManager";
import { getAdminData } from "../_data";

export const metadata: Metadata = {
  title: "Admin Opportunities Pipeline | PhoneBay",
  description: "Wholesale lots, certified shop networks, and bulk trade-in pipeline.",
};

export default async function AdminOpportunitiesPage() {
  const { opportunities } = await getAdminData();

  return (
    <div className="space-y-6">
      <AdminOpportunitiesManager initialOpportunities={opportunities} />
    </div>
  );
}
