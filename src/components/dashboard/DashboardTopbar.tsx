import Link from "next/link";
import { Bell } from "lucide-react";
import { Logo } from "@/components/navigation/Logo";
import { Avatar } from "@/components/ui/Avatar";
import { Dropdown, DropdownItem } from "@/components/ui/Dropdown";
import { User, Settings, LogOut } from "lucide-react";

export function DashboardTopbar({ userName = "Ahmed Bin Asif" }: { userName?: string }) {
  return (
    <header className="sticky top-0 z-30 bg-surface/90 backdrop-blur border-b border-border h-16 flex items-center">
      <div className="flex items-center justify-between w-full px-4 lg:px-6">
        <Link href="/" className="lg:hidden">
          <Logo />
        </Link>
        <span className="hidden lg:block text-sm text-ink-faint">
          Welcome back, <span className="text-ink font-medium">{userName.split(" ")[0]}</span>
        </span>
        <div className="flex items-center gap-3 ml-auto">
          <button
            aria-label="Notifications"
            className="relative h-10 w-10 rounded-full flex items-center justify-center hover:bg-black/4"
          >
            <Bell className="h-5 w-5 text-ink-soft" />
            <span className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-danger" />
          </button>
          <Dropdown
            align="right"
            trigger={<Avatar name={userName} size="sm" className="cursor-pointer" />}
          >
            <DropdownItem href="/dashboard/profile" icon={<User className="h-4 w-4" />}>
              My Profile
            </DropdownItem>
            <DropdownItem href="/dashboard/settings" icon={<Settings className="h-4 w-4" />}>
              Settings
            </DropdownItem>
            <DropdownItem href="/" danger icon={<LogOut className="h-4 w-4" />}>
              Sign Out
            </DropdownItem>
          </Dropdown>
        </div>
      </div>
    </header>
  );
}
