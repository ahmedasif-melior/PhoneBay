"use client";

import * as React from "react";
import { CheckCircle2 } from "lucide-react";
import { Input, Textarea, Label } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function ProfileEditForm() {
  const [saved, setSaved] = React.useState(false);

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }}
    >
      {saved && (
        <p className="flex items-center gap-2 text-sm text-verify-dark bg-verify-tint rounded-[var(--pb-radius-sm)] px-3.5 py-2.5">
          <CheckCircle2 className="h-4 w-4" /> Profile updated.
        </p>
      )}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label>Full Name</Label>
          <Input defaultValue="Ahmed Bin Asif" />
        </div>
        <div>
          <Label>City</Label>
          <Input defaultValue="Islamabad" />
        </div>
      </div>
      <div>
        <Label>Bio</Label>
        <Textarea defaultValue="Buying and selling phones on PhoneBay since 2025." />
      </div>
      <div>
        <Button type="submit">Save Changes</Button>
      </div>
    </form>
  );
}
