"use client";

import * as React from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Check, Wrench, ScanLine, Tag, ClipboardList } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { PassportEvent } from "@/data/verification";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const iconFor = (event: string) => {
  if (event.toLowerCase().includes("repair")) return Wrench;
  if (event.toLowerCase().includes("verif") || event.toLowerCase().includes("tested")) return ScanLine;
  if (event.toLowerCase().includes("listed")) return Tag;
  return ClipboardList;
};

export function PassportTimeline({ events, device }: { events: PassportEvent[]; device: string }) {
  const ref = React.useRef<HTMLOListElement>(null);

  React.useEffect(() => {
    if (!ref.current) return;
    const items = ref.current.querySelectorAll("[data-passport-item]");
    const ctx = gsap.context(() => {
      items.forEach((el, i) => {
        gsap.fromTo(
          el,
          { opacity: 0, x: -16 },
          {
            opacity: 1,
            x: 0,
            duration: 0.5,
            delay: i * 0.06,
            ease: "power2.out",
            scrollTrigger: { trigger: el, start: "top 90%", once: true },
          }
        );
      });
    }, ref);
    return () => ctx.revert();
  }, [events]);

  return (
    <div>
      <p className="text-sm text-ink-soft leading-relaxed mb-8 max-w-lg">
        Device Passport keeps important device events in one place — a permanent,
        verifiable timeline for <span className="font-medium text-ink">{device}</span>.
      </p>
      <ol ref={ref} className="relative border-l-2 border-border ml-2">
        {events.map((event, i) => {
          const Icon = iconFor(event.event);
          return (
            <li key={i} data-passport-item className="pl-8 pb-10 last:pb-0 relative">
              <span className="absolute -left-[17px] top-0 h-8 w-8 rounded-full bg-verify flex items-center justify-center ring-4 ring-bg">
                <Icon className="h-4 w-4 text-white" strokeWidth={2} />
              </span>
              <div className="rounded-[var(--pb-radius-md)] border border-border bg-surface p-5">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <p className="font-data text-xs text-ink-faint">{formatDate(event.date)}</p>
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-verify-dark bg-verify-tint rounded-full px-2.5 py-1">
                    <Check className="h-3 w-3" /> Completed
                  </span>
                </div>
                <p className="font-semibold text-ink mt-2">{event.event}</p>
                <p className="text-sm text-ink-soft mt-0.5">{event.provider}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
