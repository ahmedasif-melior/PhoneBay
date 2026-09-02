import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MapPin, ShieldCheck, Star } from "lucide-react";
import { Section } from "@/components/marketing/Section";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { SellerBadge } from "@/components/ui/Badge";
import { Rating } from "@/components/ui/Rating";
import { shops } from "@/data/sellers";
import { reviews } from "@/data/reviews";
import { formatPKR } from "@/lib/utils";
import { phones } from "@/data/phones";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const shop = shops.find((entry) => entry.id === id);
  if (!shop) return {};
  return {
    title: `${shop.name} — Verified Phone Shop`,
    description: `Explore ${shop.name}'s verified inventory, services, and customer reviews on PhoneBay.`,
  };
}

export default async function ShopProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const shop = shops.find((entry) => entry.id === id);
  if (!shop) notFound();

  const shopInventory = phones.filter((phone) => phone.sellerId === id && phone.status === "active");
  const recentReviews = reviews.slice(0, 3);

  return (
    <Section className="pt-10 sm:pt-14">
      <div className="rounded-[var(--pb-radius-lg)] border border-border bg-surface p-5 sm:p-7">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <Avatar name={shop.name} size="xl" />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-3xl font-semibold text-ink">{shop.name}</h1>
                <SellerBadge label="Verified Shop" />
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-ink-soft">
                <span className="flex items-center gap-1.5"><Star className="h-4 w-4 text-warn" /> {shop.rating} rating</span>
                <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {shop.location}</span>
                <span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-brand" /> Trusted partner</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button href="/dashboard/messages">Book a consultation</Button>
            <Button variant="outline">Request quote</Button>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <Card className="p-5 sm:p-6">
            <p className="text-sm font-medium text-ink-faint">About</p>
            <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">{shop.bio}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {shop.services.map((service) => (
                <span key={service} className="rounded-full bg-brand-tint px-3 py-1 text-xs font-medium text-brand-dark">{service}</span>
              ))}
            </div>
          </Card>

          <Card className="p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3 pb-4 border-b border-border">
              <h2 className="text-xl font-semibold text-ink">Inventory</h2>
              <Link href="/marketplace" className="text-sm font-medium text-brand">Browse all</Link>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {shopInventory.map((phone) => (
                <Link key={phone.id} href={`/marketplace/${phone.id}`} className="block rounded-[var(--pb-radius-md)] border border-border bg-bg p-3 transition hover:-translate-y-0.5 hover:border-border-strong">
                  <div className="rounded-[var(--pb-radius-sm)] bg-surface p-3">
                    <Image src={phone.image} alt={phone.model} width={220} height={180} className="mx-auto h-32 w-full object-contain" />
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-ink">{phone.model}</p>
                      <p className="text-xs text-ink-faint">{phone.storage} · {phone.condition}</p>
                    </div>
                    <p className="font-medium text-ink">{formatPKR(phone.price)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-5">
            <p className="text-sm font-medium text-ink-faint">Shop metrics</p>
            <div className="mt-4 space-y-3">
              <div className="rounded-[var(--pb-radius-md)] border border-border bg-bg p-3">
                <p className="text-sm text-ink-faint">Today's jobs</p>
                <p className="mt-2 font-data text-2xl font-semibold text-ink">{shop.todaysJobs}</p>
              </div>
              <div className="rounded-[var(--pb-radius-md)] border border-border bg-bg p-3">
                <p className="text-sm text-ink-faint">Pending tests</p>
                <p className="mt-2 font-data text-2xl font-semibold text-ink">{shop.pendingTests}</p>
              </div>
              <div className="rounded-[var(--pb-radius-md)] border border-border bg-bg p-3">
                <p className="text-sm text-ink-faint">Average score</p>
                <p className="mt-2 font-data text-2xl font-semibold text-ink">{shop.averageScore.toFixed(1)}</p>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-ink">Customer reviews</h3>
              <Rating value={shop.rating} count={shop.reviewCount} />
            </div>
            <div className="mt-4 space-y-4">
              {recentReviews.map((review) => (
                <div key={review.id} className="rounded-[var(--pb-radius-md)] border border-border bg-bg p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-ink">{review.author}</p>
                    <span className="text-xs text-ink-faint">{review.date}</span>
                  </div>
                  <Rating value={review.rating} className="mt-2" />
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">{review.comment}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </Section>
  );
}
