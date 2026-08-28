import { Check } from "lucide-react";
import { passportTimeline } from "@/data/verification";

export function PassportPreview() {
  return (
    <div className="rounded-[var(--pb-radius-lg)] border border-border bg-surface p-7 sm:p-8">
      <p className="text-xs font-semibold text-ink-faint uppercase tracking-wide mb-1">
        Device Passport
      </p>
      <h3 className="font-display text-xl font-semibold mb-6">iPhone 15 Pro — full history</h3>
      <ol className="relative border-l border-border ml-1.5">
        {passportTimeline.map((event, i) => (
          <li key={i} className="pl-6 pb-7 last:pb-0 relative">
            <span className="absolute -left-[9px] top-0.5 h-4 w-4 rounded-full bg-verify flex items-center justify-center ring-4 ring-surface">
              <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />
            </span>
            <p className="text-xs text-ink-faint font-data">
              {new Date(event.date).toLocaleDateString("en-GB", {
                month: "long",
                year: "numeric",
              })}
            </p>
            <p className="text-[15px] font-medium text-ink mt-0.5">{event.event}</p>
            <p className="text-sm text-ink-soft">{event.provider}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
