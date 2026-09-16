import type { Metadata } from "next";
import { AdminSettingsManager } from "@/components/dashboard/AdminSettingsManager";
import { getAdminData } from "../_data";

export const metadata: Metadata = {
  title: "Admin Platform Settings | PhoneBay",
  description: "Platform governance, commission fees, verification rules, and operational preferences.",
};

export default async function AdminSettingsPage() {
  const { settings } = await getAdminData();

  return (
    <div className="space-y-6">
      <AdminSettingsManager initialSettings={settings} />
    </div>
  );
}
