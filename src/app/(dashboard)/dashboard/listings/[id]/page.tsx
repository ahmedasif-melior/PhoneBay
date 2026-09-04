import type { Metadata } from "next";

import { MyListingsBrowser } from "@/components/dashboard/MyListingsBrowser";
import { getCurrentUser } from "@/server/http";
import { listingsRepo } from "@/server/repositories/listings";

export const metadata: Metadata = {
  title: "My Listings",
};

export default async function MyListingsPage() {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  const listings = await listingsRepo.list({
    sellerId: user.id,
    status: undefined,
    sort: "newest",
  });

  return (
    <div className="max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-ink">
          My Listings
        </h1>

        <p className="mt-1 text-ink-soft">
          Manage your phone listings and track their status.
        </p>
      </div>

      <MyListingsBrowser
        initialListings={
          Array.isArray(listings)
            ? listings
            : []
        }
      />
    </div>
  );
}