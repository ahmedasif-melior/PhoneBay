import type { Metadata } from "next";
import { AdminVerificationManager } from "@/components/dashboard/AdminVerificationManager";
import { getAdminData } from "../_data";

export const metadata: Metadata = {
  title: "Admin Verification Requests | PhoneBay",
  description: "Manage phone inspection tests, calibrate scores, and issue verified device certificates.",
};

export default async function AdminVerificationRequestsPage() {
  const { verificationQueue } = await getAdminData();

  return (
    <div className="space-y-6">
      <AdminVerificationManager initialQueue={verificationQueue} />
    </div>
  );
}
