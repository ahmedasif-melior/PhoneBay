import type { Metadata } from "next";
import { Section } from "@/components/marketing/Section";
import { TestingWorkbench } from "@/components/shop/TestingWorkbench";

export const metadata: Metadata = {
  title: "Testing Interface",
  description: "A frontend-only device testing dashboard for a PhoneBay partner shop.",
};

export default function ShopTestingPage() {
  return (
    <Section className="pt-10 sm:pt-14">
      <div className="mb-8">
        <p className="text-sm font-medium uppercase tracking-[0.12em] text-brand">Testing interface</p>
        <h1 className="mt-2 text-3xl font-semibold text-ink">Device inspection dashboard</h1>
      </div>
      <TestingWorkbench />
    </Section>
  );
}
