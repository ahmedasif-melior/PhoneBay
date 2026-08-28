import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function StepProgress({
  steps,
  current,
}: {
  steps: string[];
  current: number;
}) {
  return (
    <div className="flex items-center" aria-label="Progress">
      {steps.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={label} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <span
                className={cn(
                  "h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 transition-colors",
                  done && "bg-verify text-white",
                  active && "bg-brand text-white",
                  !done && !active && "bg-black/[0.06] text-ink-faint"
                )}
              >
                {done ? <Check className="h-4 w-4" /> : i + 1}
              </span>
              <span
                className={cn(
                  "text-[11px] font-medium hidden sm:block text-center max-w-[70px]",
                  active ? "text-ink" : "text-ink-faint"
                )}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <span
                className={cn("h-0.5 flex-1 mx-2 rounded-full", done ? "bg-verify" : "bg-border")}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
