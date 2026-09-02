"use client";

import * as React from "react";
import { CheckCircle2, Gauge, Sparkles, ShieldCheck, Wrench } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge, TestStatusBadge } from "@/components/ui/Badge";

const initialChecklist = [
  { label: "Display", status: "pass" },
  { label: "Touch", status: "pass" },
  { label: "Face ID", status: "testing" },
  { label: "Camera", status: "pending" },
  { label: "Front Camera", status: "pass" },
  { label: "Speaker", status: "pass" },
  { label: "Microphone", status: "pass" },
  { label: "Charging", status: "testing" },
  { label: "Wi‑Fi", status: "pass" },
  { label: "Bluetooth", status: "pass" },
  { label: "GPS", status: "pass" },
  { label: "Sensors", status: "pending" },
  { label: "Buttons", status: "pass" },
] as const;

const statusOrder = ["pending", "testing", "pass", "fail"] as const;

type ChecklistItem = {
  label: string;
  status: (typeof statusOrder)[number];
};

export function TestingWorkbench() {
  const [items, setItems] = React.useState<ChecklistItem[]>(
    initialChecklist.map((item) => ({ label: item.label, status: item.status }))
  );
  const [generated, setGenerated] = React.useState(false);

  const advance = (label: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.label !== label) return item;
        const idx = statusOrder.indexOf(item.status);
        const next = statusOrder[(idx + 1) % statusOrder.length];
        return { ...item, status: next };
      })
    );
  };

  const score = React.useMemo(() => {
    const total = items.length;
    let points = 0;
    items.forEach((item) => {
      if (item.status === "pass") points += 1;
      if (item.status === "fail") points += 0;
      if (item.status === "testing") points += 0.5;
    });
    return (points / total) * 10;
  }, [items]);

  const batteryHealth = 91;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-5">
          <p className="text-sm text-ink-faint">Overall Score</p>
          <div className="mt-3 flex items-end gap-2">
            <span className="font-display text-4xl font-semibold text-ink">{score.toFixed(1)}</span>
            <span className="text-sm text-ink-faint">/ 10</span>
          </div>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-ink-faint">Battery Health</p>
          <div className="mt-3 flex items-end gap-2">
            <span className="font-display text-4xl font-semibold text-ink">{batteryHealth}</span>
            <span className="text-sm text-ink-faint">%</span>
          </div>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-ink-faint">Technician</p>
          <div className="mt-3 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-brand" />
            <span className="font-medium text-ink">Ali Hassan</span>
          </div>
        </Card>
      </div>

      <Card className="p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3 mb-5">
          <div>
            <p className="text-sm text-ink-faint">Device</p>
            <h2 className="text-xl font-semibold text-ink">iPhone 15 Pro</h2>
          </div>
          <div className="flex items-center gap-2">
            <Badge tone="brand" icon={<Wrench className="h-3 w-3" />}>Live Testing</Badge>
          </div>
        </div>

        <div className="grid gap-3">
          {items.map((item) => (
            <button
              type="button"
              key={item.label}
              onClick={() => advance(item.label)}
              className="w-full flex items-center justify-between rounded-[var(--pb-radius-sm)] border border-border bg-bg px-4 py-3 text-left transition hover:border-border-strong"
            >
              <span className="font-medium text-ink">{item.label}</span>
              <TestStatusBadge status={item.status} />
            </button>
          ))}
        </div>
      </Card>

      <Card className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm text-ink-faint">Technician Notes</p>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">
              Device passes visual inspection and all core functionality checks. Charge port shows
              minor wear but remains stable. Camera system is aligned and no liquid damage reported.
            </p>
          </div>
          <Gauge className="h-5 w-5 text-brand" />
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <Button onClick={() => setGenerated(true)}>
            <Sparkles className="h-4 w-4" /> Generate Certificate
          </Button>
          <Button variant="outline">Save Draft</Button>
        </div>

        {generated && (
          <div className="mt-5 rounded-[var(--pb-radius-sm)] border border-verify/30 bg-verify-tint p-3 text-sm text-verify-dark">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Certificate generated successfully for PB-829182.
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
