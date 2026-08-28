"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export function Tabs({
  tabs,
  active,
  onChange,
  className,
  variant = "underline",
}: {
  tabs: { id: string; label: string; count?: number }[];
  active: string;
  onChange: (id: string) => void;
  className?: string;
  variant?: "underline" | "pill";
}) {
  if (variant === "pill") {
    return (
      <div
        role="tablist"
        className={cn(
          "inline-flex items-center gap-1 rounded-[var(--pb-radius-sm)] bg-black/[0.04] p-1 overflow-x-auto no-scrollbar",
          className
        )}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={active === tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              "px-3.5 h-8 rounded-[7px] text-sm font-medium whitespace-nowrap transition-colors",
              active === tab.id
                ? "bg-surface text-ink shadow-[var(--pb-shadow-sm)]"
                : "text-ink-soft hover:text-ink"
            )}
          >
            {tab.label}
            {typeof tab.count === "number" && (
              <span className="ml-1.5 text-ink-faint">{tab.count}</span>
            )}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div
      role="tablist"
      className={cn("flex items-center gap-6 border-b border-border overflow-x-auto no-scrollbar", className)}
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={active === tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            "relative pb-3 text-sm font-medium whitespace-nowrap transition-colors",
            active === tab.id ? "text-ink" : "text-ink-faint hover:text-ink-soft"
          )}
        >
          {tab.label}
          {typeof tab.count === "number" && (
            <span className="ml-1.5 text-ink-faint">{tab.count}</span>
          )}
          {active === tab.id && (
            <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-brand rounded-full" />
          )}
        </button>
      ))}
    </div>
  );
}
