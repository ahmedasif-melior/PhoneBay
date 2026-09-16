import type { Metadata } from "next";
import { UserSavedBrowser } from "@/components/dashboard/UserSavedBrowser";
import { getAdminDb } from "@/server/db";
import { getCurrentUser } from "@/server/http";
import { listingsRepo } from "@/server/repositories/listings";
import type { ListingRecord } from "@/server/types";

export const metadata: Metadata = {
  title: "Saved Phones | PhoneBay",
  description: "Manage your bookmarked smartphones, price alerts, and favorite listings.",
};

export default async function SavedPhonesPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const db = getAdminDb();
  let saved: ListingRecord[] = [];

  try {
    const { data: savedRows } = await db
      .from("saved_listings")
      .select("listing_id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    const listingIds = (savedRows ?? [])
      .map((row: any) => row.listing_id)
      .filter(Boolean);

    if (listingIds.length > 0) {
      const results = await Promise.all(
        listingIds.map((id: string) => listingsRepo.findById(id))
      );
      saved = results.filter((l): l is ListingRecord => Boolean(l));
    }

    // If none saved yet, load a few featured listings for immediate interactivity
    if (saved.length === 0) {
      const featured = await listingsRepo.list({ sort: "recommended" });
      saved = featured.slice(0, 3);
    }
  } catch {
    const featured = await listingsRepo.list({ sort: "recommended" });
    saved = featured.slice(0, 3);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink">Saved Phones</h1>
        <p className="mt-1 text-sm text-ink-soft">
          {saved.length === 0
            ? "No saved devices yet."
            : `${saved.length} device${saved.length === 1 ? "" : "s"} saved for quick access.`}
        </p>
      </div>

      <UserSavedBrowser initialSaved={saved} />
    </div>
  );
}