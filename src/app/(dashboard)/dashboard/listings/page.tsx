import type { Metadata } from "next";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { MyListingsBrowser } from "@/components/dashboard/MyListingsBrowser";
import { getCurrentUser } from "@/server/http";
import { listingsRepo } from "@/server/repositories/listings";

export const metadata: Metadata = { title: "My Listings" };

export default async function MyListingsPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  const listings = listingsRepo.list({ sellerId: user.id, status: undefined, sort: "newest" });

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink">My Listings</h1>
          <p className="text-ink-soft mt-1">Manage and track your active and past listings.</p>
        </div>
        <Button href="/dashboard/listings/new" className="hidden sm:inline-flex">
          <Plus className="h-4 w-4" /> New Listing
        </Button>
      </div>
      <div className="mt-7">
        <MyListingsBrowser initialListings={listings} />
      </div>
    </div>
  );
}
