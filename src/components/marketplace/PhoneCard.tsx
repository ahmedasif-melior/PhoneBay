"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Heart } from "lucide-react";
import { Rating } from "@/components/ui/Rating";
import { VerificationBadge } from "@/components/ui/Badge";
import { SignalScore } from "@/components/ui/Rating";
import { formatPKR, cn } from "@/lib/utils";
import type { Phone } from "@/data/phones";
import { getSellerById } from "@/data/sellers";

export function PhoneCard({ phone }: { phone: Phone }) {
  const [saved, setSaved] = React.useState(phone.saved);
  const seller = getSellerById(phone.sellerId);

  return (
    <div className="group relative bg-surface border border-border rounded-[var(--pb-radius-md)] overflow-hidden transition-all duration-200 hover:border-border-strong hover:shadow-[var(--pb-shadow-md)] hover:-translate-y-0.5">
      <Link href={`/marketplace/${phone.id}`} className="block">
        <div className="relative aspect-[4/3] bg-bg flex items-center justify-center">
          <Image
            src={phone.image}
            alt={`${phone.brand} ${phone.model}`}
            width={220}
            height={220}
            className="object-contain h-4/5 w-4/5"
          />
        </div>
      </Link>

      <button
        onClick={(e) => {
          e.preventDefault();
          setSaved((s) => !s);
        }}
        aria-pressed={saved}
        aria-label={saved ? "Remove from saved" : "Save phone"}
        className="absolute top-3 right-3 h-9 w-9 rounded-full bg-surface/90 backdrop-blur border border-border flex items-center justify-center"
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
          {phone.verified && <SignalScore score={phone.score} size="sm" showLabel={false} />}
        </div>
        <p className="text-xs text-ink-faint mt-1">
          {phone.storage} · {phone.condition}
        </p>
        <p className="font-data text-lg font-semibold text-ink mt-2">
          {formatPKR(phone.price)}
        </p>
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
          <span className="flex items-center gap-1 text-xs text-ink-faint">
            <MapPin className="h-3 w-3" /> {phone.location}
          </span>
          {seller && <Rating value={seller.rating} size="sm" />}
        </div>
      </Link>
    </div>
  );
}
