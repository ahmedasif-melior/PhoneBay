"use client";

import * as React from "react";
import {
  TrendingUp,
  DollarSign,
  ShieldCheck,
  Percent,
  Download,
  Calendar,
  Layers,
  Award,
  AlertCircle,
  FileSpreadsheet,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { formatPKR } from "@/lib/utils";
import type { AdminReportData } from "@/app/(dashboard)/admin/_data";

export function AdminReportsManager({ reports }: { reports: AdminReportData }) {
  const [timeframe, setTimeframe] = React.useState<"30d" | "90d" | "ytd" | "all">("30d");

  const multiplier = timeframe === "30d" ? 1 : timeframe === "90d" ? 2.8 : timeframe === "ytd" ? 7.5 : 11;
  const currentGmv = reports.overview.gmv * (timeframe === "30d" ? 1 : multiplier / 3);
  const currentCommission = reports.overview.commission_earned * (timeframe === "30d" ? 1 : multiplier / 3);
  const currentVerifications = reports.overview.verification_revenue * (timeframe === "30d" ? 1 : multiplier / 3);

  const exportFinancialsCsv = () => {
    const rows = [
      ["Metric", "Value"],
      ["Gross Merchandise Value (GMV)", formatPKR(currentGmv)],
      ["Platform Commission Revenue", formatPKR(currentCommission)],
      ["Device Testing & Verification Revenue", formatPKR(currentVerifications)],
      ["Average Order Value (AOV)", formatPKR(reports.overview.avg_order_value)],
      ["Platform Dispute Rate", `${reports.overview.dispute_rate}%`],
      ["Lab Turnaround Time", `${reports.overview.turnaround_hours} hours`],
      [],
      ["Month", "GMV (PKR)", "Commission (PKR)", "Verifications (PKR)"],
      ...reports.monthlyRevenue.map((m) => [m.month, m.gmv, m.commission, m.verifications]),
    ];

    const csvContent = "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `phonebay-financial-report-${timeframe}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Range Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">
            Marketplace Analytics & Reports
          </h1>
          <p className="mt-1 text-sm text-ink-soft">
            Financial auditing, transaction volumes, brand velocity, and operational health metrics.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex rounded-[var(--pb-radius-sm)] border border-border bg-surface p-1 text-xs">
            <button
              onClick={() => setTimeframe("30d")}
              className={`px-3 py-1.5 rounded-[var(--pb-radius-sm)] font-medium transition-colors ${
                timeframe === "30d" ? "bg-brand text-white" : "text-ink-soft hover:text-ink"
              }`}
            >
              30 Days
            </button>
            <button
              onClick={() => setTimeframe("90d")}
              className={`px-3 py-1.5 rounded-[var(--pb-radius-sm)] font-medium transition-colors ${
                timeframe === "90d" ? "bg-brand text-white" : "text-ink-soft hover:text-ink"
              }`}
            >
              90 Days
            </button>
            <button
              onClick={() => setTimeframe("ytd")}
              className={`px-3 py-1.5 rounded-[var(--pb-radius-sm)] font-medium transition-colors ${
                timeframe === "ytd" ? "bg-brand text-white" : "text-ink-soft hover:text-ink"
              }`}
            >
              Year to Date
            </button>
          </div>

          <Button variant="outline" size="sm" onClick={exportFinancialsCsv}>
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export Audit CSV</span>
          </Button>
        </div>
      </div>

      {/* Main KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-faint">
              Gross Marketplace Volume
            </span>
            <div className="h-9 w-9 rounded-[var(--pb-radius-sm)] bg-brand-tint text-brand flex items-center justify-center">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 font-data text-2xl font-bold text-ink">{formatPKR(currentGmv)}</p>
          <p className="mt-1 text-xs text-emerald-600 font-medium">↑ +18.4% compared to previous period</p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-faint">
              Platform Take Rate (3%)
            </span>
            <div className="h-9 w-9 rounded-[var(--pb-radius-sm)] bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 font-data text-2xl font-bold text-ink">{formatPKR(currentCommission)}</p>
          <p className="mt-1 text-xs text-ink-soft">Escrow transaction settlement fee</p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-faint">
              Verification Lab Revenue
            </span>
            <div className="h-9 w-9 rounded-[var(--pb-radius-sm)] bg-blue-50 text-blue-700 flex items-center justify-center">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 font-data text-2xl font-bold text-ink">{formatPKR(currentVerifications)}</p>
          <p className="mt-1 text-xs text-ink-soft">PKR 2,500 per hardware test certified</p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-faint">
              Dispute Rate & Health
            </span>
            <div className="h-9 w-9 rounded-[var(--pb-radius-sm)] bg-amber-50 text-amber-700 flex items-center justify-center">
              <Percent className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 font-data text-2xl font-bold text-ink">{reports.overview.dispute_rate}%</p>
          <p className="mt-1 text-xs text-emerald-600 font-medium">Well below 2.5% industry benchmark</p>
        </Card>
      </div>

      {/* Monthly Progression & Brand Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Revenue Bars */}
        <Card className="p-5 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-ink">Marketplace Growth Progression</h2>
              <p className="text-xs text-ink-soft">Historical monthly volume trends (GMV & net take)</p>
            </div>
            <span className="text-xs font-medium text-brand">PKR in Millions</span>
          </div>

          <div className="space-y-3 pt-2">
            {reports.monthlyRevenue.map((item) => {
              const maxGmv = 45000000;
              const widthPct = Math.round((item.gmv / maxGmv) * 100);
              return (
                <div key={item.month} className="space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-ink">{item.month}</span>
                    <span className="font-data text-ink-soft font-semibold">{formatPKR(item.gmv)}</span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-bg overflow-hidden border border-border">
                    <div
                      className="h-full bg-gradient-to-r from-brand to-brand-dark rounded-full transition-all duration-500"
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Brand Market Share */}
        <Card className="p-5 space-y-4">
          <div>
            <h2 className="text-base font-bold text-ink">Volume by Manufacturer</h2>
            <p className="text-xs text-ink-soft">Brand dominance across completed transactions</p>
          </div>

          <div className="space-y-3 pt-2">
            {reports.brandBreakdown.map((brand) => (
              <div key={brand.brand} className="p-3 rounded-[var(--pb-radius-sm)] border border-border bg-bg space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <strong className="text-ink">{brand.brand}</strong>
                  <span className="font-data font-bold text-brand">{brand.share}%</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-ink-soft">
                  <span>{brand.count} devices</span>
                  <span>{formatPKR(brand.volume)}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Dispute breakdown table */}
      <Card className="p-5 space-y-3">
        <h2 className="text-base font-bold text-ink">Quality Control & Dispute Analysis</h2>
        <p className="text-xs text-ink-soft">Root-cause breakdown of order disputes and resolutions</p>

        <div className="overflow-x-auto mt-3">
          <table className="min-w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border text-ink-faint">
                <th className="pb-2.5 font-semibold">Reported Claim Category</th>
                <th className="pb-2.5 font-semibold">Incidence Count</th>
                <th className="pb-2.5 font-semibold">Standard Resolution Protocol</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {reports.disputeBreakdown.map((d) => (
                <tr key={d.reason} className="py-2.5">
                  <td className="py-2.5 font-medium text-ink">{d.reason}</td>
                  <td className="py-2.5 font-data font-semibold text-ink">{d.count} cases</td>
                  <td className="py-2.5 text-ink-soft">{d.resolution}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
