import type { Metadata } from "next";
import { CertificateCard } from "@/components/verification/CertificateCard";
import { certificates } from "@/data/verification";

export const metadata: Metadata = { title: "Certificates" };

export default function CertificatesPage() {
  const certificate = certificates[0];

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-semibold text-ink">Device Certificates</h1>
      <p className="text-ink-soft mt-1">Your professionally verified device certificates.</p>

      <div className="mt-7">
        <CertificateCard certificate={certificate} />
      </div>
    </div>
  );
}
