import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/Card";

export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  tone = "brand",
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  trend?: string;
  tone?: "brand" | "verify";
}) {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <span
          className={cn(
            "h-10 w-10 rounded-[var(--pb-radius-sm)] flex items-center justify-center",
            tone === "brand" ? "bg-brand-tint text-brand" : "bg-verify-tint text-verify"
          )}
        >
          <Icon className="h-5 w-5" strokeWidth={1.9} />
        </span>
        {trend && <span className="text-xs font-medium text-verify-dark">{trend}</span>}
      </div>
      <p className="font-data text-2xl font-semibold text-ink mt-4">{value}</p>
      <p className="text-sm text-ink-faint mt-0.5">{label}</p>
    </Card>
  );
}
