import * as React from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function Rating({
  value,
  count,
  size = "sm",
  className,
}: {
  value: number;
  count?: number;
  size?: "sm" | "md";
  className?: string;
}) {
  const iconSize = size === "sm" ? "h-3.5 w-3.5" : "h-4.5 w-4.5";
  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      <Star className={cn(iconSize, "fill-[#e8a23d] text-[#e8a23d]")} />
      <span className={cn("font-medium text-ink", size === "sm" ? "text-sm" : "text-base")}>
        {value.toFixed(1)}
      </span>
      {typeof count === "number" && (
        <span className="text-ink-faint text-sm">({count})</span>
      )}
    </span>
  );
}

/**
 * SignalScore — the brand's signature scoring device. Renders a device's
 * trust/condition score as ascending signal bars (0–10 scale, 4 bars),
 * echoing a phone's reception indicator. Used on listings, certificates,
 * and testing reports wherever a score needs to be legible at a glance.
 */
export function SignalScore({
  score,
  size = "md",
  showLabel = true,
  className,
}: {
  score: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}) {
  const level = score >= 9 ? 4 : score >= 7 ? 3 : score >= 5 ? 2 : 1;
  const barHeights = ["30%", "55%", "78%", "100%"];
  const dims = { sm: "h-3", md: "h-4", lg: "h-5" }[size];
  const barWidth = { sm: "w-[2.5px]", md: "w-[3px]", lg: "w-1" }[size];
  const textSize = { sm: "text-xs", md: "text-sm", lg: "text-base" }[size];

  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span className={cn("inline-flex items-end gap-[2px]", dims)} aria-hidden="true">
        {barHeights.map((h, i) => (
          <span
            key={i}
            className={cn(
              barWidth,
              "rounded-[1px]",
              i < level ? "bg-verify" : "bg-border-strong"
            )}
            style={{ height: h }}
          />
        ))}
      </span>
      {showLabel && (
        <span className={cn("font-data font-medium text-ink", textSize)}>
          {score.toFixed(1)}
          <span className="text-ink-faint">/10</span>
        </span>
      )}
    </span>
  );
}
