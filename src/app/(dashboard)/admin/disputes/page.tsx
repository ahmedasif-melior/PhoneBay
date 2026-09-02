import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser, isAdminRole } from "@/server/http";

export const metadata: Metadata = { title: "Admin Disputes" };

export default async function AdminDisputesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/sign-in");
  if (!isAdminRole(user.role)) redirect("/dashboard");

  return (
    <div>
      <h1 className="text-2xl font-semibold text-ink">Disputes</h1>
      <p className="mt-1 text-ink-soft">Escalations, complaints, and support follow-ups.</p>
    </div>
  );
}
