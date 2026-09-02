import type { Metadata } from "next";
import { Section } from "@/components/marketing/Section";
import { MarketplaceBrowser } from "@/components/marketplace/MarketplaceBrowser";
import { listingsRepo } from "@/server/repositories/listings";

export const metadata: Metadata = {
  title: "Marketplace",
  description: "Browse verified phones from trusted sellers and shops on PhoneBay.",
};

export const dynamic = "force-dynamic";

export default function MarketplacePage() {
  const listings = listingsRepo.list({ status: "active", sort: "recommended" });
  return (
    <Section className="pt-10 sm:pt-14">
      <h1 className="text-3xl sm:text-4xl font-semibold text-ink">Find your next phone.</h1>
      <p className="mt-2 text-ink-soft">
        Browse tested, verified listings from trusted individuals and shops.
      </p>
      <div className="mt-8">
        <MarketplaceBrowser initialListings={listings} />
      </div>
    </Section>
  );
}
