"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  List,
  Bookmark,
  MessageSquare,
  Package,
  ShieldCheck,
  FileBadge,
  BookOpenCheck,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/dashboard", label: "Overview", icon: LayoutGrid },
  { href: "/dashboard/listings", label: "My Listings", icon: List },
  { href: "/dashboard/saved", label: "Saved", icon: Bookmark },
  { href: "/dashboard/messages", label: "Messages", icon: MessageSquare },
  { href: "/dashboard/orders", label: "Orders", icon: Package },
  { href: "/dashboard/verification", label: "Verification", icon: ShieldCheck },
  { href: "/dashboard/certificates", label: "Certificates", icon: FileBadge },
  { href: "/dashboard/passport", label: "Device Passport", icon: BookOpenCheck },
];

const bottomItems = [
  { href: "/dashboard/profile", label: "Profile", icon: LayoutGrid },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function DashboardSidebarNav() {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-1" aria-label="Dashboard">
      {items.map((item) => (
        <SidebarLink key={item.href} item={item} active={pathname === item.href} />
      ))}
      <div className="my-2 h-px bg-border" />
      {bottomItems.map((item) => (
        <SidebarLink key={item.href} item={item} active={pathname === item.href} />
      ))}
    </nav>
  );
}

function SidebarLink({
  item,
  active,
}: {
  item: { href: string; label: string; icon: React.ElementType };
  active: boolean;
}) {
  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 px-3.5 py-2.5 rounded-[var(--pb-radius-sm)] text-sm font-medium transition-colors",
        active ? "bg-brand-tint text-brand-dark" : "text-ink-soft hover:bg-black/[0.03] hover:text-ink"
      )}
    >
      <item.icon className="h-4.5 w-4.5" strokeWidth={1.9} />
      {item.label}
    </Link>
  );
}

export const mobileNavItems = [
  { href: "/dashboard", label: "Home", icon: LayoutGrid },
  { href: "/dashboard/listings", label: "Listings", icon: List },
  { href: "/dashboard/messages", label: "Messages", icon: MessageSquare },
  { href: "/dashboard/orders", label: "Orders", icon: Package },
  { href: "/dashboard/profile", label: "Profile", icon: Settings },
];
