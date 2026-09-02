import type { Metadata } from "next";
import { Section } from "@/components/marketing/Section";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "Shop Inventory",
  description: "Devices this shop owns after buyback and has listed for resale.",
};

// Stub for shop-owned listings: once a buyback offer (see /shop/buyback) is
// accepted, the device becomes shop inventory and can be listed for resale
// the same way an individual seller lists a device.
export default function ShopInventoryPage() {
  return (
    <Section className="pt-10 sm:pt-14">
      <div className="mb-8">
        <p className="text-sm font-medium uppercase tracking-[0.12em] text-brand">Inventory</p>
        <h1 className="mt-2 text-3xl font-semibold text-ink">Shop-owned devices</h1>
        <p className="mt-2 text-ink-soft">
          Devices acquired through buyback and listed by this shop for resale.
        </p>
      </div>
      <Card className="p-8 text-center text-ink-soft">
        No inventory yet — accepted buybacks will appear here.
      </Card>
    </Section>
  );
}
