import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, MessageSquare, PackageCheck, ShieldCheck, TrendingUp } from "lucide-react";
import { Section } from "@/components/marketing/Section";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/Badge";
import { formatPKR } from "@/lib/utils";
import { getCurrentUser } from "@/server/http";
import { db } from "@/server/db";
import { listingsRepo } from "@/server/repositories/listings";

export const metadata: Metadata = {
  title: "Seller Dashboard",
  description: "Manage your listings, responses, and trust performance on PhoneBay.",
};

function imageForListing(brand: string, model: string): string {
  const key = `${brand} ${model}`.toLowerCase();
  if (key.includes("iphone 15 pro")) return "/images/phones/iphone-15-pro.svg";
  if (key.includes("iphone 14")) return "/images/phones/iphone-14.svg";
  if (key.includes("s24")) return "/images/phones/galaxy-s24.svg";
  if (key.includes("s23")) return "/images/phones/galaxy-s23.svg";
  if (key.includes("pixel")) return "/images/phones/pixel-9.svg";
  if (key.includes("oneplus 13")) return "/images/phones/oneplus-13.svg";
  return "/images/phones/iphone-15.webp";
}

export default async function SellerDashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    return (
      <Section className="pt-10 sm:pt-14">
        <Card className="p-8 text-center">
          <h1 className="text-2xl font-semibold text-ink">Seller dashboard</h1>
          <p className="mt-2 text-ink-soft">Sign in to view your live seller account and marketplace performance.</p>
          <Button href="/user/sign-in" className="mt-5">Sign In</Button>
        </Card>
      </Section>
    );
  }

  const allListings = listingsRepo.list({ sellerId: user.id, sort: "newest" });
  const listings = allListings.slice(0, 3);
  const activeListings = allListings.filter((listing) => listing.status === "active");
  const soldCount = (db.prepare("SELECT COUNT(*) as count FROM orders o JOIN listings l ON l.id = o.listing_id WHERE l.seller_id = ?").get(user.id) as { count: number }).count;
  const messageCount = (db.prepare(`SELECT COUNT(*) as count FROM messages m JOIN conversations c ON c.id = m.conversation_id WHERE c.seller_id = ?`).get(user.id) as { count: number }).count;
  const verifiedSales = (db.prepare(`SELECT COUNT(*) as count FROM orders o JOIN listings l ON l.id = o.listing_id WHERE l.seller_id = ? AND l.verified = 1`).get(user.id) as { count: number }).count;
  const totalViews = allListings.reduce((sum, listing) => sum + listing.views, 0);
  const totalOffers = soldCount;

  const stats = [
    { label: "Active Listings", value: String(activeListings.length), icon: PackageCheck },
    { label: "Messages", value: String(messageCount), icon: MessageSquare },
    { label: "Verified Sales", value: String(verifiedSales), icon: ShieldCheck },
    { label: "Sold", value: String(soldCount), icon: TrendingUp },
  ];

  return (
    <Section className="pt-10 sm:pt-14">
      <div className="flex items-center justify-between gap-3 mb-8">
        <div>
          <p className="text-sm text-brand font-medium uppercase tracking-[0.12em]">Seller dashboard</p>
          <h1 className="mt-2 text-3xl font-semibold text-ink">Welcome back, {user.fullName.split(" ")[0]}</h1>
        </div>
        <Button href="/dashboard/listings/new">Add new listing</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <Card key={label} className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-ink-faint">{label}</p>
                <p className="mt-2 font-data text-3xl font-semibold text-ink">{value}</p>
              </div>
              <span className="flex h-11 w-11 items-center justify-center rounded-[var(--pb-radius-sm)] bg-brand-tint text-brand">
                <Icon className="h-5 w-5" />
              </span>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3 pb-4 border-b border-border">
            <h2 className="text-xl font-semibold text-ink">My listings</h2>
            <Link href="/dashboard/listings" className="text-sm font-medium text-brand">Open dashboard</Link>
          </div>

          <div className="mt-5 space-y-4">
            {listings.length === 0 ? (
              <p className="text-sm text-ink-faint">No listings yet. Publish your first device to start selling.</p>
            ) : listings.map((listing) => (
              <div key={listing.id} className="flex flex-col gap-3 rounded-[var(--pb-radius-md)] border border-border bg-bg p-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative h-16 w-16 overflow-hidden rounded-[var(--pb-radius-sm)] bg-surface">
                    <Image src={imageForListing(listing.brand, listing.model)} alt={listing.model} width={64} height={64} className="h-full w-full object-contain" />
                  </div>
                  <div>
                    <p className="font-medium text-ink">{listing.model}</p>
                    <p className="text-sm text-ink-faint">{listing.storage} · {listing.city}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 sm:justify-end">
                  <div className="text-left sm:text-right">
                    <p className="font-medium text-ink">{formatPKR(listing.price)}</p>
                    <p className="text-xs text-ink-faint">{listing.views} views</p>
                  </div>
                  <StatusBadge status={listing.status} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5 sm:p-6">
          <h2 className="text-xl font-semibold text-ink">Performance snapshot</h2>
          <div className="mt-5 space-y-4">
            {[
              { label: "Total views", value: String(totalViews) },
              { label: "Messages received", value: String(messageCount) },
              { label: "Total offers", value: String(totalOffers) },
            ].map((item) => (
              <div key={item.label} className="rounded-[var(--pb-radius-md)] border border-border bg-bg p-3">
                <div className="flex items-center justify-between text-sm text-ink-soft">
                  <span>{item.label}</span>
                  <ArrowUpRight className="h-4 w-4 text-verify" />
                </div>
                <p className="mt-2 font-data text-2xl font-semibold text-ink">{item.value}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </Section>
  );
}
