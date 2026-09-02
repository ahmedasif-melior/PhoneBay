"use client";

import * as React from "react";
import { CheckCircle2 } from "lucide-react";
import { Input, Textarea, Label, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { UserRecord } from "@/server/types";

const purposeOptions = [
  { value: "buyer", label: "Buyer" },
  { value: "seller", label: "Seller" },
  { value: "both", label: "Buyer + Seller" },
  { value: "shop", label: "Shop / verification partner" },
];

export function ProfileEditForm({ initialUser }: { initialUser?: Partial<UserRecord> | null }) {
  const [saved, setSaved] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [fullName, setFullName] = React.useState(initialUser?.fullName ?? "");
  const [city, setCity] = React.useState(initialUser?.city ?? "");
  const [bio, setBio] = React.useState(initialUser?.bio ?? "");
  const [purpose, setPurpose] = React.useState<UserRecord["accountPurpose"]>(initialUser?.accountPurpose ?? "both");

  React.useEffect(() => {
    setFullName(initialUser?.fullName ?? "");
    setCity(initialUser?.city ?? "");
    setBio(initialUser?.bio ?? "");
    setPurpose(initialUser?.accountPurpose ?? "both");
  }, [initialUser]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, city, bio, accountPurpose: purpose }),
      });
      if (!response.ok) {
        throw new Error("Unable to save profile.");
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      setSaved(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="flex flex-col gap-4" onSubmit={onSubmit}>
      {saved && (
        <p className="flex items-center gap-2 text-sm text-verify-dark bg-verify-tint rounded-[var(--pb-radius-sm)] px-3.5 py-2.5">
          <CheckCircle2 className="h-4 w-4" /> Profile updated.
        </p>
      )}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label>Full Name</Label>
          <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </div>
        <div>
          <Label>City</Label>
          <Input value={city} onChange={(e) => setCity(e.target.value)} />
        </div>
      </div>
      <div>
        <Label>Bio</Label>
        <Textarea value={bio} onChange={(e) => setBio(e.target.value)} />
      </div>
      <div>
        <Label>How do you want to use PhoneBay?</Label>
        <Select value={purpose ?? "both"} onChange={(e) => setPurpose(e.target.value as UserRecord["accountPurpose"])}>
          {purposeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <Button type="submit" loading={loading}>Save Changes</Button>
      </div>
    </form>
  );
}
