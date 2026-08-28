import { BadgeCheck, QrCode, Download, Share2 } from "lucide-react";
import { SignalScore } from "@/components/ui/Rating";

const rows = [
  ["Display", "PASS"],
  ["Touch", "PASS"],
  ["Camera", "PASS"],
  ["Speaker", "PASS"],
  ["Microphone", "PASS"],
  ["Charging", "PASS"],
] as const;

export function TestReportPreview() {
  return (
    <div className="rounded-[var(--pb-radius-lg)] border border-border bg-surface overflow-hidden">
      <div className="p-6 border-b border-border flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-ink-faint uppercase tracking-wide">
            Testing Report
          </p>
          <h3 className="font-display text-xl font-semibold mt-1">iPhone 15 Pro · 256GB</h3>
        </div>
        <SignalScore score={9.1} size="lg" />
      </div>
      <div className="grid grid-cols-2 divide-x divide-border">
        <dl className="divide-y divide-border">
          {rows.map(([label, status]) => (
            <div key={label} className="flex items-center justify-between px-6 py-3">
              <dt className="text-sm text-ink-soft">{label}</dt>
              <dd className="inline-flex items-center gap-1.5 text-sm font-semibold text-verify-dark font-data">
                <BadgeCheck className="h-4 w-4" />
                {status}
              </dd>
            </div>
          ))}
        </dl>
        <div className="p-6 flex flex-col gap-5">
          <div>
            <p className="text-xs text-ink-faint mb-1">Battery Health</p>
            <p className="font-data text-2xl font-semibold text-ink">91%</p>
          </div>
          <div>
            <p className="text-xs text-ink-faint mb-1">Overall Score</p>
            <p className="font-data text-2xl font-semibold text-ink">
              9.1<span className="text-ink-faint text-base">/10</span>
            </p>
          </div>
          <p className="text-sm text-ink-soft leading-relaxed mt-auto">
            Tested by a PhoneBay Verified Partner using a 12-point technical inspection.
          </p>
        </div>
      </div>
    </div>
  );
}

export function CertificatePreview() {
  return (
    <div className="rounded-[var(--pb-radius-lg)] border border-border bg-ink text-white p-7 sm:p-8 relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-white/60 uppercase tracking-[0.14em]">
            PhoneBay Verified · Device Certificate
          </p>
          <h3 className="font-display text-2xl font-semibold mt-2">iPhone 15 Pro</h3>
          <p className="text-sm text-white/60">256GB · Certificate ID PB-829182</p>
        </div>
        <span className="h-12 w-12 rounded-[var(--pb-radius-sm)] bg-white/10 flex items-center justify-center shrink-0">
          <QrCode className="h-6 w-6" />
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
        {[
          ["Overall", "9.1"],
          ["Battery", "91%"],
          ["Display", "9.3"],
          ["Camera", "9.2"],
        ].map(([label, val]) => (
          <div key={label} className="rounded-[var(--pb-radius-sm)] bg-white/[0.06] px-4 py-3">
            <p className="text-xs text-white/50">{label}</p>
            <p className="font-data text-lg font-semibold mt-0.5">{val}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10 text-sm">
        <span className="text-white/50">Issued 27 Aug 2026 · Valid until 27 Sep 2026</span>
        <div className="flex items-center gap-3 text-white/70">
          <Download className="h-4 w-4" />
          <Share2 className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}
