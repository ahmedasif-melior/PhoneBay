import type { Metadata } from "next";
import { Zap, ShieldCheck, Users, TrendingUp } from "lucide-react";
import { Section, SectionHeading } from "@/components/marketing/Section";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "For Sellers",
  description: "Sell your phone on PhoneBay — reach verified buyers and get paid securely.",
};

const benefits = [
  { icon: Zap, title: "List in minutes", description: "A guided six-step form gets your listing live fast, with no fees to publish." },
  { icon: ShieldCheck, title: "Stand out with a badge", description: "Verified listings get more views and sell faster than unverified ones." },
  { icon: Users, title: "Reach serious buyers", description: "PhoneBay buyers are looking for verified, trustworthy purchases — not lowball offers." },
  { icon: TrendingUp, title: "Track performance", description: "See views, saves, and messages on every listing from your seller dashboard." },
];

export default function ForSellersPage() {
  return (
    <>
      <Section className="pt-14 pb-10">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <SectionHeading
              eyebrow="For sellers"
              title="Sell your phone to buyers who trust the process."
              description="List for free, get verified, and get paid securely — all from one dashboard."
            />
            <Button href="/dashboard/listings/create" size="lg" className="mt-6">
              Sell Your Phone
            </Button>
          </div>
          <Card className="p-7">
            <p className="text-xs font-semibold text-ink-faint uppercase tracking-wide mb-4">
              Average results for verified listings
            </p>
            <div className="grid grid-cols-2 gap-5">
              {[
                ["+64%", "more views"],
                ["3.2x", "faster sale"],
                ["+18%", "higher price"],
                ["4.9★", "avg. seller rating"],
              ].map(([stat, label]) => (
                <div key={label}>
                  <p className="font-data text-2xl font-semibold text-ink">{stat}</p>
                  <p className="text-sm text-ink-faint">{label}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </Section>

      <Section bg="surface">
        <SectionHeading eyebrow="Why sell here" title="Built for a fair, transparent sale." align="center" className="mx-auto" />
        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {benefits.map((b) => (
            <Card key={b.title} hoverable>
              <span className="h-11 w-11 rounded-[var(--pb-radius-sm)] bg-brand-tint text-brand flex items-center justify-center mb-4">
                <b.icon className="h-5.5 w-5.5" strokeWidth={1.8} />
              </span>
              <h3 className="font-semibold text-ink">{b.title}</h3>
              <p className="text-sm text-ink-soft mt-1.5 leading-relaxed">{b.description}</p>
            </Card>
          ))}
        </div>
      </Section>

      <Section className="text-center">
        <h2 className="text-3xl font-semibold text-ink">List your first phone today.</h2>
        <Button href="/dashboard/listings/create" size="lg" className="mt-6">
          Create a Listing
        </Button>
      </Section>
    </>
  );
}
