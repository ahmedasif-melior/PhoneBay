"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Heart } from "lucide-react";
import { VerificationBadge } from "@/components/ui/Badge";
import { SignalScore } from "@/components/ui/Rating";
import { formatPKR, cn } from "@/lib/utils";
import type { ListingRecord } from "@/server/types";
import type { Phone } from "@/data/phones";

export function PhoneCard({ phone }: { phone: ListingRecord | Phone }) {
  const isListing = "imageUrls" in phone;
  const [saved, setSaved] = React.useState(isListing ? false : phone.saved);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (!isListing) return;
    void fetch(`/api/listings/${phone.id}/save`)
      .then((response) => response.ok ? response.json() : null)
      .then((result) => { if (result) setSaved(Boolean(result.saved)); });
  }, [isListing, phone.id]);
  const image = isListing ? phone.imageUrls[0] || "/images/phones/iphone-15.webp" : phone.image;
  const city = isListing ? phone.city : phone.location;

  const handleSaveToggle = async (event: React.MouseEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      const response = await fetch(`/api/listings/${phone.id}/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) return;
      const result = await response.json();
      setSaved(Boolean(result.saved));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="group relative bg-surface border border-border rounded-[var(--pb-radius-md)] overflow-hidden transition-all duration-200 hover:border-border-strong hover:shadow-[var(--pb-shadow-md)] hover:-translate-y-0.5">
      <Link href={`/marketplace/${phone.id}`} className="block">
        <div className="relative aspect-[4/3] bg-bg flex items-center justify-center">
          <Image
            src={image}
            alt={`${phone.brand} ${phone.model}`}
            width={220}
            height={220}
            className="object-contain h-4/5 w-4/5"
          />
        </div>
      </Link>

      <button
        onClick={handleSaveToggle}
        disabled={saving}
        aria-pressed={saved}
        aria-label={saved ? "Remove from saved" : "Save phone"}
        className="absolute top-3 right-3 h-9 w-9 rounded-full bg-surface/90 backdrop-blur border border-border flex items-center justify-center disabled:opacity-60"
      >
        <Heart
          className={cn("h-4 w-4", saved ? "fill-danger text-danger" : "text-ink-soft")}
        />
      </button>

      {phone.verified && (
        <div className="absolute top-3 left-3">
          <VerificationBadge />
        </div>
      )}

      <Link href={`/marketplace/${phone.id}`} className="block p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-ink text-[15px] leading-tight">
            {phone.model}
          </h3>
          {phone.verified && (isListing ? phone.score !== null : true) && <SignalScore score={phone.score ?? 0} size="sm" showLabel={false} />}
        </div>
        <p className="text-xs text-ink-faint mt-1">
          {phone.storage} · {phone.condition}
        </p>
        <p className="font-data text-lg font-semibold text-ink mt-2">
          {formatPKR(phone.price)}
        </p>
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
          <span className="flex items-center gap-1 text-xs text-ink-faint">
            <MapPin className="h-3 w-3" /> {city}
          </span>
        </div>
      </Link>
    </div>
  );
}
