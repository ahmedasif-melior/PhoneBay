import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { MapPin, ShieldCheck, Star, TrendingUp, CheckCircle2 } from "lucide-react";
import { Section } from "@/components/marketing/Section";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { SellerBadge, VerificationBadge } from "@/components/ui/Badge";
import { Rating } from "@/components/ui/Rating";
import { phones } from "@/data/phones";
import { reviews } from "@/data/reviews";
import { sellers } from "@/data/sellers";
import { formatPKR } from "@/lib/utils";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const seller = sellers.find((entry) => entry.id === id);
  if (!seller) return {};
  return {
    title: `${seller.name} — PhoneBay Seller`,
    description: `View ${seller.name}'s verified listings, trust indicators, and recent reviews on PhoneBay.`,
  };
}

export default async function SellerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const seller = sellers.find((entry) => entry.id === id);
  if (!seller) notFound();

  const sellerPhones = phones.filter((phone) => phone.sellerId === id && phone.status === "active");
  const sellerReviews = reviews.slice(0, 3);

  return (
    <Section className="pt-10 sm:pt-14">
      <div className="mb-8 rounded-[var(--pb-radius-lg)] border border-border bg-surface p-5 sm:p-7">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <Avatar name={seller.name} size="xl" />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-3xl font-semibold text-ink">{seller.name}</h1>
                <SellerBadge />
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-ink-soft">
                <span className="flex items-center gap-1.5"><Star className="h-4 w-4 text-warn" /> {seller.rating} rating</span>
                <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {seller.location}</span>
                <span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-brand" /> Identity verified</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button href="/dashboard/messages">Message Seller</Button>
            <Button variant="outline">Follow</Button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <Card className="p-5 sm:p-6">
            <p className="text-sm font-medium text-ink-faint">About</p>
            <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">{seller.bio}</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-[var(--pb-radius-md)] border border-border bg-bg p-4">
                <p className="text-sm text-ink-faint">Completed transactions</p>
                <p className="mt-2 font-data text-2xl font-semibold text-ink">{seller.completedTransactions}</p>
              </div>
              <div className="rounded-[var(--pb-radius-md)] border border-border bg-bg p-4">
                <p className="text-sm text-ink-faint">Member since</p>
                <p className="mt-2 font-data text-2xl font-semibold text-ink">{seller.memberSince}</p>
              </div>
              <div className="rounded-[var(--pb-radius-md)] border border-border bg-bg p-4">
                <p className="text-sm text-ink-faint">Response time</p>
                <p className="mt-2 text-base font-semibold text-ink">{seller.responseTime}</p>
              </div>
            </div>
          </Card>

          <Card className="p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3 pb-4 border-b border-border">
              <h2 className="text-xl font-semibold text-ink">Listings</h2>
              <Link href="/marketplace" className="text-sm font-medium text-brand">View all</Link>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {sellerPhones.map((phone) => (
                <Link key={phone.id} href={`/marketplace/${phone.id}`} className="group block rounded-[var(--pb-radius-md)] border border-border bg-bg p-3 transition hover:border-border-strong hover:-translate-y-0.5">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--pb-radius-sm)] bg-surface">
                    <Image src={phone.image} alt={`${phone.brand} ${phone.model}`} width={300} height={220} className="h-full w-full object-contain" />
                  </div>
                  <div className="mt-3 flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-ink">{phone.model}</p>
                      <p className="text-xs text-ink-faint">{phone.storage} · {phone.condition}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-ink">{formatPKR(phone.price)}</p>
                      {phone.verified && <VerificationBadge size="sm" /> }
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-5">
            <p className="text-sm font-medium text-ink-faint">Trust indicators</p>
            <div className="mt-4 space-y-3">
              {[
                { label: "Identity Verified", valid: seller.verified.identity },
                { label: "Phone Verified", valid: seller.verified.phone },
                { label: "Verified Transactions", valid: seller.completedTransactions >= 20 },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between rounded-[var(--pb-radius-sm)] border border-border bg-bg px-3 py-2.5">
                  <span className="text-sm text-ink-soft">{item.label}</span>
                  {item.valid ? (
                    <CheckCircle2 className="h-4 w-4 text-verify" />
                  ) : (
                    <span className="text-xs text-ink-faint">Pending</span>
                  )}
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-ink">Recent reviews</h3>
              <Rating value={seller.rating} count={seller.reviewCount} />
            </div>
            <div className="mt-4 space-y-4">
              {sellerReviews.map((review) => (
                <div key={review.id} className="rounded-[var(--pb-radius-md)] border border-border bg-bg p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-ink">{review.author}</p>
                    <span className="text-xs text-ink-faint">{review.date}</span>
                  </div>
                  <div className="mt-2"><Rating value={review.rating} /></div>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">{review.comment}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center gap-2.5 text-ink">
              <TrendingUp className="h-5 w-5 text-brand" />
              <h3 className="font-semibold">Seller performance</h3>
            </div>
            <div className="mt-4 space-y-3">
              <div>
                <div className="flex items-center justify-between text-sm text-ink-soft">
                  <span>Response speed</span>
                  <span>92%</span>
                </div>
                <div className="mt-1 h-2 rounded-full bg-bg">
                  <div className="h-2 w-[92%] rounded-full bg-brand" />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-sm text-ink-soft">
                  <span>Trust score</span>
                  <span>8.9/10</span>
                </div>
                <div className="mt-1 h-2 rounded-full bg-bg">
                  <div className="h-2 w-[89%] rounded-full bg-verify" />
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </Section>
  );
}
