"use client";

import * as React from "react";
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
  Shield,
  Users,
  ReceiptText,
  BriefcaseBusiness,
  Plus,
  BadgeCheck,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

function isAdminRole(role?: string | null) {
  return role === "ADMIN";
}

const userItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutGrid },
  { href: "/dashboard/listings", label: "My Listings", icon: List },
  { href: "/dashboard/listings/new", label: "New Listing", icon: Plus },
  { href: "/dashboard/purchases", label: "Purchases", icon: Package },
  { href: "/dashboard/sales", label: "Sales", icon: ReceiptText },
  { href: "/dashboard/saved", label: "Saved", icon: Bookmark },
  { href: "/dashboard/messages", label: "Messages", icon: MessageSquare },
  { href: "/dashboard/verification", label: "Verification", icon: ShieldCheck },
  { href: "/dashboard/certificates", label: "Certificates", icon: FileBadge },
  { href: "/dashboard/passport", label: "Device Passport", icon: BookOpenCheck },
];

const adminItems = [
  { href: "/admin", label: "Admin Overview", icon: Shield },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/sellers", label: "Sellers", icon: ReceiptText },
  { href: "/admin/shops", label: "Shops", icon: BriefcaseBusiness },
  { href: "/admin/listings", label: "Listings", icon: List },
  { href: "/admin/orders", label: "Orders", icon: ReceiptText },
  { href: "/admin/verification-requests", label: "Verification", icon: BadgeCheck },
  { href: "/admin/reports", label: "Reports", icon: TrendingUp },
  { href: "/admin/disputes", label: "Disputes", icon: MessageSquare },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

const bottomItems = [
  { href: "/dashboard/profile", label: "Profile", icon: LayoutGrid },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function DashboardSidebarNav({ role }: { role?: string | null }) {
  const pathname = usePathname();
  const [activeHash, setActiveHash] = React.useState("");
  const isAdmin = isAdminRole(role);
  const items = isAdmin ? adminItems : userItems;

  React.useEffect(() => {
    const syncHash = () => setActiveHash(window.location.hash);
    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, []);

  const isActive = (href: string) => {
    const [targetPath, hash] = href.split("#");
    const expectedHash = hash ? `#${hash}` : "";
    if (pathname !== targetPath) return false;
    if (!hash) return activeHash === "" || activeHash === "#overview";
    return activeHash === expectedHash;
  };

  return (
    <nav className="flex flex-col gap-1" aria-label="Dashboard">
      {items.map((item) => (
        <SidebarLink key={item.href} item={item} active={isActive(item.href)} />
      ))}
      {!isAdmin && (
        <>
          <div className="my-2 h-px bg-border" />
          {bottomItems.map((item) => (
            <SidebarLink key={item.href} item={item} active={pathname === item.href} />
          ))}
        </>
      )}
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
  { href: "/dashboard/purchases", label: "Purchases", icon: Package },
  { href: "/dashboard/sales", label: "Sales", icon: ReceiptText },
  { href: "/dashboard/messages", label: "Messages", icon: MessageSquare },
  { href: "/dashboard/profile", label: "Profile", icon: Settings },
];

export const adminMobileNavItems = [
  { href: "/admin", label: "Overview", icon: Shield },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/listings", label: "Listings", icon: List },
  { href: "/admin/orders", label: "Orders", icon: ReceiptText },
  { href: "/admin/shops", label: "Shops", icon: BriefcaseBusiness },
  { href: "/admin/reports", label: "Reports", icon: TrendingUp },
];
