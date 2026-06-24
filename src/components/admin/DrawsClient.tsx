"use client";

import { useState, useEffect } from "react";
import { m, AnimatePresence } from "framer-motion";
import {
  RefreshCw,
  Eye,
  Check,
  AlertCircle,
  PlayCircle,
  Search,
  Trophy,
  Coins,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
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
import { cn } from "@/lib/utils";
import { calculatePrizePool, simulateDraw, publishDraw } from "@/app/(admin)/admin/draws/actions";

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

interface DrawsClientProps {
  initialDraws: Draw[];
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
} as const;

const itemVariants = {
  hidden: { scale: 0, opacity: 0 },
  show: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 260,
      damping: 20,
    },
  },
} as const;

export function DrawsClient({ initialDraws }: DrawsClientProps) {
  const [draws, setDraws] = useState<Draw[]>(initialDraws);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [drawType, setDrawType] = useState<"random" | "algorithm_most" | "algorithm_least">("random");

  // Dynamic prize pool preview state
  const [poolPreview, setPoolPreview] = useState<{
    total: number;
    tier5: number;
    tier4: number;
    tier3: number;
    jackpotCarry: number;
    basePool: number;
  } | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

  // Simulation states
  const [isSimulating, setIsSimulating] = useState(false);
  const [simResults, setSimResults] = useState<{
    draw: {
      id: string;
      month: number;
      year: number;
      draw_type: string;
      status: string;
      drawn_numbers: number[];
      jackpot_amount: number;
    };
    prizePool: {
      total: number;
      tier3: number;
      tier4: number;
      tier5: number;
      jackpotCarry: number;
    };
    winners: Array<{
      id: string;
      match_type: number;
      prize_amount: number;
      email: string;
      name: string;
      scores: number[];
    }>;
  } | null>(null);

  // Table search
  const [searchQuery, setSearchQuery] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);
  const [isPublishOpen, setIsPublishOpen] = useState(false);

  useEffect(() => {
    async function fetchPreview() {
      setLoadingPreview(true);
      try {
        const res = await calculatePrizePool(month, year);
        setPoolPreview(res);
      } catch (err) {
        console.error(err);
        toast.error("Failed to estimate prize pool for selected month.");
      } finally {
        setLoadingPreview(false);
      }
    }
    fetchPreview();
  }, [month, year]);

  // Handler to run simulate
  async function handleSimulate(e: React.FormEvent) {
    e.preventDefault();
    setIsSimulating(true);
    setSimResults(null);

    try {
      const res = await simulateDraw({ month, year, drawType });
      if (res.success && res.draw && res.prizePool && res.winners) {
        toast.success("Simulation complete! Results calculated.");
        setSimResults({
          draw: {
            id: res.draw.id,
            month: res.draw.month,
            year: res.draw.year,
            draw_type: res.draw.draw_type,
            status: res.draw.status,
            drawn_numbers: res.draw.drawn_numbers,
            jackpot_amount: res.draw.jackpot_amount,
          },
          prizePool: res.prizePool,
          winners: res.winners,
        });

        // Add or update the draw in history list
        setDraws((prev) => {
          const filtered = prev.filter((d) => !(d.month === month && d.year === year));
          const newDrawItem: Draw = {
            id: res.draw!.id,
            month: res.draw!.month,
            year: res.draw!.year,
            draw_type: res.draw!.draw_type,
            status: res.draw!.status,
            drawn_numbers: res.draw!.drawn_numbers,
            jackpot_amount: res.draw!.jackpot_amount,
            created_at: new Date().toISOString(),
          };
          return [newDrawItem, ...filtered];
        });
      } else {
        toast.error(res.error || "Simulation failed");
      }
    } catch (err: unknown) {
      console.error(err);
      const errMsg = err instanceof Error ? err.message : "An unexpected error occurred during simulation.";
      toast.error(errMsg);
    } finally {
      setIsSimulating(false);
    }
  }

  // Handler to publish
  async function handlePublish() {
    if (!simResults?.draw.id) return;
    setIsPublishing(true);

    try {
      const res = await publishDraw(simResults.draw.id);
      if (res.success) {
        toast.success("Draw results published! Users have been notified.");
        setIsPublishOpen(false);

        // Update list status to published
        setDraws((prev) =>
          prev.map((d) => (d.id === simResults.draw.id ? { ...d, status: "published" } : d))
        );

        // Update active simulation status to published
        setSimResults((prev) =>
          prev ? { ...prev, draw: { ...prev.draw, status: "published" } } : null
        );
      } else {
        toast.error(res.error || "Failed to publish draw");
      }
    } catch (err: unknown) {
      console.error(err);
      const errMsg = err instanceof Error ? err.message : "An unexpected error occurred during publish.";
      toast.error(errMsg);
    } finally {
      setIsPublishing(false);
    }
  }

  // Group simulation winners by tier
  const simWinnersTier3 = simResults?.winners.filter((w) => w.match_type === 3) || [];
  const simWinnersTier4 = simResults?.winners.filter((w) => w.match_type === 4) || [];
  const simWinnersTier5 = simResults?.winners.filter((w) => w.match_type === 5) || [];

  // Filter winners list by query
  const filteredWinners = simResults?.winners.filter((w) =>
    w.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="space-y-8 max-w-6xl mx-auto px-4 sm:px-6">
      {/* Header */}
      <div>
        <h1 className="font-heading text-3xl font-bold tracking-tight text-ink sm:text-4xl">Draws Control Panel</h1>
        <p className="mt-1.5 text-sm text-[#6B7280]">
          Schedule monthly draws, configure algorithms, simulate player match payouts, and publish winning numbers.
        </p>
      </div>

      {/* Rollover Alert Banner */}
      {poolPreview && poolPreview.jackpotCarry > 0 && (
        <div className="rounded-xl border border-coral/30 bg-coral/[0.02] p-4 text-xs font-medium text-coral flex items-start gap-2.5 animate-in fade-in duration-200">
          <AlertCircle className="h-4 w-4 shrink-0 text-coral mt-0.5" />
          <div>
            <span className="font-bold text-coral">Jackpot Rollover Carry:</span> £
            {poolPreview.jackpotCarry.toLocaleString(undefined, { minimumFractionDigits: 2 })}{" "}
            is carrying over from the previous month because there was no jackpot (5-match) winner.
          </div>
        </div>
      )}

      {/* Top Grid: Controls & Preview */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Controls (col span 5) */}
        <div className="lg:col-span-5">
          <Card className="rounded-2xl border border-border bg-white shadow-sm h-full">
            <CardHeader>
              <CardTitle className="font-heading text-lg font-semibold text-ink">Configure Draw</CardTitle>
              <CardDescription>Setup parameters to run score evaluation.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSimulate} className="space-y-5">
                {/* Select Month/Year */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="month" className="text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
                      Month
                    </Label>
                    <Select id="month" value={month} onChange={(e) => setMonth(Number(e.target.value))}>
                      {MONTHS.map((m, idx) => (
                        <option key={m} value={idx + 1}>
                          {m}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="year" className="text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
                      Year
                    </Label>
                    <Input
                      id="year"
                      type="number"
                      value={year}
                      onChange={(e) => setYear(Number(e.target.value))}
                      className="h-10 text-sm"
                    />
                  </div>
                </div>

                {/* Draw Type selection mode */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
                    Selection Mode
                  </Label>
                  <div className="space-y-2.5">
                    <label className="flex items-start gap-3 rounded-lg border border-border p-3 hover:bg-neutral-50 cursor-pointer transition-colors">
                      <input
                        type="radio"
                        name="drawType"
                        value="random"
                        checked={drawType === "random"}
                        onChange={() => setDrawType("random")}
                        className="mt-1 border-border accent-ink text-ink"
                      />
                      <div>
                        <span className="text-xs font-semibold text-ink block">Random Selection</span>
                        <span className="text-[10px] text-[#6B7280]">Generate 5 unique integers between 1-45 securely.</span>
                      </div>
                    </label>
                    <label className="flex items-start gap-3 rounded-lg border border-border p-3 hover:bg-neutral-50 cursor-pointer transition-colors">
                      <input
                        type="radio"
                        name="drawType"
                        value="algorithm_most"
                        checked={drawType === "algorithm_most"}
                        onChange={() => setDrawType("algorithm_most")}
                        className="mt-1 border-border accent-ink text-ink"
                      />
                      <div>
                        <span className="text-xs font-semibold text-ink block">Algorithmic (Most Frequent)</span>
                        <span className="text-[10px] text-[#6B7280]">Weighted towards numbers that occurred most in last 90 days.</span>
                      </div>
                    </label>
                    <label className="flex items-start gap-3 rounded-lg border border-border p-3 hover:bg-neutral-50 cursor-pointer transition-colors">
                      <input
                        type="radio"
                        name="drawType"
                        value="algorithm_least"
                        checked={drawType === "algorithm_least"}
                        onChange={() => setDrawType("algorithm_least")}
                        className="mt-1 border-border accent-ink text-ink"
                      />
                      <div>
                        <span className="text-xs font-semibold text-ink block">Algorithmic (Least Frequent)</span>
                        <span className="text-[10px] text-[#6B7280]">Weighted towards numbers that occurred least in last 90 days.</span>
                      </div>
                    </label>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isSimulating || loadingPreview}
                  className="btn-primary w-full h-11 text-sm font-semibold rounded-xl"
                >
                  {isSimulating ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Simulating Evaluation...
                    </>
                  ) : (
                    <>
                      <PlayCircle className="mr-2 h-4 w-4" />
                      Simulate Monthly Draw
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Prize Pool Preview (col span 7) */}
        <div className="lg:col-span-7">
          <Card className="rounded-2xl border border-border bg-white shadow-sm h-full flex flex-col justify-between">
            <CardHeader className="pb-3">
              <CardTitle className="font-heading text-lg font-semibold text-ink flex items-center justify-between">
                <span>Prize Pool Preview</span>
                <span className="text-xs font-normal text-[#6B7280]">
                  {MONTHS[month - 1]} {year}
                </span>
              </CardTitle>
              <CardDescription>
                Live estimate of the pools split based on currently active subscriptions.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between gap-6">
              {loadingPreview ? (
                <div className="flex-1 flex items-center justify-center py-10">
                  <RefreshCw className="h-6 w-6 text-neutral-400 animate-spin" />
                </div>
              ) : poolPreview ? (
                <div className="space-y-6 w-full">
                  {/* Big Total */}
                  <div className="flex items-baseline justify-between border-b border-border pb-4">
                    <div className="space-y-0.5">
                      <span className="text-xs font-semibold uppercase tracking-wider text-[#6B7280]">Est. Total Prize Pool</span>
                      <p className="text-2xs text-[#8C8C96]">Active Subs Base Pool + Jackpot Rollovers</p>
                    </div>
                    <span className="font-heading text-4xl font-extrabold text-ink select-none">
                      £{poolPreview.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  {/* Pool breakdown list */}
                  <div className="space-y-3.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[#6B7280]">Stripe Subscription Base contribution (50%)</span>
                      <span className="font-semibold text-ink">
                        £{poolPreview.basePool.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#6B7280]">Jackpot carry over from rollover</span>
                      <span className="font-semibold text-ink">
                        £{poolPreview.jackpotCarry.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div className="border-t border-dashed border-border pt-3.5 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-2.5 w-2.5 rounded bg-ink" />
                          <span className="font-medium text-ink">5-Match Tier (40% Jackpot)</span>
                        </div>
                        <span className="font-bold text-ink">
                          £{poolPreview.tier5.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-2.5 w-2.5 rounded bg-[#6B7280]" />
                          <span className="font-medium text-ink">4-Match Tier (35%)</span>
                        </div>
                        <span className="font-semibold text-ink">
                          £{poolPreview.tier4.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-2.5 w-2.5 rounded bg-[#9CA3AF]" />
                          <span className="font-medium text-ink">3-Match Tier (25%)</span>
                        </div>
                        <span className="font-semibold text-ink">
                          £{poolPreview.tier3.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-neutral-400">Select parameters to see breakdown.</p>
              )}

              <div className="rounded-lg bg-neutral-50 border border-border p-3 text-[10px] text-[#8C8C96] leading-normal">
                <span className="font-semibold text-ink">Splitting Policy:</span> If multiple subscribers qualify in the same matching tier, the respective tier prize amount is split equally among them.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Middle Section: Simulation Results & Actions */}
      <AnimatePresence mode="wait">
        {simResults && (
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            {/* Simulation Header / Reveal */}
            <Card className="rounded-2xl border border-border bg-white shadow-sm p-4 text-center">
              <CardHeader className="pb-2">
                <CardTitle className="font-heading text-xl font-bold text-ink">
                  Simulated Winning Numbers
                </CardTitle>
                <CardDescription className="text-xs">
                  Revealed numbers generated from selection mode:{" "}
                  <span className="font-bold text-ink">{simResults.draw.draw_type}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Clean Number Pills Stagger Animation */}
                <m.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                  className="flex items-center justify-center gap-3.5 my-6 flex-wrap"
                >
                  {simResults.draw.drawn_numbers.map((num) => (
                    <m.div
                      key={num}
                      variants={itemVariants}
                      className="h-14 w-14 rounded-full bg-ink text-white font-heading text-xl font-bold flex items-center justify-center border border-border shadow-md select-none"
                    >
                      {num}
                    </m.div>
                  ))}
                </m.div>

                {/* Roll over notification */}
                {simWinnersTier5.length === 0 && (
                  <p className="text-xs font-semibold text-coral bg-coral/[0.04] py-2 px-3 rounded-lg max-w-sm mx-auto">
                    No 5-match jackpot winners. £
                    {simResults.prizePool.tier5.toLocaleString(undefined, { minimumFractionDigits: 2 })}{" "}
                    will carry over to next month&apos;s jackpot.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Results summaries & Split Metrics */}
            <div className="grid gap-4 sm:grid-cols-3">
              {/* 5 Match */}
              <Card className="rounded-2xl border border-border bg-white shadow-sm p-1">
                <CardHeader className="pb-1.5 flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
                    5-Match Winners
                  </CardTitle>
                  <Trophy className="h-4 w-4 text-coral shrink-0" />
                </CardHeader>
                <CardContent>
                  <div className="font-heading text-3xl font-extrabold text-ink">
                    {simWinnersTier5.length}
                  </div>
                  <p className="text-2xs text-[#8C8C96] mt-1">
                    Prize:{" "}
                    <span className="font-bold text-ink">
                      £
                      {simWinnersTier5.length > 0
                        ? (simResults.prizePool.tier5 / simWinnersTier5.length).toLocaleString(undefined, { minimumFractionDigits: 2 })
                        : "0.00 (Rollover)"}
                    </span>{" "}
                    each
                  </p>
                </CardContent>
              </Card>

              {/* 4 Match */}
              <Card className="rounded-2xl border border-border bg-white shadow-sm p-1">
                <CardHeader className="pb-1.5 flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
                    4-Match Winners
                  </CardTitle>
                  <Coins className="h-4 w-4 text-ink shrink-0" />
                </CardHeader>
                <CardContent>
                  <div className="font-heading text-3xl font-extrabold text-ink">
                    {simWinnersTier4.length}
                  </div>
                  <p className="text-2xs text-[#8C8C96] mt-1">
                    Prize:{" "}
                    <span className="font-bold text-ink">
                      £
                      {simWinnersTier4.length > 0
                        ? (simResults.prizePool.tier4 / simWinnersTier4.length).toLocaleString(undefined, { minimumFractionDigits: 2 })
                        : "0.00"}
                    </span>{" "}
                    each
                  </p>
                </CardContent>
              </Card>

              {/* 3 Match */}
              <Card className="rounded-2xl border border-border bg-white shadow-sm p-1">
                <CardHeader className="pb-1.5 flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
                    3-Match Winners
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-[#8C8C96] shrink-0" />
                </CardHeader>
                <CardContent>
                  <div className="font-heading text-3xl font-extrabold text-ink">
                    {simWinnersTier3.length}
                  </div>
                  <p className="text-2xs text-[#8C8C96] mt-1">
                    Prize:{" "}
                    <span className="font-bold text-ink">
                      £
                      {simWinnersTier3.length > 0
                        ? (simResults.prizePool.tier3 / simWinnersTier3.length).toLocaleString(undefined, { minimumFractionDigits: 2 })
                        : "0.00"}
                    </span>{" "}
                    each
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Winners Detail Table */}
            <Card className="rounded-2xl border border-border bg-white shadow-sm">
              <CardHeader className="pb-3 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between space-y-0">
                <div>
                  <CardTitle className="font-heading text-lg font-semibold text-ink">Simulated Winners List</CardTitle>
                  <CardDescription>Subscribers who matched 3 or more of the drawn numbers.</CardDescription>
                </div>

                {/* Email Search input */}
                <div className="relative w-full sm:max-w-xs">
                  <Input
                    placeholder="Search by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-10 text-xs pl-9 border-border bg-white"
                  />
                  <Search className="absolute left-3 top-3 h-4 w-4 text-[#9CA3AF]" />
                </div>
              </CardHeader>
              <CardContent>
                {filteredWinners.length === 0 ? (
                  <div className="text-center py-10 border border-dashed border-border rounded-xl">
                    <p className="text-xs text-[#6B7280]">No matching winners found for this simulation.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto border border-border rounded-xl">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-neutral-50/50 border-b border-border text-[#6B7280] font-semibold">
                          <th className="p-3.5">Subscriber</th>
                          <th className="p-3.5">Matches</th>
                          <th className="p-3.5">Active Scores</th>
                          <th className="p-3.5 text-right">Prize Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {filteredWinners.map((winner) => (
                          <tr key={winner.id} className="hover:bg-neutral-50/40 transition-colors">
                            <td className="p-3.5">
                              <p className="font-semibold text-ink">{winner.name}</p>
                              <p className="text-[10px] text-[#6B7280]">{winner.email}</p>
                            </td>
                            <td className="p-3.5">
                              <span className="inline-flex items-center rounded-full bg-neutral-100 px-2.5 py-0.5 text-[10px] font-bold text-ink">
                                {winner.match_type} matches
                              </span>
                            </td>
                            <td className="p-3.5">
                              <div className="flex gap-1.5 flex-wrap">
                                {winner.scores.map((score, index) => {
                                  const isMatch = simResults.draw.drawn_numbers.includes(score);
                                  return (
                                    <span
                                      key={index}
                                      className={cn(
                                        "inline-flex h-6 w-6 items-center justify-center rounded-md text-[10px] font-bold border border-border select-none",
                                        isMatch ? "bg-coral text-white border-coral" : "bg-neutral-50 text-[#6B7280]"
                                      )}
                                    >
                                      {score}
                                    </span>
                                  );
                                })}
                              </div>
                            </td>
                            <td className="p-3.5 text-right font-bold text-ink">
                              £{winner.prize_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Confirmation publishing section */}
            <div className="rounded-2xl border border-border bg-white p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h4 className="font-heading text-sm font-semibold text-ink">Publish Simulated Results</h4>
                <p className="text-xs text-[#6B7280] mt-0.5">
                  Publishing locks the numbers and distributes payouts. This action cannot be reversed.
                </p>
              </div>

              {simResults.draw.status === "published" ? (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-3.5 py-2 rounded-xl border border-emerald-100">
                  <Check className="h-4 w-4" /> Published & Locked
                </span>
              ) : (
                <AlertDialog open={isPublishOpen} onOpenChange={setIsPublishOpen}>
                  <AlertDialogTrigger asChild>
                    <Button className="btn-accent h-11 px-5 text-xs font-semibold rounded-xl flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      Publish Draw Results
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="font-heading text-lg font-semibold text-ink">
                        Publish Monthly Draw Results?
                      </AlertDialogTitle>
                      <AlertDialogDescription className="text-xs text-[#6B7280] leading-normal">
                        This will notify all users and lock the simulated numbers. Matches will be officially recorded, and calculated payouts will be published to participants. This action is irreversible.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="btn-secondary h-11 text-xs font-semibold rounded-xl">
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={(e) => {
                          e.preventDefault();
                          handlePublish();
                        }}
                        disabled={isPublishing}
                        className="btn-primary h-11 text-xs font-semibold rounded-xl"
                      >
                        {isPublishing ? "Publishing..." : "Confirm & Lock Results"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </m.div>
        )}
      </AnimatePresence>

      {/* Draw History Section */}
      <Card className="rounded-2xl border border-border bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="font-heading text-lg font-semibold text-ink">Draw History</CardTitle>
          <CardDescription>List of scheduled, simulated, or published draws.</CardDescription>
        </CardHeader>
        <CardContent>
          {draws.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-xs text-[#6B7280]">No draws recorded in the history log.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-neutral-50/50 border-b border-border text-[#6B7280] font-semibold">
                    <th className="p-3.5">Draw Month</th>
                    <th className="p-3.5">Mode</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Winning Numbers</th>
                    <th className="p-3.5 text-right">Jackpot</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {draws.map((d) => (
                    <tr key={d.id} className="hover:bg-neutral-50/30 transition-colors">
                      <td className="p-3.5 font-semibold text-ink">
                        {MONTHS[d.month - 1]} {d.year}
                      </td>
                      <td className="p-3.5">
                        <span className="capitalize text-[#6B7280]">{d.draw_type}</span>
                      </td>
                      <td className="p-3.5">
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full px-2.5 py-0.5 text-[9px] font-bold border",
                            d.status === "published"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                              : d.status === "simulated"
                              ? "bg-amber-50 text-amber-700 border-amber-100"
                              : "bg-neutral-50 text-[#6B7280] border-neutral-100"
                          )}
                        >
                          {d.status}
                        </span>
                      </td>
                      <td className="p-3.5">
                        {d.drawn_numbers && d.drawn_numbers.length > 0 ? (
                          <div className="flex items-center gap-1.5">
                            {d.drawn_numbers.map((n, idx) => (
                              <span
                                key={idx}
                                className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-border bg-neutral-50/50 text-[9px] font-bold text-ink select-none"
                              >
                                {n}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[10px] text-neutral-400 italic">Not drawn yet</span>
                        )}
                      </td>
                      <td className="p-3.5 text-right font-semibold text-ink">
                        £{Number(d.jackpot_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
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
