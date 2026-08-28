import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { List, Bookmark, Package, Gauge, ArrowRight, ShieldCheck } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { formatPKR } from "@/lib/utils";
import { phones } from "@/data/phones";

export const metadata: Metadata = { title: "Dashboard" };

export default function DashboardOverviewPage() {
  const recentListing = phones[0];

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-semibold text-ink">Welcome back, Ahmed</h1>
      <p className="text-ink-soft mt-1">Here's what's happening with your account.</p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-7">
        <StatCard label="Active Listings" value="3" icon={List} />
        <StatCard label="Saved Phones" value="12" icon={Bookmark} />
        <StatCard label="Orders" value="2" icon={Package} />
        <StatCard label="Trust Score" value="8.7" icon={Gauge} tone="verify" trend="+0.3 this month" />
      </div>

      <div className="grid lg:grid-cols-2 gap-5 mt-8">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-ink">Recent listing</h2>
            <Link href="/dashboard/listings" className="text-sm text-brand font-medium flex items-center gap-1">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 bg-bg rounded-[var(--pb-radius-sm)] border border-border flex items-center justify-center shrink-0">
              <Image src={recentListing.image} alt="" width={56} height={56} className="object-contain h-4/5 w-4/5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-ink">{recentListing.model}</p>
              <p className="font-data text-sm text-ink-soft">{formatPKR(recentListing.price)}</p>
            </div>
            <StatusBadge status="active" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-ink">Recent verification</h2>
            <Link href="/dashboard/verification" className="text-sm text-brand font-medium flex items-center gap-1">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <span className="h-16 w-16 rounded-[var(--pb-radius-sm)] bg-verify-tint text-verify flex items-center justify-center shrink-0">
              <ShieldCheck className="h-7 w-7" />
            </span>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-ink">{recentListing.model}</p>
              <p className="text-sm text-ink-soft">Certificate {recentListing.certificateId}</p>
            </div>
            <span className="text-xs font-medium text-verify-dark bg-verify-tint rounded-full px-2.5 py-1">
              Active
            </span>
          </div>
        </Card>
      </div>
    </div>
  );
}
