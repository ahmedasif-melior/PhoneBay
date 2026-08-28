import type { Metadata } from "next";
import { PhoneCard } from "@/components/marketplace/PhoneCard";
import { phones } from "@/data/phones";

export const metadata: Metadata = { title: "Saved Phones" };

export default function SavedPhonesPage() {
  const saved = phones.filter((p) => p.saved).concat(phones.slice(0, 3));
  const unique = Array.from(new Map(saved.map((p) => [p.id, p])).values());

  return (
    <div>
      <h1 className="text-2xl font-semibold text-ink">Saved Phones</h1>
      <p className="text-ink-soft mt-1">Devices you've bookmarked to revisit later.</p>

      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5 mt-7">
        {unique.map((phone) => (
          <PhoneCard key={phone.id} phone={{ ...phone, saved: true }} />
        ))}
      </div>
    </div>
  );
}
