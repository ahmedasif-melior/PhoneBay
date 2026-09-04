import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  MapPin,
  ShieldCheck,
  BatteryFull,
  ArrowRight,
} from "lucide-react";

import { Section } from "@/components/marketing/Section";
import { PhoneGallery } from "@/components/marketplace/PhoneGallery";
import { BuyBox } from "@/components/marketplace/BuyBox";
import { VerificationBadge } from "@/components/ui/Badge";
import { SignalScore, Rating } from "@/components/ui/Rating";
import { Avatar } from "@/components/ui/Avatar";
import { TestingRow } from "@/components/verification/TestingRow";
import { Card } from "@/components/ui/Card";

import { formatDate } from "@/lib/utils";
import { listingsRepo } from "@/server/repositories/listings";
import type { ListingRecord } from "@/server/types";

import { getSellerById } from "@/data/sellers";
import { reviews } from "@/data/reviews";

function listingToPhone(listing: ListingRecord) {
  const fallback = "/images/phones/iphone-15.webp";

  const images =
    Array.isArray(listing.imageUrls) && listing.imageUrls.length > 0
      ? listing.imageUrls
      : [fallback];

  return {
    id: listing.id,
    brand: listing.brand,
    model: listing.model,
    storage: listing.storage,
    color: listing.color ?? "",
    condition: listing.condition as "Excellent" | "Good" | "Fair",
    price: listing.price,
    negotiable: listing.negotiable,
    location: listing.city,
    image: images[0],
    images,
    verified: listing.verified,
    score: listing.score ?? 0,
    batteryHealth: listing.batteryHealth ?? 0,
    sellerId: listing.sellerId,
    sellerType: "individual" as const,
    views: listing.views,
    messages: 0,
    saved: false,
    status: listing.status,
    postedDate: listing.createdAt,
    description: listing.description ?? "",
    specs: [
      {
        label: "Storage",
        value: listing.storage,
      },
      {
        label: "Color",
        value: listing.color ?? "Not specified",
      },
      {
        label: "Condition",
        value: listing.condition,
      },
      {
        label: "Location",
        value: listing.city,
      },
    ],
    testResults: [] as {
      label: string;
      status: "pass" | "fail";
    }[],
    certificateId: undefined,
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  const listing = await listingsRepo.findById(id);

  if (!listing) {
    return {};
  }

  const phone = listingToPhone(listing);

  return {
    title: `${phone.brand} ${phone.model} — ${phone.storage}`,
    description:
      phone.description ||
      `${phone.brand} ${phone.model} ${phone.storage} for sale on PhoneBay.`,
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const listing = await listingsRepo.findById(id);

  if (!listing || listing.status !== "active") {
    notFound();
  }

  const phone = listingToPhone(listing);

  const seller = getSellerById(phone.sellerId);

  return (
    <Section className="pt-8 sm:pt-12">
      <nav
        className="text-sm text-ink-faint mb-6"
        aria-label="Breadcrumb"
      >
        <Link
          href="/marketplace"
          className="hover:text-ink"
        >
          Marketplace
        </Link>

        <span className="mx-2">/</span>

        <span className="text-ink">
          {phone.model}
        </span>
      </nav>

      <div className="grid lg:grid-cols-[1fr_1fr_360px] gap-10">
        <PhoneGallery
          images={phone.images}
          alt={`${phone.brand} ${phone.model}`}
        />

        <div>
          <div className="flex items-center gap-2 flex-wrap mb-2">
            {phone.verified && <VerificationBadge />}

            {phone.verified && (
              <SignalScore
                score={phone.score}
                size="sm"
              />
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-semibold text-ink">
            {phone.model}
          </h1>

          <p className="text-ink-faint mt-1">
            {phone.storage} · {phone.color} · {phone.condition}
          </p>

          <div className="flex items-center gap-5 mt-4 text-sm text-ink-soft">
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4" />
              {phone.location}
            </span>

            <span className="flex items-center gap-1.5">
              <BatteryFull className="h-4 w-4 text-verify" />
              {phone.batteryHealth}% battery
            </span>
          </div>

          {phone.description && (
            <p className="mt-6 text-[15px] text-ink-soft leading-relaxed">
              {phone.description}
            </p>
          )}

          <div className="mt-8">
            <h2 className="font-semibold text-ink mb-3">
              Specifications
            </h2>

            <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              {phone.specs.map((s) => (
                <div
                  key={s.label}
                  className="flex justify-between border-b border-border pb-2"
                >
                  <dt className="text-ink-faint">
                    {s.label}
                  </dt>

                  <dd className="text-ink font-medium">
                    {s.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {phone.testResults.length > 0 && (
            <div className="mt-8">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-ink">
                  Testing results
                </h2>

                {phone.certificateId && (
                  <Link
                    href="/dashboard/certificates"
                    className="text-sm text-brand font-medium inline-flex items-center gap-1"
                  >
                    View certificate
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                )}
              </div>

              <div className="border border-border rounded-[var(--pb-radius-md)] divide-y divide-border">
                {phone.testResults.map((result) => (
                  <TestingRow
                    key={result.label}
                    result={result}
                  />
                ))}
              </div>
            </div>
          )}

          {seller && (
            <div className="mt-8">
              <h2 className="font-semibold text-ink mb-3">
                Seller information
              </h2>

              <Card className="flex items-center gap-4">
                <Avatar
                  name={seller.name}
                  size="lg"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-ink">
                      {seller.name}
                    </p>

                    {seller.verified.identity && (
                      <ShieldCheck className="h-4 w-4 text-brand" />
                    )}
                  </div>

                  <Rating
                    value={seller.rating}
                    count={seller.reviewCount}
                  />

                  <p className="text-xs text-ink-faint mt-1">
                    {seller.responseTime}
                  </p>
                </div>

                <Link
                  href={`/seller/${seller.id}`}
                  className="text-sm font-medium text-brand shrink-0"
                >
                  View profile
                </Link>
              </Card>
            </div>
          )}

          <div className="mt-8">
            <h2 className="font-semibold text-ink mb-3">
              Delivery information
            </h2>

            <Card className="text-sm text-ink-soft leading-relaxed">
              Delivered within 2–4 business days across Pakistan
              via PhoneBay Protected Delivery. Your payment is
              held until you confirm the device on arrival.
            </Card>
          </div>

          <div className="mt-8">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-ink">
                Reviews
              </h2>

              <Rating
                value={4.8}
                count={reviews.length}
              />
            </div>

            <div className="flex flex-col gap-4">
              {reviews.slice(0, 3).map((review) => (
                <Card key={review.id}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Avatar
                        name={review.author}
                        size="sm"
                      />

                      <p className="text-sm font-medium text-ink">
                        {review.author}
                      </p>
                    </div>

                    <span className="text-xs text-ink-faint">
                      {formatDate(review.date)}
                    </span>
                  </div>

                  <Rating
                    value={review.rating}
                    className="mt-2"
                  />

                  <p className="text-sm text-ink-soft mt-2 leading-relaxed">
                    {review.comment}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </div>

        <div>
          <BuyBox phone={phone} />
        </div>
      </div>
    </Section>
  );
}