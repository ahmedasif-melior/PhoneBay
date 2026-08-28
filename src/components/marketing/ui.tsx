import type { ReactNode } from "react";

/** Mono, letter-spaced label used above section headings. */
export function Eyebrow({
  children,
  tone = "violet",
}: {
  children: ReactNode;
  tone?: "violet" | "teal" | "mint";
}) {
  const toneClass =
    tone === "violet"
      ? "text-[#7567F8]"
      : tone === "teal"
      ? "text-[#10A98D]"
      : "text-[#42E6C2]";

  return (
    <p className={`font-mono text-[11px] font-semibold uppercase tracking-[0.22em] ${toneClass}`}>
      {children}
    </p>
  );
}

/** Small pill used for report-style reference codes (e.g. "SEL-ID", "#PB-88214"). */
export function DataTag({
  children,
  inverted = false,
}: {
  children: ReactNode;
  inverted?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-0.5 font-mono text-[10px] font-semibold tracking-[0.08em] ${
        inverted
          ? "border-white/15 bg-white/[0.06] text-white/70"
          : "border-black/10 bg-black/[0.03] text-[#514D59]"
      }`}
    >
      {children}
    </span>
  );
}

function Notch({ bg, side }: { bg: string; side: "left" | "right" }) {
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full ${bg} ${
        side === "left" ? "-left-2.5" : "-right-2.5"
      }`}
    />
  );
}

/**
 * A dashed "tear line" with two punched circles at each end — the perforation
 * between a ticket body and its stub. `bg` should match the color the card
 * sits on top of (the notches reveal that color, simulating a cut-out hole).
 */
export function Perforation({ bg = "bg-white" }: { bg?: string }) {
  return (
    <div className="relative my-6 border-t border-dashed border-black/15" role="presentation">
      <Notch bg={bg} side="left" />
      <Notch bg={bg} side="right" />
    </div>
  );
}

/** A row inside a ticket-style card: label on the left, mono value on the right. */
export function TicketRow({
  icon: Icon,
  label,
  value,
  valueClassName = "text-[#0F9F86]",
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <div className="flex items-center gap-2.5 text-sm text-[#3C3844]">
        <Icon className="h-4 w-4 text-black/30" />
        {label}
      </div>
      <span className={`font-mono text-xs font-semibold ${valueClassName}`}>{value}</span>
    </div>
  );
}