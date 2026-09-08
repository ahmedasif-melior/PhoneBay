import type { Metadata } from "next";
import { SettingsTabs } from "@/components/dashboard/SettingsTabs";
import { getCurrentUser } from "@/server/http";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold text-ink">Settings</h1>
      <p className="text-ink-soft mt-1 mb-7">Manage your account preferences.</p>
      <SettingsTabs user={user} />
    </div>
  );
}
