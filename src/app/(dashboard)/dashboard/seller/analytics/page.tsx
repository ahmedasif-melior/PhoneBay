import type { Metadata } from "next";
import { BarChart3, TrendingUp } from "lucide-react";
import { Section } from "@/components/marketing/Section";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "Seller Analytics",
  description: "Performance metrics and conversion insights for your PhoneBay seller account.",
};

const metrics = [
  { label: "Traffic", value: "18.4K", change: "+12%" },
  { label: "Saved listings", value: "2.1K", change: "+8%" },
  { label: "Messages", value: "142", change: "+24%" },
  { label: "Sales", value: "8", change: "+15%" },
];

const barData = [62, 78, 69, 88, 74, 93, 81];

export default function SellerAnalyticsPage() {
  return (
    <Section className="pt-10 sm:pt-14">
      <div className="mb-8">
        <p className="text-sm font-medium uppercase tracking-[0.12em] text-brand">Seller analytics</p>
        <h1 className="mt-2 text-3xl font-semibold text-ink">Performance overview</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((item) => (
          <Card key={item.label} className="p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-ink-faint">{item.label}</p>
              <TrendingUp className="h-4 w-4 text-verify" />
            </div>
            <p className="mt-3 font-data text-3xl font-semibold text-ink">{item.value}</p>
            <p className="mt-2 text-sm text-verify-dark">{item.change} vs last month</p>
          </Card>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="p-5 sm:p-6">
          <div className="flex items-center gap-2 text-ink">
            <BarChart3 className="h-5 w-5 text-brand" />
            <h2 className="text-xl font-semibold">Views by week</h2>
          </div>

          <div className="mt-6 flex h-52 items-end gap-3">
            {barData.map((value, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full rounded-t-[var(--pb-radius-sm)] bg-brand/80" style={{ height: `${value}%` }} />
                <span className="text-[11px] text-ink-faint">W{idx + 1}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5 sm:p-6">
          <h2 className="text-xl font-semibold text-ink">Best performing listings</h2>
          <div className="mt-5 space-y-4">
            {[
              { model: "iPhone 15 Pro", views: "4.8K" },
              { model: "Galaxy S24", views: "3.9K" },
              { model: "Pixel 9", views: "3.2K" },
            ].map((item) => (
              <div key={item.model} className="flex items-center justify-between rounded-[var(--pb-radius-md)] border border-border bg-bg px-3 py-2.5">
                <span className="text-sm text-ink-soft">{item.model}</span>
                <span className="font-data text-sm font-semibold text-ink">{item.views}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </Section>
  );
}
