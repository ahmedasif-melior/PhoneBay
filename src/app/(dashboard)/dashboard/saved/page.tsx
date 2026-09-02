import type { Metadata } from "next";
import { PhoneCard } from "@/components/marketplace/PhoneCard";
import { db } from "@/server/db";
import { getCurrentUser } from "@/server/http";
import { listingsRepo } from "@/server/repositories/listings";
import type { ListingRecord } from "@/server/types";

export const metadata: Metadata = { title: "Saved Phones" };

export default async function SavedPhonesPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const savedRows = db
    .prepare(
      `SELECT l.id
       FROM saved_listings s
       JOIN listings l ON l.id = s.listing_id
       WHERE s.user_id = ?
       ORDER BY s.created_at DESC`
    )
    .all(user.id) as Array<{ id: string }>;

  const saved = savedRows
    .map((row) => listingsRepo.findById(row.id))
    .filter((listing): listing is ListingRecord => Boolean(listing));

  return (
    <div>
      <h1 className="text-2xl font-semibold text-ink">Saved Phones</h1>
      <p className="text-ink-soft mt-1">
        {saved.length === 0 ? "No saved devices yet." : `${saved.length} device${saved.length === 1 ? "" : "s"} saved for later.`}
      </p>

      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5 mt-7">
        {saved.length === 0 ? (
          <div className="col-span-full rounded-[var(--pb-radius-md)] border border-dashed border-border bg-bg p-8 text-sm text-ink-faint">
            Save a listing from the marketplace to see it here.
          </div>
        ) : (
          saved.map((phone) => <PhoneCard key={phone.id} phone={phone} />)
        )}
      </div>
    </div>
  );
}
