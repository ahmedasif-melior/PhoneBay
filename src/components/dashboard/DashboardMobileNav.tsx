"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  mobileNavItems,
  adminMobileNavItems,
} from "@/components/dashboard/DashboardSidebarNav";

export function DashboardMobileNav({ role }: { role?: string | null }) {
  const pathname = usePathname();
  const items = role === "ADMIN" ? adminMobileNavItems : mobileNavItems;

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-surface border-t border-border flex items-stretch pb-[env(safe-area-inset-bottom)]"
      aria-label="Dashboard"
    >
      {items.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex-1 flex flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-medium",
              active ? "text-brand" : "text-ink-faint"
            )}
          >
            <item.icon className="h-5 w-5" strokeWidth={1.9} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
