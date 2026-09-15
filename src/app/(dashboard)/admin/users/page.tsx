import type { Metadata } from "next";
import { AdminUsersManager } from "@/components/dashboard/AdminUsersManager";
import { getAdminData } from "../_data";

export const metadata: Metadata = { title: "Admin Users" };

export default async function AdminUsersPage() {
  const { usersWithListings } = await getAdminData();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">User Management</h1>
        <p className="mt-1 text-ink-soft">
          View, edit roles, block, or unblock all platform users.
        </p>
      </div>

      <AdminUsersManager initialUsers={usersWithListings} />
    </div>
  );
}
