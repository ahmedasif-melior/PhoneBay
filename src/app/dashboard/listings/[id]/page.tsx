import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Eye } from "lucide-react";
import { EditListingForm } from "@/components/dashboard/EditListingForm";
import { phones, getPhoneById } from "@/data/phones";

export function generateStaticParams() {
  return phones.map((p) => ({ id: p.id }));
}

export const metadata: Metadata = { title: "Edit Listing" };

export default async function EditListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const phone = getPhoneById(id);
  if (!phone) notFound();

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Edit listing</h1>
          <p className="text-ink-soft mt-1">{phone.model} · {phone.storage}</p>
        </div>
        <Link href={`/marketplace/${phone.id}`} className="text-sm font-medium text-brand flex items-center gap-1.5">
          <Eye className="h-4 w-4" /> Preview
        </Link>
      </div>
      <div className="mt-7">
        <EditListingForm phone={phone} />
      </div>
    </div>
  );
}
