import type { Metadata } from "next";

import { PhoneCard } from "@/components/marketplace/PhoneCard";
import { getAdminDb } from "@/server/db";
import { getCurrentUser } from "@/server/http";
import { listingsRepo } from "@/server/repositories/listings";
import type { ListingRecord } from "@/server/types";

export const metadata: Metadata = {
  title: "Saved Phones",
};

export default async function SavedPhonesPage() {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  const db = getAdminDb();

  const { data: savedRows, error } = await db
    .from("saved_listings")
    .select("listing_id")
    .eq("user_id", user.id)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    console.error(
      "[SAVED] Failed to load saved listings:",
      error.message,
    );
  }

  const listingIds = (savedRows ?? [])
    .map((row) => row.listing_id)
    .filter(Boolean);

  const savedResults = await Promise.all(
    listingIds.map((listingId) =>
      listingsRepo.findById(listingId),
    ),
  );

  const saved = savedResults.filter(
    (listing): listing is ListingRecord =>
      Boolean(listing),
  );

  return (
    <div>
      <h1 className="text-2xl font-semibold text-ink">
        Saved Phones
      </h1>

      <p className="text-ink-soft mt-1">
        {saved.length === 0
          ? "No saved devices yet."
          : `${saved.length} device${
              saved.length === 1 ? "" : "s"
            } saved for later.`}
      </p>

      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5 mt-7">
        {saved.length === 0 ? (
          <div className="col-span-full rounded-[var(--pb-radius-md)] border border-dashed border-border bg-bg p-8 text-sm text-ink-faint">
            Save a listing from the marketplace to see it
            here.
          </div>
        ) : (
          saved.map((phone) => (
            <PhoneCard
              key={phone.id}
              phone={phone}
            />
          ))
        )}
      </div>
    </div>
  );
}