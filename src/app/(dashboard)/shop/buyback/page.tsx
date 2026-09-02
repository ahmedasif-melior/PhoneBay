import type { Metadata } from "next";
import { Section } from "@/components/marketing/Section";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "Buyback Offers",
  description: "Trade-in devices submitted to this shop, pending or accepted buyback offers.",
};

// Stub for the shop trade-in / buyback flow: a user or seller submits a
// device, the shop evaluates it (reusing the DeviceTest step from
// /shop/testing), makes an offer, and on acceptance the device becomes
// shop-owned inventory (see /shop/inventory). Wire real data once the
// BuybackOffer entity exists on the backend.
export default function ShopBuybackPage() {
  return (
    <Section className="pt-10 sm:pt-14">
      <div className="mb-8">
        <p className="text-sm font-medium uppercase tracking-[0.12em] text-brand">Buyback</p>
        <h1 className="mt-2 text-3xl font-semibold text-ink">Trade-in offers</h1>
        <p className="mt-2 text-ink-soft">
          Devices submitted for trade-in, awaiting evaluation or an accepted offer.
        </p>
      </div>
      <Card className="p-8 text-center text-ink-soft">
        No buyback submissions yet.
      </Card>
    </Section>
  );
}
