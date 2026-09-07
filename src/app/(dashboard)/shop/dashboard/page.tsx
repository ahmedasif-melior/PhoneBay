import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ClipboardCheck, PackageCheck, TrendingUp, Users } from "lucide-react";
import type { VerificationStatus } from "@/server/types";
import { Section } from "@/components/marketing/Section";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/Badge";
import { verificationJobs } from "@/data/verification";
import { formatPKR } from "@/lib/utils";
import { getCurrentUser } from "@/server/http";
import { getDb } from "@/server/db";
import { verificationRepo } from "@/server/repositories/verification";

export const metadata: Metadata = {
  title: "Shop Dashboard",
  description: "Track verification jobs, customer flow, and store performance.",
};

export default async function ShopDashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <Section className="pt-10 sm:pt-14">
        <Card className="p-8 text-center">
          <h1 className="text-2xl font-semibold text-ink">Shop dashboard</h1>
          <p className="mt-2 text-ink-soft">Sign in with a shop account to manage verification work and your active inventory.</p>
          <Button href="/shop/sign-in" className="mt-5">Sign In</Button>
        </Card>
      </Section>
    );
  }

  if (user.role !== "SHOP") {
    return (
      <Section className="pt-10 sm:pt-14">
        <Card className="p-8 text-center">
          <h1 className="text-2xl font-semibold text-ink">Access required</h1>
          <p className="mt-2 text-ink-soft">This dashboard is for verified shop accounts.</p>
          <Button href="/dashboard" className="mt-5">Back to dashboard</Button>
        </Card>
      </Section>
    );
  }

  const pendingVerificationJobs = await verificationRepo.listPending();
  const pendingTests = pendingVerificationJobs.length;
  const jobs = pendingVerificationJobs.slice(0, 4);
  const db = getDb();
  const [revenueResult, jobsResult] = await Promise.all([
    db.from("orders").select("price, listings!inner(seller_id)").eq("listings.seller_id", user.id),
    db.from("verification_requests").select("id, listings!inner(seller_id)", { count: "exact", head: true }).eq("listings.seller_id", user.id),
  ]);
  const revenue = (revenueResult.data ?? []).reduce((sum, row) => sum + Number(row.price ?? 0), 0);
  const totalJobs = jobsResult.count ?? 0;

  const summary = [
    { label: "Today's Jobs", value: Math.max(1, Math.min(9, totalJobs)), icon: ClipboardCheck },
    { label: "Pending Tests", value: pendingTests, icon: PackageCheck },
    { label: "Completed Tests", value: Math.max(1, totalJobs - pendingTests), icon: Users },
    { label: "Revenue", value: formatPKR(revenue), icon: TrendingUp },
  ];

  return (
    <Section className="pt-10 sm:pt-14">
      <div className="mb-8 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.12em] text-brand">Verified shop dashboard</p>
          <h1 className="mt-2 text-3xl font-semibold text-ink">{user.fullName}</h1>
        </div>
        <Button href="/shop/testing">Open testing desk</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summary.map(({ label, value, icon: Icon }) => (
          <Card key={label} className="p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm text-ink-faint">{label}</p>
                <p className="mt-2 font-data text-3xl font-semibold text-ink">{String(value)}</p>
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
            <h2 className="text-xl font-semibold text-ink">Verification jobs</h2>
            <Link href="/shop/jobs" className="text-sm font-medium text-brand">View all</Link>
          </div>

          <div className="mt-5 space-y-4">
            {jobs.length === 0 ? (
              <p className="text-sm text-ink-faint">No verification jobs right now.</p>
            ) : jobs.map((job) => (
              <div key={job.id} className="flex flex-col gap-3 rounded-[var(--pb-radius-md)] border border-border bg-bg p-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium text-ink">{job.listingId}</p>
                  <p className="text-sm text-ink-faint">Requested {new Date(job.requestedAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={job.status as VerificationStatus} />
                  <Link href="/shop/testing" className="inline-flex items-center gap-1 text-sm font-medium text-brand">
                    Open <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5 sm:p-6">
          <h2 className="text-xl font-semibold text-ink">Quick actions</h2>
          <div className="mt-5 space-y-3">
            <Button href="/shop/testing" fullWidth>Start new device test</Button>
            <Button href="/shop/jobs" variant="outline" fullWidth>Review jobs</Button>
            <Button href="/shop/certificates" variant="outline" fullWidth>Certificates</Button>
          </div>
        </Card>
      </div>
    </Section>
  );
}
