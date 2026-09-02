import type { Metadata } from "next";
import Link from "next/link";
import { Section } from "@/components/marketing/Section";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { verificationJobs } from "@/data/verification";
import type { VerificationStatus } from "@/server/types";

export const metadata: Metadata = {
  title: "Verification Jobs",
  description: "Track verification requests across the PhoneBay partner network.",
};

export default function ShopVerificationPage() {
  return (
    <Section className="pt-10 sm:pt-14">
      <div className="mb-8">
        <p className="text-sm font-medium uppercase tracking-[0.12em] text-brand">Verification jobs</p>
        <h1 className="mt-2 text-3xl font-semibold text-ink">Incoming requests</h1>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-bg text-ink-faint">
              <tr>
                <th className="px-4 py-3 font-medium">Job ID</th>
                <th className="px-4 py-3 font-medium">Device</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Requested</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {verificationJobs.map((job) => (
                <tr key={job.id} className="border-t border-border">
                  <td className="px-4 py-3 font-medium text-ink">{job.id}</td>
                  <td className="px-4 py-3 text-ink-soft">{job.device}</td>
                  <td className="px-4 py-3 text-ink-soft">{job.customer}</td>
                  <td className="px-4 py-3 text-ink-soft">{job.requestedOn}</td>
                  <td className="px-4 py-3"><StatusBadge status={job.status as VerificationStatus} /></td>
                  <td className="px-4 py-3">
                    <Link href="/shop/testing" className="font-medium text-brand">Review</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </Section>
  );
}
