"use client";

import { useEffect } from "react";
import { Ticket, Trophy, Heart, ArrowUpRight, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { toast } from "sonner";

interface Draw {
  id: string;
  month: number;
  year: number;
  draw_type: string;
  status: string;
  drawn_numbers: number[] | null;
  jackpot_amount: number;
  created_at: string;
}

interface DrawResultWithDraw {
  id: string;
  draw_id: string;
  match_type: number;
  prize_amount: number;
  verification_status: string;
  payout_status: string;
  proof_url: string | null;
  created_at: string;
  draws: Draw | null;
}

interface UserCharity {
  name: string;
  percentage: number;
}

interface DashboardClientProps {
  recentDraws: Draw[];
  winnings: DrawResultWithDraw[];
  charity: UserCharity | null;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export function DashboardClient({ recentDraws, winnings, charity }: DashboardClientProps) {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("checkout_success") === "true") {
      toast.success("Subscription successful! Welcome to causeClub.");
    }
  }, []);

  // 1. Calculate stats
  const totalWon = winnings
    .filter((w) => w.payout_status === "paid")
    .reduce((acc, curr) => acc + Number(curr.prize_amount), 0);

  const activeDraw = recentDraws.find((d) => d.status === "draft" || d.status === "simulated") || recentDraws[0];
  const pastDraws = recentDraws.filter((d) => d.status === "published");

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-3xl font-semibold tracking-tight text-ink">Dashboard</h1>
          <p className="mt-1.5 text-sm text-[#6B7280]">
            Overview of upcoming draws, recent winnings, and your charitable splits.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard/scores">
            <Button className="btn-secondary h-9 px-4 text-xs font-semibold">
              Log Round
            </Button>
          </Link>
          <Link href="/dashboard/charity">
            <Button className="btn-accent h-9 px-4 text-xs font-semibold">
              Manage Splits
            </Button>
          </Link>
        </div>
      </div>

      {/* Grid of Summary Metrics */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Next Draw Card */}
        <Card className="rounded-2xl border border-border bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-[#6B7280] flex items-center gap-1.5">
              <Ticket className="h-3.5 w-3.5" />
              Next Monthly Draw
            </CardDescription>
          </CardHeader>
          <CardContent>
            {activeDraw ? (
              <div className="space-y-1.5">
                <span className="font-heading text-2xl font-bold text-ink">
                  {MONTHS[activeDraw.month - 1]} {activeDraw.year}
                </span>
                <div className="flex items-center justify-between text-sm pt-2 border-t border-border mt-2">
                  <span className="text-[#6B7280]">Est. Jackpot</span>
                  <span className="font-semibold text-coral">£{Number(activeDraw.jackpot_amount).toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-[#9CA3AF]">
                  <span>Status</span>
                  <span className="capitalize font-medium text-[#6B7280]">{activeDraw.status}</span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-[#6B7280]">No active draws planned.</p>
            )}
          </CardContent>
        </Card>

        {/* Total Winnings Card */}
        <Card className="rounded-2xl border border-border bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-[#6B7280] flex items-center gap-1.5">
              <Trophy className="h-3.5 w-3.5" />
              Total Winnings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-1.5">
              <span className="font-heading text-3xl font-bold text-ink">
                £{totalWon.toFixed(2)}
              </span>
              <div className="flex items-center justify-between text-sm pt-2 border-t border-border mt-2">
                <span className="text-[#6B7280]">Prizes Claimed</span>
                <span className="font-semibold text-ink">{winnings.length}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-[#9CA3AF]">
                <span>Status</span>
                <span className="font-medium text-[#6B7280]">All verified</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Selected Charity Card */}
        <Card className="rounded-2xl border border-border bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-[#6B7280] flex items-center gap-1.5">
              <Heart className="h-3.5 w-3.5" />
              Active Charity Split
            </CardDescription>
          </CardHeader>
          <CardContent>
            {charity ? (
              <div className="space-y-1.5">
                <span className="font-heading text-lg font-bold text-ink truncate block">
                  {charity.name}
                </span>
                <div className="flex items-center justify-between text-sm pt-2 border-t border-border mt-2">
                  <span className="text-[#6B7280]">Split Percentage</span>
                  <span className="font-semibold text-coral">{charity.percentage}%</span>
                </div>
                <div className="flex items-center justify-between text-xs text-[#9CA3AF]">
                  <span>Est. Monthly split</span>
                  <span className="font-medium text-[#6B7280]">£{(9.99 * (charity.percentage / 100)).toFixed(2)}</span>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-[#6B7280]">No charity selected. Setup your split allocation now.</p>
                <Link href="/dashboard/charity" className="text-xs font-semibold text-coral flex items-center gap-1 hover:underline">
                  Choose Charity <ArrowUpRight className="h-3 w-3" />
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Main Content Area */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Draw Winnings Table (Left & Center) */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="rounded-2xl border border-border bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="font-heading text-lg font-semibold text-ink">Draw Results & Winnings</CardTitle>
              <CardDescription>
                Prizes earned by matching winning draw numbers with your scores.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {winnings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-border text-muted">
                    <Trophy className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-sm font-semibold text-ink">No winnings logged</h3>
                  <p className="mt-1 text-xs text-[#6B7280] max-w-xs">
                    Prizes will populate here when winning numbers match your registered stableford scores.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="pb-3 font-semibold text-[#6B7280] text-xs uppercase tracking-wider">Draw</th>
                        <th className="pb-3 font-semibold text-[#6B7280] text-xs uppercase tracking-wider">Match Tier</th>
                        <th className="pb-3 font-semibold text-[#6B7280] text-xs uppercase tracking-wider">Amount</th>
                        <th className="pb-3 font-semibold text-[#6B7280] text-xs uppercase tracking-wider">Payout Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {winnings.map((win) => (
                        <tr key={win.id}>
                          <td className="py-3.5 font-medium text-ink">
                            {win.draws ? `${MONTHS[win.draws.month - 1]} ${win.draws.year}` : "Unknown draw"}
                          </td>
                          <td className="py-3.5 text-[#6B7280]">
                            Matched {win.match_type} numbers
                          </td>
                          <td className="py-3.5 font-semibold text-ink">
                            £{Number(win.prize_amount).toFixed(2)}
                          </td>
                          <td className="py-3.5">
                            {win.payout_status === "paid" ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-2xs font-semibold text-emerald-700">
                                <CheckCircle2 className="h-3 w-3" /> Paid
                              </span>
                            ) : win.verification_status === "pending" ? (
                              <Link href={`/dashboard/draws/${win.draw_id}/claim`} className="inline-flex items-center gap-1 rounded-full bg-coral px-2 py-0.5 text-2xs font-semibold text-white hover:bg-coral/90 transition-colors">
                                <ArrowUpRight className="h-3 w-3" /> Claim Prize
                              </Link>
                            ) : win.verification_status === "rejected" ? (
                              <Link href={`/dashboard/draws/${win.draw_id}/claim`} className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-2xs font-semibold text-red-700 hover:bg-red-100 transition-colors">
                                <AlertCircle className="h-3 w-3" /> Rejected
                              </Link>
                            ) : win.verification_status === "submitted" ? (
                              <Link href={`/dashboard/draws/${win.draw_id}/claim`} className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-2xs font-semibold text-amber-700 hover:bg-amber-100 transition-colors">
                                <Clock className="h-3 w-3" /> Under Review
                              </Link>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2 py-0.5 text-2xs font-semibold text-[#6B7280]">
                                <AlertCircle className="h-3 w-3" /> Processing
                              </span>
                            )}
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

        {/* Past Draw Numbers (Right) */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="rounded-2xl border border-border bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="font-heading text-lg font-semibold text-ink">Recent Draws</CardTitle>
              <CardDescription>Winning numbers for past draws.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {pastDraws.length === 0 ? (
                <p className="text-xs text-[#6B7280] py-4 text-center">No draws have been finalized yet.</p>
              ) : (
                pastDraws.map((d) => (
                  <div key={d.id} className="border-b border-border pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between text-xs font-semibold text-[#6B7280] mb-2">
                      <span>{MONTHS[d.month - 1]} {d.year}</span>
                      <span>Jackpot: £{Number(d.jackpot_amount).toLocaleString()}</span>
                    </div>
                    {d.drawn_numbers && d.drawn_numbers.length > 0 ? (
                      <div className="flex items-center gap-2">
                        {d.drawn_numbers.map((num, i) => (
                          <div
                            key={i}
                            className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-paper text-xs font-bold text-ink"
                          >
                            {num}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-2xs text-[#9CA3AF]">Draw details currently unavailable.</p>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
