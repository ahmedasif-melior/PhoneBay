import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { List, Bookmark, Package, Gauge, ArrowRight, ShieldCheck } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { formatPKR } from "@/lib/utils";
import { getCurrentUser } from "@/server/http";
import { listingsRepo } from "@/server/repositories/listings";
import { db } from "@/server/db";

export const metadata: Metadata = { title: "Dashboard" };

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

export default async function DashboardOverviewPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  const listingCounts = listingsRepo.countBySeller(user.id);
  const recentListing = listingsRepo.list({ sellerId: user.id, status: undefined, sort: "newest" })[0] ?? null;
  const savedPhones = (db.prepare("SELECT COUNT(*) as count FROM saved_listings WHERE user_id = ?").get(user.id) as { count: number }).count;
  const orders = (db.prepare("SELECT COUNT(*) as count FROM orders WHERE buyer_id = ?").get(user.id) as { count: number }).count;
  const recentVerification = db.prepare(
    `SELECT l.model, c.id AS certificate_id, c.overall_score
     FROM certificates c JOIN listings l ON l.id = c.listing_id
     WHERE l.seller_id = ? ORDER BY c.issued_at DESC LIMIT 1`
  ).get(user.id) as { model: string; certificate_id: string; overall_score: number } | undefined;

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-semibold text-ink">Welcome back, {user.fullName.split(" ")[0]}</h1>
      <p className="text-ink-soft mt-1">
        {user.accountPurpose ? `You’re set up as a ${user.accountPurpose} on PhoneBay.` : "Complete your profile to set your buyer or seller preference."}
      </p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-7">
        <StatCard label="Active Listings" value={String(listingCounts.active)} icon={List} />
        <StatCard label="Saved Phones" value={String(savedPhones)} icon={Bookmark} />
        <StatCard label="Orders" value={String(orders)} icon={Package} />
        <StatCard label="Trust Score" value={user.trustScore.toFixed(1)} icon={Gauge} tone="verify" />
      </div>

      <div className="grid lg:grid-cols-2 gap-5 mt-8">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-ink">Recent listing</h2>
            <Link href="/dashboard/listings" className="text-sm text-brand font-medium flex items-center gap-1">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {recentListing ? <div className="flex items-center gap-4">
            <div className="h-16 w-16 bg-bg rounded-[--pb-radius-sm] border border-border flex items-center justify-center shrink-0">
              <Image src={imageForListing(recentListing.brand, recentListing.model)} alt="" width={56} height={56} className="object-contain h-4/5 w-4/5" />
            </div>
            <div className="flex-1 min-w-0"><p className="font-medium text-ink">{recentListing.model}</p><p className="font-data text-sm text-ink-soft">{formatPKR(recentListing.price)}</p></div>
            <StatusBadge status={recentListing.status} />
          </div> : <p className="text-sm text-ink-faint">No listings yet.</p>}
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-ink">Recent verification</h2>
            <Link href="/dashboard/verification" className="text-sm text-brand font-medium flex items-center gap-1">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {recentVerification ? <div className="flex items-center gap-4">
            <span className="h-16 w-16 rounded-[--pb-radius-sm] bg-verify-tint text-verify flex items-center justify-center shrink-0">
              <ShieldCheck className="h-7 w-7" />
            </span>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-ink">{recentVerification.model}</p>
              <p className="text-sm text-ink-soft">Certificate {recentVerification.certificate_id}</p>
            </div>
            <span className="text-xs font-medium text-verify-dark bg-verify-tint rounded-full px-2.5 py-1">
              Active
            </span>
          </div> : <p className="text-sm text-ink-faint">No completed verifications yet.</p>}
        </Card>
      </div>
    </div>
  );
}
