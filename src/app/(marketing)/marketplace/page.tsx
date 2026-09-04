import type { Metadata } from "next";

import { Section } from "@/components/marketing/Section";
import { MarketplaceBrowser } from "@/components/marketplace/MarketplaceBrowser";
import { listingsRepo } from "@/server/repositories/listings";
import type { ListingRecord } from "@/server/types";

export const metadata: Metadata = {
  title: "Marketplace",
  description:
    "Browse verified phones from trusted sellers and shops on PhoneBay.",
};

export const dynamic = "force-dynamic";

export default async function MarketplacePage() {
  const response = await listingsRepo.list({
    status: "active",
    sort: "recommended",
  });

  /*
   * Support the most common repository return shapes:
   *
   * 1. ListingRecord[]
   * 2. { listings: ListingRecord[] }
   * 3. { data: ListingRecord[] }
   */
  let listings: ListingRecord[] = [];

  if (Array.isArray(response)) {
    listings = response;
  } else if (
    response &&
    typeof response === "object" &&
    "listings" in response &&
    Array.isArray(response.listings)
  ) {
    listings = response.listings;
  } else if (
    response &&
    typeof response === "object" &&
    "data" in response &&
    Array.isArray(response.data)
  ) {
    listings = response.data;
  }

  return (
    <Section className="pt-10 sm:pt-14">
      <h1 className="text-3xl sm:text-4xl font-semibold text-ink">
        Find your next phone.
      </h1>

      <p className="mt-2 text-ink-soft">
        Browse tested, verified listings from trusted
        individuals and shops.
      </p>

      <div className="mt-8">
        <MarketplaceBrowser
          initialListings={listings}
        />
      </div>
    </Section>
  );
}