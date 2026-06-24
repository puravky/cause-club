"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  ShieldAlert,
  LayoutDashboard,
  Users,
  Heart,
  Calendar,
  Trophy,
  BarChart3,
  Settings,
} from "lucide-react";

interface AdminSidebarProps {
  adminName: string;
  adminEmail: string;
}

const NAV = [
  { href: "/admin", label: "Metrics Overview", icon: ShieldAlert },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/charities", label: "Charities", icon: Heart },
  { href: "/admin/draws", label: "Draws", icon: Calendar },
  { href: "/admin/winners", label: "Winners", icon: Trophy },
  { href: "/admin/reports", label: "Reports", icon: BarChart3 },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminSidebar({ adminName, adminEmail }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="flex w-64 flex-col border-r border-border bg-white">
      <div className="flex h-14 items-center border-b border-border px-5 gap-2">
        <ShieldAlert className="h-5 w-5 text-coral" />
        <span className="font-heading text-base font-semibold text-ink">
          causeClub Admin
        </span>
      </div>

      <div className="border-b border-border px-5 py-4">
        <p className="truncate text-sm font-medium text-ink">{adminName}</p>
        <p className="truncate text-xs text-[#6B7280]">{adminEmail}</p>
        <span className="mt-1.5 inline-flex items-center rounded-full bg-coral/10 px-2 py-0.5 text-2xs font-semibold text-coral">
          Administrator
        </span>
      </div>

      <nav className="flex-1 px-3 py-4">
        <ul className="space-y-1">
          {NAV.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-ink/[0.03] hover:text-ink border-l-2 ${
                    isActive
                      ? "border-coral bg-ink/[0.03] text-ink"
                      : "border-transparent text-[#6B7280]"
                  }`}
                >
                  <item.icon className={`h-4 w-4 ${isActive ? "text-coral" : "text-[#9CA3AF]"}`} />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-border px-3 py-3">
        <Link
          href="/dashboard"
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-[#6B7280] transition-colors hover:bg-ink/[0.03] hover:text-ink"
        >
          <LayoutDashboard className="h-4 w-4 text-[#9CA3AF]" />
          User Dashboard
        </Link>
      </div>
    </aside>
  );
}
