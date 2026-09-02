import * as React from "react";
import { BadgeCheck, ShieldCheck, Clock, XCircle, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

type BadgeTone = "neutral" | "brand" | "verify" | "warn" | "danger";

const toneClasses: Record<BadgeTone, string> = {
  neutral: "bg-black/[0.045] text-ink-soft",
  brand: "bg-brand-tint text-brand-dark",
  verify: "bg-verify-tint text-verify-dark",
  warn: "bg-warn-tint text-warn",
  danger: "bg-danger-tint text-danger",
};

export function Badge({
  tone = "neutral",
  className,
  children,
  icon,
}: {
  tone?: BadgeTone;
  className?: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
        toneClasses[tone],
        className
      )}
    >
      {icon}
      {children}
    </span>
  );
}

export function VerificationBadge({
  size = "sm",
  className,
}: {
  size?: "sm" | "md";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-verify-tint text-verify-dark font-medium",
        size === "sm" ? "px-2.5 py-1 text-xs" : "px-3 py-1.5 text-sm",
        className
      )}
    >
      <ShieldCheck className={size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"} strokeWidth={2.25} />
      Professionally Verified
    </span>
  );
}

export function SellerBadge({
  className,
  label = "Verified Seller",
}: {
  className?: string;
  label?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-brand-tint text-brand-dark px-2.5 py-1 text-xs font-medium",
        className
      )}
    >
      <BadgeCheck className="h-3.5 w-3.5" strokeWidth={2.25} />
      {label}
    </span>
  );
}

type ListingStatus = "active" | "pending" | "sold" | "draft" | "paused";
type VerificationBadgeStatus = "pending" | "in_progress" | "completed";

type SharedStatus = ListingStatus | VerificationBadgeStatus;

const statusConfig: Record<
  SharedStatus,
  { label: string; tone: BadgeTone; icon: React.ReactNode }
> = {
  active: { label: "Active", tone: "verify", icon: <span className="h-1.5 w-1.5 rounded-full bg-verify" /> },
  pending: { label: "Pending", tone: "warn", icon: <Clock className="h-3 w-3" /> },
  sold: { label: "Sold", tone: "brand", icon: <BadgeCheck className="h-3 w-3" /> },
  draft: { label: "Draft", tone: "neutral", icon: <span className="h-1.5 w-1.5 rounded-full bg-ink-faint" /> },
  paused: { label: "Paused", tone: "neutral", icon: <span className="h-1.5 w-1.5 rounded-full bg-ink-faint" /> },
  in_progress: { label: "In Progress", tone: "brand", icon: <span className="h-1.5 w-1.5 rounded-full bg-brand animate-pulse" /> },
  completed: { label: "Completed", tone: "verify", icon: <BadgeCheck className="h-3 w-3" /> },
};

export function StatusBadge({ status }: { status: SharedStatus }) {
  const cfg = statusConfig[status];
  return (
    <Badge tone={cfg.tone} icon={cfg.icon}>
      {cfg.label}
    </Badge>
  );
}

type TestStatus = "pending" | "testing" | "pass" | "fail";

export function TestStatusBadge({ status }: { status: TestStatus }) {
  const map: Record<TestStatus, { label: string; tone: BadgeTone; icon: React.ReactNode }> = {
    pending: { label: "Pending", tone: "neutral", icon: <Clock className="h-3 w-3" /> },
    testing: { label: "Testing", tone: "brand", icon: <span className="h-1.5 w-1.5 rounded-full bg-brand animate-pulse" /> },
    pass: { label: "Pass", tone: "verify", icon: <BadgeCheck className="h-3 w-3" /> },
    fail: { label: "Fail", tone: "danger", icon: <XCircle className="h-3 w-3" /> },
  };
  const cfg = map[status];
  return (
    <Badge tone={cfg.tone} icon={cfg.icon}>
      {cfg.label}
    </Badge>
  );
}

export function DisputeBadge({ open }: { open: boolean }) {
  return open ? (
    <Badge tone="warn" icon={<AlertTriangle className="h-3 w-3" />}>
      Open
    </Badge>
  ) : (
    <Badge tone="verify" icon={<BadgeCheck className="h-3 w-3" />}>
      Resolved
    </Badge>
  );
}
