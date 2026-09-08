"use client";

import * as React from "react";
import { Tabs } from "@/components/ui/Tabs";
import { Card } from "@/components/ui/Card";
import { Input, Label, Checkbox } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { UserRecord } from "@/server/types";

const tabs = [
  { id: "account", label: "Account" },
  { id: "notifications", label: "Notifications" },
];

type Preferences = UserRecord["notificationPreferences"];

export function SettingsTabs({ user }: { user: UserRecord }) {
  const [active, setActive] = React.useState("account");
  const [phone, setPhone] = React.useState(user.phone ?? "");
  const [preferences, setPreferences] = React.useState<Preferences>(user.notificationPreferences);
  const [saving, setSaving] = React.useState(false);
  const [message, setMessage] = React.useState("");

  const save = async (payload: object) => {
    setSaving(true);
    setMessage("");
    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json().catch(() => ({}));
      setMessage(response.ok ? "Settings saved." : result.error ?? "Unable to save settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <Tabs tabs={tabs} active={active} onChange={setActive} variant="pill" />
      <div className="mt-6">
        {active === "account" && (
          <form className="flex flex-col gap-4" onSubmit={(event) => { event.preventDefault(); void save({ phone: phone || null }); }}>
            <Card className="flex flex-col gap-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div><Label>Email</Label><Input value={user.email} type="email" readOnly /></div>
                <div><Label>Phone Number</Label><Input value={phone} onChange={(event) => setPhone(event.target.value)} type="tel" placeholder="Add your phone number" /></div>
              </div>
              <p className="text-sm text-ink-soft">Account role: {user.role}</p>
              <Button type="submit" className="self-start" loading={saving}>Save Changes</Button>
            </Card>
          </form>
        )}
        {active === "notifications" && (
          <Card className="flex flex-col gap-4">
            {[
              ["listings", "New offers on my listings"],
              ["messages", "New messages"],
              ["verification", "Verification status updates"],
              ["marketing", "Product updates and offers"],
            ].map(([key, label]) => (
              <label key={key} className="flex items-center justify-between gap-4 py-1.5">
                <span className="text-sm text-ink">{label}</span>
                <Checkbox checked={preferences[key as keyof Preferences]} onChange={(event) => setPreferences((current) => ({ ...current, [key]: event.target.checked }))} />
              </label>
            ))}
            <Button className="self-start" loading={saving} onClick={() => void save({ notificationPreferences: preferences })}>Save Preferences</Button>
          </Card>
        )}
        {message && <p className="mt-4 text-sm text-ink-soft" role="status">{message}</p>}
      </div>
    </div>
  );
}
