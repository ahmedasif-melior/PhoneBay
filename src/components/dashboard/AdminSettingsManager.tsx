"use client";

import * as React from "react";
import {
  Settings,
  ShieldAlert,
  Save,
  DollarSign,
  Percent,
  Clock,
  Mail,
  Phone,
  Bell,
  AlertTriangle,
  Lock,
  CheckCircle2,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import type { AdminSettings } from "@/app/(dashboard)/admin/_data";

export function AdminSettingsManager({ initialSettings }: { initialSettings: AdminSettings }) {
  const [settings, setSettings] = React.useState<AdminSettings>(initialSettings);
  const [isSaving, setIsSaving] = React.useState(false);
  const [toast, setToast] = React.useState<{ msg: string; type: "success" | "error" } | null>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      // Simulate network save
      await new Promise((r) => setTimeout(r, 600));
      showToast("Platform configuration settings saved successfully!");
    } catch {
      showToast("Failed to save settings", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 rounded-[var(--pb-radius-md)] px-4 py-2.5 text-sm font-medium shadow-lg border animate-in slide-in-from-top-2 duration-200 ${
            toast.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-red-50 text-red-800 border-red-200"
          }`}
        >
          {toast.msg}
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink">
          Platform Governance & Configuration
        </h1>
        <p className="mt-1 text-sm text-ink-soft">
          Configure marketplace commission tiers, verification pricing, escrow timing, and security thresholds.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Financial & Fee Rules */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <DollarSign className="h-5 w-5 text-brand" />
            <h2 className="text-base font-bold text-ink">Commercial & Escrow Parameters</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold uppercase text-ink-soft mb-1.5">
                Marketplace Commission (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="15"
                  required
                  value={settings.commission_percentage}
                  onChange={(e) =>
                    setSettings((p) => ({ ...p, commission_percentage: Number(e.target.value) }))
                  }
                  className="w-full h-10 px-3 pr-8 rounded-[var(--pb-radius-sm)] border border-border bg-surface text-sm font-data font-bold text-ink focus:outline-none focus:border-brand"
                />
                <Percent className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-ink-faint pointer-events-none" />
              </div>
              <p className="text-[11px] text-ink-faint mt-1">Deducted from completed seller payouts.</p>
            </div>

            <div>
              <label className="block font-semibold uppercase text-ink-soft mb-1.5">
                Hardware Verification Fee (PKR)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="100"
                  min="500"
                  max="20000"
                  required
                  value={settings.verification_fee}
                  onChange={(e) =>
                    setSettings((p) => ({ ...p, verification_fee: Number(e.target.value) }))
                  }
                  className="w-full h-10 px-3 rounded-[var(--pb-radius-sm)] border border-border bg-surface text-sm font-data font-bold text-ink focus:outline-none focus:border-brand"
                />
              </div>
              <p className="text-[11px] text-ink-faint mt-1">Charged for 40-point diagnostics & certificate.</p>
            </div>

            <div>
              <label className="block font-semibold uppercase text-ink-soft mb-1.5">
                Escrow Hold Period (Days)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="14"
                  required
                  value={settings.escrow_hold_days}
                  onChange={(e) =>
                    setSettings((p) => ({ ...p, escrow_hold_days: Number(e.target.value) }))
                  }
                  className="w-full h-10 px-3 rounded-[var(--pb-radius-sm)] border border-border bg-surface text-sm font-data font-bold text-ink focus:outline-none focus:border-brand"
                />
              </div>
              <p className="text-[11px] text-ink-faint mt-1">Days after courier delivery before release.</p>
            </div>
          </div>
        </Card>

        {/* Automated Moderation Thresholds */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <ShieldAlert className="h-5 w-5 text-amber-600" />
            <h2 className="text-base font-bold text-ink">Fraud Prevention & Moderation Thresholds</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold uppercase text-ink-soft mb-1.5">
                Suspicious Price Under-cut Threshold (%)
              </label>
              <input
                type="number"
                min="10"
                max="80"
                required
                value={settings.auto_flag_price_variance_pct}
                onChange={(e) =>
                  setSettings((p) => ({
                    ...p,
                    auto_flag_price_variance_pct: Number(e.target.value),
                  }))
                }
                className="w-full h-10 px-3 rounded-[var(--pb-radius-sm)] border border-border bg-surface text-sm font-data font-bold text-ink focus:outline-none focus:border-brand"
              />
              <p className="text-[11px] text-ink-faint mt-1">
                Listings priced &gt; {settings.auto_flag_price_variance_pct}% below market average require manual review.
              </p>
            </div>

            <div>
              <label className="block font-semibold uppercase text-ink-soft mb-1.5">
                Minimum Seller Trust Score For Direct Listing
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="10"
                required
                value={settings.min_trust_score_for_unverified}
                onChange={(e) =>
                  setSettings((p) => ({
                    ...p,
                    min_trust_score_for_unverified: Number(e.target.value),
                  }))
                }
                className="w-full h-10 px-3 rounded-[var(--pb-radius-sm)] border border-border bg-surface text-sm font-data font-bold text-ink focus:outline-none focus:border-brand"
              />
              <p className="text-[11px] text-ink-faint mt-1">
                Sellers below this score cannot publish without mandatory hardware verification.
              </p>
            </div>
          </div>
        </Card>

        {/* Support & Contact Routing */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <Mail className="h-5 w-5 text-brand" />
            <h2 className="text-base font-bold text-ink">Operational Contacts & Alert Routing</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold uppercase text-ink-soft mb-1.5">
                Support Operations Email
              </label>
              <input
                type="email"
                required
                value={settings.contact_email}
                onChange={(e) =>
                  setSettings((p) => ({ ...p, contact_email: e.target.value }))
                }
                className="w-full h-10 px-3 rounded-[var(--pb-radius-sm)] border border-border bg-surface text-sm text-ink focus:outline-none focus:border-brand"
              />
            </div>

            <div>
              <label className="block font-semibold uppercase text-ink-soft mb-1.5">
                Official Helpline Number
              </label>
              <input
                type="text"
                required
                value={settings.contact_phone}
                onChange={(e) =>
                  setSettings((p) => ({ ...p, contact_phone: e.target.value }))
                }
                className="w-full h-10 px-3 rounded-[var(--pb-radius-sm)] border border-border bg-surface text-sm text-ink focus:outline-none focus:border-brand"
              />
            </div>
          </div>

          {/* Maintenance toggle */}
          <div className="pt-3 border-t border-border flex items-center justify-between">
            <div>
              <p className="font-bold text-ink text-xs">Emergency Maintenance Mode</p>
              <p className="text-[11px] text-ink-faint">
                Temporarily suspends public checkouts while keeping the admin console accessible.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.maintenance_mode}
                onChange={(e) =>
                  setSettings((p) => ({ ...p, maintenance_mode: e.target.checked }))
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-danger" />
            </label>
          </div>
        </Card>

        <div className="flex justify-end pt-2">
          <Button variant="primary" size="md" type="submit" loading={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            Save Configuration Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
