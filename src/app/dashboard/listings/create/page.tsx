import type { Metadata } from "next";
import { CreateListingForm } from "@/components/dashboard/CreateListingForm";

export const metadata: Metadata = { title: "Create Listing" };

export default function CreateListingPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold text-ink">Create a listing</h1>
      <p className="text-ink-soft mt-1">List your device in a few simple steps.</p>
      <div className="mt-7">
        <CreateListingForm />
      </div>
    </div>
  );
}
