import Link from "next/link";
import { ArrowLeft, BarChart3, BriefcaseBusiness, Factory, HandCoins, Users } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { getAdminData } from "@/app/(dashboard)/admin/_data";

export default function AdminOpportunitiesPage() {
  const { pipeline } = getAdminData();
  const stages = pipeline.opportunities;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.12em] text-brand font-medium">Admin</p>
          <h1 className="mt-2 text-3xl font-semibold text-ink">Opportunities pipeline</h1>
        </div>
        <Link href="/admin" className="inline-flex items-center gap-2 text-sm font-medium text-brand">
          <ArrowLeft className="h-4 w-4" /> Back to overview
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {stages.map((stage) => (
          <Card key={stage.label} className="p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-ink-faint">{stage.label}</p>
              <span className="flex h-10 w-10 items-center justify-center rounded-[var(--pb-radius-sm)] bg-brand-tint text-brand">
                {stage.label.includes("sign") ? <Users className="h-4 w-4" /> : stage.label.includes("lead") ? <BarChart3 className="h-4 w-4" /> : stage.label.includes("listing") ? <Factory className="h-4 w-4" /> : stage.label.includes("sales") ? <HandCoins className="h-4 w-4" /> : <BriefcaseBusiness className="h-4 w-4" />}
              </span>
            </div>
            <p className="mt-3 font-data text-3xl font-semibold text-ink">{stage.value}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
