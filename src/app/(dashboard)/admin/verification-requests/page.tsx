import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser, isAdminRole } from "@/server/http";

export const metadata: Metadata = { title: "Admin Verification Requests" };

export default async function AdminVerificationRequestsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/sign-in");
  if (!isAdminRole(user.role)) redirect("/dashboard");

  return (
    <div>
      <h1 className="text-2xl font-semibold text-ink">Verification Requests</h1>
      <p className="mt-1 text-ink-soft">Review queue, score tracking, and device certification status.</p>
    </div>
  );
}
