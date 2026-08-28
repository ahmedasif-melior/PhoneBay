"use client";

import * as React from "react";
import { gsap } from "gsap";
import { ShieldCheck, Download, Share2, QrCode } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { formatDate } from "@/lib/utils";
import type { Certificate } from "@/data/verification";

export function CertificateCard({ certificate }: { certificate: Certificate }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [downloaded, setDownloaded] = React.useState(false);
  const [shared, setShared] = React.useState(false);
  const [verified, setVerified] = React.useState(false);

  React.useEffect(() => {
    if (!ref.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ref.current,
        { opacity: 0, y: 20, rotateX: -6 },
        { opacity: 1, y: 0, rotateX: 0, duration: 0.7, ease: "power3.out" }
      );
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <div>
      <div
        ref={ref}
        className="rounded-[var(--pb-radius-lg)] bg-ink text-white p-7 sm:p-10 relative overflow-hidden"
        style={{ perspective: 1000 }}
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="h-5 w-5 text-verify-tint" />
              <p className="text-xs font-semibold text-white/60 uppercase tracking-[0.14em]">
                PhoneBay Verified
              </p>
            </div>
            <p className="text-xs text-white/50 uppercase tracking-wide">Device Certificate</p>
            <h2 className="font-display text-3xl font-semibold mt-2">{certificate.device}</h2>
            <p className="text-sm text-white/60">{certificate.storage}</p>
          </div>
          <span className="h-14 w-14 rounded-[var(--pb-radius-sm)] bg-white/10 flex items-center justify-center shrink-0">
            <QrCode className="h-7 w-7" />
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-8">
          {[
            ["Overall Score", `${certificate.overallScore.toFixed(1)}/10`],
            ["Battery", `${certificate.batteryHealth}%`],
            ["Display", certificate.display.toFixed(1)],
            ["Camera", certificate.camera.toFixed(1)],
            ["Performance", certificate.performance.toFixed(1)],
            ["Physical Condition", certificate.physicalCondition.toFixed(1)],
          ].map(([label, val]) => (
            <div key={label} className="rounded-[var(--pb-radius-sm)] bg-white/[0.06] px-4 py-3.5">
              <p className="text-xs text-white/50">{label}</p>
              <p className="font-data text-xl font-semibold mt-0.5">{val}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 pt-6 border-t border-white/10 grid sm:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-white/50">Tested by</p>
            <p className="text-white mt-0.5">{certificate.testedBy}</p>
          </div>
          <div>
            <p className="text-white/50">Certificate ID</p>
            <p className="font-data text-white mt-0.5">{certificate.id}</p>
          </div>
          <div>
            <p className="text-white/50">Issued</p>
            <p className="text-white mt-0.5">{formatDate(certificate.issued)}</p>
          </div>
          <div>
            <p className="text-white/50">Valid until</p>
            <p className="text-white mt-0.5">{formatDate(certificate.validUntil)}</p>
          </div>
        </div>

        <div className="absolute -bottom-16 -right-16 h-56 w-56 rounded-full bg-brand/30 blur-3xl" aria-hidden="true" />
      </div>

      <div className="flex flex-wrap gap-3 mt-5">
        <Button variant="outline" onClick={() => setDownloaded(true)}>
          <Download className="h-4 w-4" /> Download Certificate
        </Button>
        <Button variant="outline" onClick={() => setShared(true)}>
          <Share2 className="h-4 w-4" /> Share Certificate
        </Button>
        <Button variant="ghost" onClick={() => setVerified(true)}>
          <ShieldCheck className="h-4 w-4" /> Verify Certificate
        </Button>
      </div>

      <div className="flex flex-col gap-2.5 mt-4">
        {downloaded && <Alert tone="success">Certificate downloaded as PB-{certificate.id}.pdf (demo only).</Alert>}
        {shared && <Alert tone="info">A shareable link has been copied to your clipboard (demo only).</Alert>}
        {verified && <Alert tone="success">Certificate {certificate.id} is authentic and currently active.</Alert>}
      </div>
    </div>
  );
}
