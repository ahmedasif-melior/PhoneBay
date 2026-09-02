import type { Metadata } from "next";
import { Section } from "@/components/marketing/Section";
import { CertificateCard } from "@/components/verification/CertificateCard";
import { certificates } from "@/data/verification";

export const metadata: Metadata = {
  title: "Shop Certificates",
  description: "Verified device certificates issued by PhoneBay partner shops.",
};

export default function ShopCertificatesPage() {
  return (
    <Section className="pt-10 sm:pt-14">
      <div className="mb-8">
        <p className="text-sm font-medium uppercase tracking-[0.12em] text-brand">Certificates</p>
        <h1 className="mt-2 text-3xl font-semibold text-ink">Issued device certificates</h1>
      </div>
      <div className="max-w-5xl">
        {certificates.map((certificate) => (
          <CertificateCard key={certificate.id} certificate={certificate} />
        ))}
      </div>
    </Section>
  );
}
