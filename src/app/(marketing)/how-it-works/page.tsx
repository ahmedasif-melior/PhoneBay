import type { Metadata } from "next";
import { Search, ShieldCheck, MessageCircle, Truck, Tag, ScanLine, FileCheck, HandCoins } from "lucide-react";
import { Section, SectionHeading } from "@/components/marketing/Section";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "How It Works",
  description: "How buying and selling works on PhoneBay, from browsing to protected delivery.",
};

const buySteps = [
  { icon: Search, title: "Browse verified listings", description: "Filter by brand, price, condition, and verification status to find the right device." },
  { icon: ShieldCheck, title: "Review the certificate", description: "Check the testing report, battery health, and device passport before you commit." },
  { icon: MessageCircle, title: "Message the seller", description: "Ask questions directly, in-app, before placing an order." },
  { icon: Truck, title: "Receive with protection", description: "Your payment stays held until you confirm the device matches its listing." },
];

const sellSteps = [
  { icon: Tag, title: "Create your listing", description: "Add device details, condition, photos, and your price in a few minutes." },
  { icon: ScanLine, title: "Get verified (optional)", description: "Request a professional inspection to earn a verified badge and certificate." },
  { icon: FileCheck, title: "Receive offers", description: "Respond to buyer messages and negotiate directly through PhoneBay." },
  { icon: HandCoins, title: "Get paid securely", description: "Funds are released once the buyer confirms the device on delivery." },
];

export default function HowItWorksPage() {
  return (
    <>
      <Section className="pt-14 pb-10 text-center">
        <SectionHeading
          eyebrow="How it works"
          title="A simple, transparent process from listing to handover."
          align="center"
          className="mx-auto"
        />
      </Section>

      <Section bg="surface">
        <h2 className="text-2xl font-semibold text-ink mb-8">Buying on PhoneBay</h2>
        <ol className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {buySteps.map((step, i) => (
            <li key={step.title} className="relative">
              <span className="font-data text-xs text-ink-faint">Step {i + 1}</span>
              <span className="h-11 w-11 rounded-[var(--pb-radius-sm)] bg-brand-tint text-brand flex items-center justify-center mt-2 mb-4">
                <step.icon className="h-5.5 w-5.5" strokeWidth={1.8} />
              </span>
              <h3 className="font-semibold text-ink">{step.title}</h3>
              <p className="text-sm text-ink-soft mt-1.5 leading-relaxed">{step.description}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section>
        <h2 className="text-2xl font-semibold text-ink mb-8">Selling on PhoneBay</h2>
        <ol className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {sellSteps.map((step, i) => (
            <li key={step.title} className="relative">
              <span className="font-data text-xs text-ink-faint">Step {i + 1}</span>
              <span className="h-11 w-11 rounded-[var(--pb-radius-sm)] bg-verify-tint text-verify flex items-center justify-center mt-2 mb-4">
                <step.icon className="h-5.5 w-5.5" strokeWidth={1.8} />
              </span>
              <h3 className="font-semibold text-ink">{step.title}</h3>
              <p className="text-sm text-ink-soft mt-1.5 leading-relaxed">{step.description}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section bg="surface" className="text-center">
        <h2 className="text-3xl font-semibold text-ink">Ready to get started?</h2>
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <Button href="/marketplace" size="lg">Explore Phones</Button>
          <Button href="/dashboard/listings/new" size="lg" variant="outline">Sell Your Phone</Button>
        </div>
      </Section>
    </>
  );
}
