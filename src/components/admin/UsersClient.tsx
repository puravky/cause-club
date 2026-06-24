"use client";

import { useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Search,
  Eye,
  Shield,
  Download,
  XCircle,
  Trophy,
  Heart,
  Target,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  cancelStripeSubscription,
  createAdminSession,
  exportUsersCSV,
} from "@/app/(admin)/admin/users/actions";

interface UserRow {
  id: string;
  email: string;
  name: string | null;
  role: string;
  subscription_status: string | null;
  charity_name: string | null;
  total_donated: number;
  created_at: string;
}

interface UsersClientProps {
  initialUsers: UserRow[];
}

function StatusBadge({ status }: { status: string | null }) {
  const colors: Record<string, string> = {
    active: "bg-emerald-50 text-emerald-700",
    trialing: "bg-sky-50 text-sky-700",
    canceled: "bg-rose-50 text-rose-700",
    incomplete: "bg-amber-50 text-amber-700",
    past_due: "bg-orange-50 text-orange-700",
  };
  const cls = colors[status || ""] || "bg-slate-50 text-[#6B7280]";
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-3xs font-semibold ${cls}`}>
      {status || "inactive"}
    </span>
  );
}

interface DrawResultRecord {
  id: string;
  match_type: number;
  prize_amount: number;
  payout_status: string;
  draw: { month: number; year: number } | null;
}

interface DonationRecord {
  id: string;
  amount: number;
  charity: { name: string } | null;
  created_at: string | null;
}

interface UserDetailData {
  scores: { id: string; score: number; date: string }[];
  winnings: { id: string; match_type: number; prize_amount: number; payout_status: string; draw_month: number; draw_year: number }[];
  donations: { id: string; amount: number; charity_name: string | null; created_at: string }[];
}

export function UsersClient({ initialUsers }: UsersClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [userDetails, setUserDetails] = useState<UserDetailData | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [impersonatingId, setImpersonatingId] = useState<string | null>(null);

  const supabase = createClient();

  const filteredUsers = initialUsers.filter((u) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      u.email.toLowerCase().includes(q) ||
      (u.name && u.name.toLowerCase().includes(q));
    const matchesStatus =
      statusFilter === "all" || u.subscription_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleView = useCallback(async (user: UserRow) => {
    setLoadingDetails(true);
    setUserDetails(null);

    const [scoresRes, winningsRes, donationsRes] = await Promise.all([
      supabase.from("scores").select("id, score, date").eq("user_id", user.id).order("date", { ascending: false }).limit(20),
      supabase.from("draw_results").select("id, match_type, prize_amount, payout_status, draw:draws!inner(month, year)").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20),
      supabase.from("donations").select("id, amount, charity:charities(name), created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20),
    ]);

    const winnings = (winningsRes.data as unknown as DrawResultRecord[] | null) || [];
    const donations = (donationsRes.data as unknown as DonationRecord[] | null) || [];

    setUserDetails({
      scores: scoresRes.data || [],
      winnings: winnings.map((w) => ({
        id: w.id,
        match_type: w.match_type,
        prize_amount: w.prize_amount,
        payout_status: w.payout_status,
        draw_month: w.draw?.month ?? 0,
        draw_year: w.draw?.year ?? 0,
      })),
      donations: donations.map((d) => ({
        id: d.id,
        amount: d.amount,
        charity_name: d.charity?.name || null,
        created_at: d.created_at || "",
      })),
    });
    setLoadingDetails(false);
  }, [supabase]);

  const handleCancelSubscription = useCallback(async (userId: string) => {
    setCancellingId(userId);
    const result = await cancelStripeSubscription(userId);
    setCancellingId(null);
    if (result.success) {
      toast.success("Subscription cancelled successfully");
    } else {
      toast.error(result.error || "Failed to cancel subscription");
    }
  }, []);

  const handleImpersonate = useCallback(async (userId: string) => {
    setImpersonatingId(userId);
    const result = await createAdminSession(userId);
    setImpersonatingId(null);
    if (result.success && result.session) {
      const url = `/dashboard?session_token=${result.session.access_token}`;
      window.open(url, "_blank");
      toast.success("Impersonation session created");
    } else {
      toast.error(result.error || "Failed to create impersonation session");
    }
  }, []);

  const handleExportCSV = useCallback(async () => {
    const result = await exportUsersCSV();
    if (result.success && result.csv) {
      const blob = new Blob([result.csv], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `users-export-${new Date().toISOString().split("T")[0]}.csv`;
      link.click();
      URL.revokeObjectURL(link.href);
      toast.success("Users exported successfully");
    } else {
      toast.error(result.error || "Failed to export users");
    }
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-semibold tracking-tight text-ink">User Management</h1>
        <p className="mt-1.5 text-sm text-[#6B7280]">
          View, search, and manage registered users, their subscriptions, and support access.
        </p>
      </div>

      <Card className="rounded-2xl border border-border bg-white shadow-sm">
        <CardHeader className="pb-3 flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div>
            <CardTitle className="font-heading text-lg font-semibold text-ink">causeClub Profiles</CardTitle>
            <CardDescription>
              {filteredUsers.length} of {initialUsers.length} accounts found.
            </CardDescription>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative w-full max-w-sm">
              <Input
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 text-sm"
              />
              <Search className="absolute left-3 top-3 h-4 w-4 text-[#9CA3AF]" />
            </div>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 w-40 text-sm"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="trialing">Trialing</option>
              <option value="canceled">Canceled</option>
              <option value="incomplete">Incomplete</option>
            </Select>
            <Button variant="outline" size="sm" className="gap-2" onClick={handleExportCSV}>
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {filteredUsers.length === 0 ? (
            <p className="text-sm text-[#6B7280] py-8 text-center">No users match your query.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="pb-3 font-semibold text-[#6B7280] text-xs uppercase tracking-wider">User Details</th>
                    <th className="pb-3 font-semibold text-[#6B7280] text-xs uppercase tracking-wider">Subscription</th>
                    <th className="pb-3 font-semibold text-[#6B7280] text-xs uppercase tracking-wider">Charity</th>
                    <th className="pb-3 font-semibold text-[#6B7280] text-xs uppercase tracking-wider">Total Donated</th>
                    <th className="pb-3 font-semibold text-[#6B7280] text-xs uppercase tracking-wider">Joined</th>
                    <th className="pb-3 font-semibold text-[#6B7280] text-xs uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredUsers.map((u) => (
                    <tr key={u.id}>
                      <td className="py-4">
                        <div className="font-medium text-ink truncate max-w-[200px]">{u.name || "No name"}</div>
                        <div className="text-xs text-[#6B7280] truncate max-w-[200px]">{u.email}</div>
                      </td>
                      <td className="py-4 pr-4">
                        <StatusBadge status={u.subscription_status} />
                      </td>
                      <td className="py-4 text-xs text-[#6B7280] max-w-[160px] truncate">
                        {u.charity_name || "—"}
                      </td>
                      <td className="py-4 text-xs text-ink font-medium">
                        £{u.total_donated.toFixed(2)}
                      </td>
                      <td className="py-4 text-xs text-[#9CA3AF] whitespace-nowrap">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-1.5">
                          <Sheet>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2 text-xs gap-1"
                              onClick={() => handleView(u)}
                            >
                              <Eye className="h-3.5 w-3.5" />
                              View
                            </Button>
                            <SheetContent>
                              <SheetHeader>
                                <SheetTitle>{u.name || "User"}</SheetTitle>
                                <SheetDescription>{u.email}</SheetDescription>
                              </SheetHeader>
                              <div className="mt-6 space-y-6">
                                {loadingDetails ? (
                                  <div className="flex items-center justify-center py-12">
                                    <Loader2 className="h-6 w-6 animate-spin text-[#9CA3AF]" />
                                  </div>
                                ) : userDetails ? (
                                  <>
                                    <div>
                                      <h4 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#6B7280] mb-3">
                                        <Target className="h-3.5 w-3.5" />
                                        Recent Scores
                                      </h4>
                                      {userDetails.scores.length === 0 ? (
                                        <p className="text-xs text-[#9CA3AF]">No scores recorded.</p>
                                      ) : (
                                        <div className="space-y-1.5">
                                          {userDetails.scores.map((s) => (
                                            <div key={s.id} className="flex items-center justify-between rounded-lg bg-paper px-3 py-2">
                                              <span className="text-xs text-ink font-medium">{s.score}</span>
                                              <span className="text-2xs text-[#9CA3AF]">{new Date(s.date).toLocaleDateString()}</span>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>

                                    <div>
                                      <h4 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#6B7280] mb-3">
                                        <Trophy className="h-3.5 w-3.5" />
                                        Winnings
                                      </h4>
                                      {userDetails.winnings.length === 0 ? (
                                        <p className="text-xs text-[#9CA3AF]">No winnings recorded.</p>
                                      ) : (
                                        <div className="space-y-1.5">
                                          {userDetails.winnings.map((w) => (
                                            <div key={w.id} className="flex items-center justify-between rounded-lg bg-paper px-3 py-2">
                                              <div>
                                                <span className="text-xs text-ink font-medium">{w.match_type}-match</span>
                                                <span className="text-2xs text-[#9CA3AF] ml-2">
                                                  {w.draw_month}/{w.draw_year}
                                                </span>
                                              </div>
                                              <div className="flex items-center gap-2">
                                                <span className="text-xs font-semibold text-emerald-700">£{Number(w.prize_amount).toFixed(2)}</span>
                                                <StatusBadge status={w.payout_status} />
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>

                                    <div>
                                      <h4 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#6B7280] mb-3">
                                        <Heart className="h-3.5 w-3.5" />
                                        Donations
                                      </h4>
                                      {userDetails.donations.length === 0 ? (
                                        <p className="text-xs text-[#9CA3AF]">No donations made.</p>
                                      ) : (
                                        <div className="space-y-1.5">
                                          {userDetails.donations.map((d) => (
                                            <div key={d.id} className="flex items-center justify-between rounded-lg bg-paper px-3 py-2">
                                              <div>
                                                <span className="text-xs text-ink font-medium">£{Number(d.amount).toFixed(2)}</span>
                                                {d.charity_name && (
                                                  <span className="text-2xs text-[#9CA3AF] ml-2">to {d.charity_name}</span>
                                                )}
                                              </div>
                                              <span className="text-2xs text-[#9CA3AF]">
                                                {new Date(d.created_at || "").toLocaleDateString()}
                                              </span>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  </>
                                ) : null}
                              </div>
                            </SheetContent>
                          </Sheet>

                          {process.env.NODE_ENV === "development" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2 text-xs gap-1"
                              disabled={impersonatingId === u.id}
                              onClick={() => handleImpersonate(u.id)}
                            >
                              {impersonatingId === u.id ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Shield className="h-3.5 w-3.5" />
                              )}
                              Impersonate
                            </Button>
                          )}

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2 text-xs gap-1 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                                disabled={!u.subscription_status || u.subscription_status === "inactive" || u.subscription_status === "canceled"}
                              >
                                <XCircle className="h-3.5 w-3.5" />
                                Cancel
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Cancel Subscription</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will immediately cancel {u.name || u.email}&apos;s Stripe subscription. This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
                                <AlertDialogAction
                                  variant="destructive"
                                  disabled={cancellingId === u.id}
                                  onClick={() => handleCancelSubscription(u.id)}
                                >
                                  {cancellingId === u.id ? "Cancelling..." : "Yes, Cancel"}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
