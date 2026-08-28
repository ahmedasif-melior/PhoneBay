"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export function OtpInput({
  length = 6,
  onComplete,
}: {
  length?: number;
  onComplete?: (code: string) => void;
}) {
  const [values, setValues] = React.useState<string[]>(Array(length).fill(""));
  const refs = React.useRef<(HTMLInputElement | null)[]>([]);

  const update = (index: number, val: string) => {
    if (!/^[0-9]?$/.test(val)) return;
    const next = [...values];
    next[index] = val;
    setValues(next);
    if (val && index < length - 1) refs.current[index + 1]?.focus();
    if (next.every((v) => v !== "")) onComplete?.(next.join(""));
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !values[index] && index > 0) {
      refs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!pasted) return;
    e.preventDefault();
    const next = Array(length).fill("");
    pasted.split("").forEach((c, i) => (next[i] = c));
    setValues(next);
    refs.current[Math.min(pasted.length, length - 1)]?.focus();
    if (pasted.length === length) onComplete?.(pasted);
  };

  return (
    <div className="flex gap-2.5 justify-center" role="group" aria-label="One-time passcode">
      {values.map((v, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          value={v}
          onChange={(e) => update(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          inputMode="numeric"
          maxLength={1}
          aria-label={`Digit ${i + 1}`}
          className={cn(
            "h-14 w-11 sm:w-12 text-center text-xl font-data font-semibold rounded-[var(--pb-radius-sm)] border border-border-strong bg-surface text-ink",
            "focus:outline-none focus:ring-2 focus:ring-brand/25 focus:border-brand"
          )}
        />
      ))}
    </div>
  );
}
