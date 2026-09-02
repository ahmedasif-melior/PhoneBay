import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Eye } from "lucide-react";
import { EditListingForm } from "@/components/dashboard/EditListingForm";
import { getCurrentUser, isAdminRole } from "@/server/http";
import { listingsRepo } from "@/server/repositories/listings";

export const metadata: Metadata = { title: "Edit Listing" };

export default async function EditListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  const listing = listingsRepo.findById(id);
  if (!user || !listing || (listing.sellerId !== user.id && !isAdminRole(user.role))) notFound();

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Edit listing</h1>
          <p className="text-ink-soft mt-1">{listing.model} · {listing.storage}</p>
        </div>
        <Link href={`/marketplace/${listing.id}`} className="text-sm font-medium text-brand flex items-center gap-1.5">
          <Eye className="h-4 w-4" /> Preview
        </Link>
      </div>
      <div className="mt-7">
        <EditListingForm listing={listing} />
      </div>
    </div>
  );
}
