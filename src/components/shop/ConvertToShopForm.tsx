"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Store } from "lucide-react";
import { Input, Label } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { UserRecord } from "@/server/types";

export function ConvertToShopForm({ user }: { user: UserRecord }) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const shopName = String(data.get("shopName") || "").trim();
    const shopEmail = String(data.get("shopEmail") || "").trim();
    const city = String(data.get("city") || "").trim();
    const shopType = String(data.get("shopType") || "general");
    const services = String(data.get("services") || "").trim();

    if (shopName.length < 2) {
      setError("Please enter a shop name.");
      return;
    }

    setLoading(true);
    setError("");

    const response = await fetch("/api/shop/convert", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        shopName,
        shopEmail: shopEmail || null,
        city: city || null,
        shopType,
        services: services || null,
      }),
    });

    const result = await response.json().catch(() => ({}));
    setLoading(false);

    if (!response.ok) {
      setError(result.error ?? "Unable to convert your account to a shop.");
      return;
    }

    router.push("/shop/dashboard");
    router.refresh();
  };

  return (
    <Card className="max-w-xl">
      <div className="flex items-center gap-2.5 mb-1">
        <Store className="h-5 w-5 text-brand" />
        <h2 className="text-lg font-semibold text-ink">Become a Shop</h2>
      </div>
      <p className="text-sm text-ink-soft mb-6">
        Convert your account (<span className="font-medium">{user.email}</span>) into a shop. Your existing
        listings, orders, and messages stay on this account — you&apos;ll just get shop tools (inventory,
        testing, buyback, reviews) and a shop profile buyers can see.
      </p>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        {error && <p className="text-sm text-danger bg-danger-tint rounded-(--pb-radius-sm) px-3.5 py-2.5">{error}</p>}

        <div>
          <Label htmlFor="shopName" required>Shop Name</Label>
          <Input id="shopName" name="shopName" placeholder="e.g. Ahmed Mobile Store" defaultValue={user.fullName} />
        </div>

        <div>
          <Label htmlFor="shopEmail">Shop Contact Email (optional)</Label>
          <Input id="shopEmail" name="shopEmail" type="email" placeholder={user.email} />
        </div>

        <div>
          <Label htmlFor="city">City (optional)</Label>
          <Input id="city" name="city" defaultValue={user.city ?? ""} placeholder="e.g. Islamabad" />
        </div>

        <div>
          <Label htmlFor="shopType" required>Shop Type</Label>
          <select
            id="shopType"
            name="shopType"
            defaultValue="general"
            className="w-full rounded-(--pb-radius-sm) border border-line bg-surface px-3.5 py-2.5 text-sm text-ink"
          >
            <option value="general">General — buy &amp; sell new and used phones</option>
            <option value="new_phones">New Phones Only — sell brand-new stock</option>
          </select>
          <p className="mt-1.5 text-[13px] text-ink-faint">
            New Phones Only shops list under the marketplace&apos;s New Phones category.
          </p>
        </div>

        <div>
          <Label htmlFor="services">Services (optional)</Label>
          <Input id="services" name="services" placeholder="Device Testing, Certification, Buyback" />
        </div>

        <Button type="submit" loading={loading} className="self-start">
          Convert My Account
        </Button>
      </form>
    </Card>
  );
}
