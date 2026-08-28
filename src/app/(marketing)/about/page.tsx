import type { Metadata } from "next";
import { Section, SectionHeading } from "@/components/marketing/Section";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "About",
  description: "PhoneBay's mission is to make the used phone market trustworthy, transparent, and global.",
};

const values = [
  { title: "Trust, verified", description: "We believe trust should be demonstrated, not just claimed — every verified device carries evidence, not just a description." },
  { title: "Transparent by default", description: "Device history, condition, and testing results are visible before you commit, not hidden behind a listing." },
  { title: "Built for everyone", description: "From individual sellers to established shops, PhoneBay is designed to work for the whole mobile device community." },
];

export default function AboutPage() {
  return (
    <>
      <Section className="pt-14 pb-10">
        <SectionHeading
          eyebrow="About PhoneBay"
          title="Making the used phone market something you can trust."
          description="PhoneBay started with a simple observation: buying a used phone is one of the most common purchases people make, and one of the least transparent. We're building the marketplace that fixes that."
        />
      </Section>

      <Section bg="surface">
        <div className="grid sm:grid-cols-3 gap-5">
          {values.map((v) => (
            <Card key={v.title}>
              <h3 className="font-semibold text-ink text-lg">{v.title}</h3>
              <p className="text-sm text-ink-soft mt-2 leading-relaxed">{v.description}</p>
            </Card>
          ))}
        </div>
      </Section>

      <Section>
        <div className="grid sm:grid-cols-4 gap-6 text-center">
          {[
            ["12,842", "Registered users"],
            ["3,921", "Verified devices"],
            ["182", "Verified shops"],
            ["8,421", "Completed transactions"],
          ].map(([stat, label]) => (
            <div key={label}>
              <p className="font-data text-3xl font-semibold text-ink">{stat}</p>
              <p className="text-sm text-ink-faint mt-1">{label}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section bg="surface">
        <SectionHeading
          eyebrow="Where we operate"
          title="Starting in Pakistan, built for the world."
          description="PhoneBay launched across Islamabad, Lahore, Karachi, and Rawalpindi, with a verification network designed to scale internationally."
        />
      </Section>
    </>
  );
}
