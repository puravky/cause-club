"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  Heart,
  Ticket,
  Trophy,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { format } from "date-fns";

/* ─── Types ────────────────────────────────── */

interface SidebarUser {
  name: string;
  email: string;
  role: string;
  subscriptionStatus: string;
  subscriptionPlan: string | null;
  charityPercentage: number;
  renewalDate: string | null;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Scores", href: "/dashboard/scores", icon: BarChart3 },
  { label: "Charity", href: "/dashboard/charity", icon: Heart },
  { label: "Draws", href: "/dashboard/draws", icon: Ticket },
  { label: "Winnings", href: "/dashboard", icon: Trophy },
];

/* ─── Status badge ─────────────────────────── */

function StatusBadge({ status }: { status: string }) {
  const isActive = status === "active" || status === "trialing";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium",
        isActive
          ? "bg-emerald-50 text-emerald-700"
          : "bg-amber-50 text-amber-700"
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          isActive ? "bg-emerald-500" : "bg-amber-500"
        )}
      />
      {status === "active"
        ? "Active"
        : status === "trialing"
        ? "Trial"
        : status || "Inactive"}
    </span>
  );
}

/* ─── Sidebar ──────────────────────────────── */

export function DashboardSidebar({ user }: { user: SidebarUser }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="flex w-64 flex-col border-r border-border bg-white">
      {/* ── Logo ─────────────────────────────── */}
      <div className="flex h-14 items-center border-b border-border px-5">
        <Link href="/" className="font-heading text-lg font-semibold text-ink">
          causeClub
        </Link>
      </div>

      {/* ── User card ────────────────────────── */}
      <div className="border-b border-border px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-ink text-sm font-medium text-white">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-ink">{user.name}</p>
            <p className="truncate text-xs text-[#6B7280]">{user.email}</p>
          </div>
        </div>
      </div>

      {/* ── Subscription info ────────────────── */}
      <div className="space-y-3 border-b border-border px-5 py-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wider text-[#6B7280]">
            Subscription
          </span>
          <StatusBadge status={user.subscriptionStatus} />
        </div>

        <div className="space-y-2">
          {user.subscriptionPlan && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#6B7280]">Plan</span>
              <span className="font-medium capitalize text-ink">
                {user.subscriptionPlan}
              </span>
            </div>
          )}

          {user.renewalDate && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#6B7280]">Renews</span>
              <span className="font-medium text-ink">
                {format(new Date(user.renewalDate), "d MMM yyyy")}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between text-sm">
            <span className="text-[#6B7280]">Charity %</span>
            <span className="font-medium text-coral">
              {user.charityPercentage}%
            </span>
          </div>
        </div>
      </div>

      {/* ── Navigation ───────────────────────── */}
      <nav className="flex-1 px-3 py-4">
        <ul className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className={cn(
                    "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-ink/[0.04] text-ink"
                      : "text-[#6B7280] hover:bg-ink/[0.03] hover:text-ink"
                  )}
                >
                  <item.icon
                    className={cn(
                      "h-4 w-4 flex-shrink-0",
                      isActive ? "text-ink" : "text-[#9CA3AF]"
                    )}
                  />
                  {item.label}
                  {isActive && (
                    <ChevronRight className="ml-auto h-3.5 w-3.5 text-[#9CA3AF]" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* ── Sign out ─────────────────────────── */}
      <div className="border-t border-border px-3 py-3">
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-[#6B7280] transition-colors hover:bg-ink/[0.03] hover:text-ink"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
