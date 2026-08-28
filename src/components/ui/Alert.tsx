import * as React from "react";
import { CheckCircle2, AlertTriangle, Info, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type AlertTone = "info" | "success" | "warning" | "danger";

const config: Record<AlertTone, { classes: string; icon: React.ReactNode }> = {
  info: { classes: "bg-brand-tint text-brand-dark", icon: <Info className="h-4.5 w-4.5" /> },
  success: { classes: "bg-verify-tint text-verify-dark", icon: <CheckCircle2 className="h-4.5 w-4.5" /> },
  warning: { classes: "bg-warn-tint text-warn", icon: <AlertTriangle className="h-4.5 w-4.5" /> },
  danger: { classes: "bg-danger-tint text-danger", icon: <XCircle className="h-4.5 w-4.5" /> },
};

export function Alert({
  tone = "info",
  title,
  children,
  className,
}: {
  tone?: AlertTone;
  title?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  const cfg = config[tone];
  return (
    <div
      role={tone === "danger" || tone === "warning" ? "alert" : "status"}
      className={cn("flex gap-3 rounded-[var(--pb-radius-sm)] px-4 py-3.5", cfg.classes, className)}
    >
      <span className="shrink-0 mt-0.5">{cfg.icon}</span>
      <div className="text-sm leading-relaxed">
        {title && <p className="font-semibold mb-0.5">{title}</p>}
        {children}
      </div>
    </div>
  );
}
