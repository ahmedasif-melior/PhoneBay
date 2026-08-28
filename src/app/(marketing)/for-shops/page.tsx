import type { Metadata } from "next";
import { Wrench, ClipboardCheck, BarChart3, Handshake } from "lucide-react";
import { Section, SectionHeading } from "@/components/marketing/Section";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "For Shops",
  description: "Partner with PhoneBay as a verified mobile shop offering testing, repairs, and certification.",
};

const services = [
  { icon: ClipboardCheck, title: "Verification jobs", description: "Get routed testing requests from PhoneBay buyers and sellers in your city." },
  { icon: Wrench, title: "Repairs & re-testing", description: "Offer certified repairs that automatically update a device's passport." },
  { icon: BarChart3, title: "Shop analytics", description: "Track jobs completed, average scores, and revenue from your shop dashboard." },
  { icon: Handshake, title: "Trusted partner badge", description: "Verified shops are surfaced to customers browsing nearby sellers." },
];

export default function ForShopsPage() {
  return (
    <>
      <Section className="pt-14 pb-10">
        <SectionHeading
          eyebrow="For shops"
          title="Turn your shop into a PhoneBay verified partner."
          description="Offer professional device testing, repairs, and certification — and get discovered by buyers and sellers near you."
          className=""
        />
        <Button href="/shop/dashboard" size="lg" className="mt-6">
          Go to Shop Dashboard
        </Button>
      </Section>

      <Section bg="surface">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {services.map((s) => (
            <Card key={s.title} hoverable>
              <span className="h-11 w-11 rounded-[var(--pb-radius-sm)] bg-verify-tint text-verify flex items-center justify-center mb-4">
                <s.icon className="h-5.5 w-5.5" strokeWidth={1.8} />
              </span>
              <h3 className="font-semibold text-ink">{s.title}</h3>
              <p className="text-sm text-ink-soft mt-1.5 leading-relaxed">{s.description}</p>
            </Card>
          ))}
        </div>
      </Section>

      <Section>
        <SectionHeading eyebrow="How partnership works" title="Three steps to becoming a partner." align="center" className="mx-auto" />
        <ol className="mt-10 grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
          {[
            ["Apply", "Submit your shop details and location for review."],
            ["Get verified", "Our team confirms your credentials and testing capability."],
            ["Start earning", "Receive testing jobs and list your services on PhoneBay."],
          ].map(([title, desc], i) => (
            <li key={title} className="text-center">
              <span className="font-data text-brand font-semibold">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="font-semibold text-ink mt-2">{title}</h3>
              <p className="text-sm text-ink-soft mt-1.5 leading-relaxed">{desc}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section bg="surface" className="text-center">
        <h2 className="text-3xl font-semibold text-ink">Ready to partner with PhoneBay?</h2>
        <Button href="/contact" size="lg" className="mt-6">
          Apply as a Shop
        </Button>
      </Section>
    </>
  );
}
