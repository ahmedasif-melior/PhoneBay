import Link from "next/link";
import { redirect } from "next/navigation";
import { Logo } from "@/components/navigation/Logo";
import { getCurrentUser } from "@/server/http";
import { DashboardSidebarNav } from "@/components/dashboard/DashboardSidebarNav";
import { DashboardTopbar } from "@/components/dashboard/DashboardTopbar";
import { DashboardMobileNav } from "@/components/dashboard/DashboardMobileNav";

// Previously, shop pages had no shared layout and no auth guard at all —
// each was reachable directly even by a signed-out visitor. This adds the
// guard once instead of repeating it per page (see (dashboard)/dashboard/layout.tsx
// for the equivalent pattern on the user side).
export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/shop/sign-in");
  if (user.role !== "SHOP") redirect("/dashboard");

  return (
   <div className="min-h-screen flex">
      <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r border-border bg-surface h-screen sticky top-0">
        <div className="h-16 flex items-center px-6 border-b border-border">
          <Link href="/">
            <Logo />
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <DashboardSidebarNav role={user.role} />
        </div>
      </aside>
      <div className="flex-1 min-w-0 flex flex-col">
        <DashboardTopbar userName={user.fullName} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8">{children}</main>
      </div>
      <DashboardMobileNav role={user.role} />
    </div>
  );
}
