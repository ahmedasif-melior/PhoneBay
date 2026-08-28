import { X, Check } from "lucide-react";

const problems = [
  "Unknown condition",
  "Unknown repair history",
  "Unverified sellers",
  "Fake listings",
  "Unclear device history",
];

const solutions = [
  "Verified seller",
  "Device testing",
  "Digital certificate",
  "Testing history",
  "Protected transaction",
];

export function ProblemSolution() {
  return (
    <div className="grid md:grid-cols-2 gap-5">
      <div className="rounded-[var(--pb-radius-lg)] border border-border bg-surface p-7">
        <p className="text-sm font-semibold text-ink-faint uppercase tracking-wide mb-5">
          Buying used, today
        </p>
        <ul className="flex flex-col gap-3.5">
          {problems.map((p) => (
            <li key={p} className="flex items-center gap-3 text-[15px] text-ink-soft">
              <span className="h-6 w-6 rounded-full bg-danger-tint text-danger flex items-center justify-center shrink-0">
                <X className="h-3.5 w-3.5" strokeWidth={2.5} />
              </span>
              {p}
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-[var(--pb-radius-lg)] border border-verify/25 bg-verify-tint p-7">
        <p className="text-sm font-semibold text-verify-dark uppercase tracking-wide mb-5">
          Buying on PhoneBay
        </p>
        <ul className="flex flex-col gap-3.5">
          {solutions.map((s) => (
            <li key={s} className="flex items-center gap-3 text-[15px] text-ink font-medium">
              <span className="h-6 w-6 rounded-full bg-verify text-white flex items-center justify-center shrink-0">
                <Check className="h-3.5 w-3.5" strokeWidth={2.75} />
              </span>
              {s}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
