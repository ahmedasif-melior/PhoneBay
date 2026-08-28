"use client";

import * as React from "react";
import { Tabs } from "@/components/ui/Tabs";
import { Card } from "@/components/ui/Card";
import { Input, Label, Checkbox } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

const tabs = [
  { id: "account", label: "Account" },
  { id: "notifications", label: "Notifications" },
  { id: "security", label: "Security" },
  { id: "danger", label: "Danger Zone" },
];

export function SettingsTabs() {
  const [active, setActive] = React.useState("account");
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [notif, setNotif] = React.useState({
    listings: true,
    messages: true,
    marketing: false,
    verification: true,
  });

  return (
    <div>
      <Tabs tabs={tabs} active={active} onChange={setActive} variant="pill" />

      <div className="mt-6">
        {active === "account" && (
          <Card className="flex flex-col gap-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>Email</Label>
                <Input defaultValue="ahmed.asif@example.com" type="email" />
              </div>
              <div>
                <Label>Phone Number</Label>
                <Input defaultValue="+92 300 1234567" type="tel" />
              </div>
            </div>
            <Button className="self-start">Save Changes</Button>
          </Card>
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
                <Checkbox
                  checked={notif[key as keyof typeof notif]}
                  onChange={(e) => setNotif((n) => ({ ...n, [key]: e.target.checked }))}
                />
              </label>
            ))}
          </Card>
        )}

        {active === "security" && (
          <Card className="flex flex-col gap-4">
            <div>
              <Label>Current Password</Label>
              <Input type="password" />
            </div>
            <div>
              <Label>New Password</Label>
              <Input type="password" />
            </div>
            <Button className="self-start">Update Password</Button>
          </Card>
        )}

        {active === "danger" && (
          <Card className="border-danger/30">
            <h3 className="font-semibold text-ink">Delete account</h3>
            <p className="text-sm text-ink-soft mt-1.5">
              Permanently delete your PhoneBay account and all associated listings. This cannot be undone.
            </p>
            <Button variant="danger" className="mt-4" onClick={() => setDeleteOpen(true)}>
              Delete Account
            </Button>
          </Card>
        )}
      </div>

      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete your account?">
        <p className="text-sm text-ink-soft">
          This will permanently delete your account, listings, and messages. This action can't be undone.
        </p>
        <div className="flex gap-3 justify-end mt-6">
          <Button variant="outline" onClick={() => setDeleteOpen(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={() => setDeleteOpen(false)}>
            Delete Account
          </Button>
        </div>
      </Modal>
    </div>
  );
}
