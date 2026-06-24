"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { m } from "framer-motion";
import {
  Trophy,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Hourglass,
  ExternalLink,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface Draw {
  id: string;
  month: number;
  year: number;
  draw_type: string;
  status: string;
  drawn_numbers: number[];
  jackpot_amount: number;
  created_at: string;
}

interface DrawResult {
  id: string;
  draw_id: string;
  match_type: number;
  prize_amount: number;
  verification_status: string;
  payout_status: string;
  proof_url?: string;
}

interface Score {
  score: number;
  date: string;
}

interface WinnerWithDraw {
  id: string;
  draw_id: string;
  match_count: number;
  prize_amount: number;
  status: string;
  proof_url: string | null;
  created_at: string;
  draw: {
    id: string;
    month: number;
    year: number;
    drawn_numbers: number[] | null;
    jackpot_amount: number;
    status: string;
  } | null;
}

interface DrawsDashboardClientProps {
  draws: Draw[];
  results: DrawResult[];
  scores: Score[];
  winners: WinnerWithDraw[];
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

export function DrawsDashboardClient({ draws, results, scores, winners }: DrawsDashboardClientProps) {
  const router = useRouter();
  const supabase = createClient();

  // Proof upload modal states
  const [selectedResultId, setSelectedResultId] = useState<string | null>(null);
  const [proofUrlInput, setProofUrlInput] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // Latest draw is the first in the list since they are ordered newest first
  const latestDraw = draws[0];
  const pastDraws = draws.slice(1);

  // Get user's result for a draw
  const getResultForDraw = (drawId: string) => {
    return results.find((r) => r.draw_id === drawId);
  };

  // Get user's scores for a draw's month and year
  const getScoresForDraw = (drawMonth: number, drawYear: number) => {
    return scores.filter((s) => {
      const dateObj = new Date(s.date);
      return dateObj.getUTCMonth() + 1 === drawMonth && dateObj.getUTCFullYear() === drawYear;
    });
  };


  // Submit proof URL to verification database
  async function handleSubmitProof(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedResultId || !proofUrlInput.trim()) return;

    setIsUploading(true);
    try {
      const { error } = await supabase
        .from("draw_results")
        .update({
          proof_url: proofUrlInput.trim(),
          verification_status: "submitted",
        })
        .eq("id", selectedResultId);

      if (error) {
        toast.error("Failed to submit verification proof: " + error.message);
      } else {
        toast.success("Verification proof submitted successfully!");
        setSelectedResultId(null);
        setProofUrlInput("");
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      toast.error("An unexpected error occurred during submission.");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto px-4 sm:px-6">
      {/* Header */}
      <div>
        <h1 className="font-heading text-3xl font-bold tracking-tight text-ink sm:text-4xl">Draws &amp; Winnings</h1>
        <p className="mt-1.5 text-sm text-[#6B7280]">
          View active monthly draw results, verify your winnings, and review historical performance.
        </p>
      </div>

      {/* No draws executed yet */}
      {!latestDraw ? (
        <Card className="rounded-2xl border border-border bg-white shadow-sm py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 text-[#9CA3AF] mx-auto mb-4">
            <Calendar className="h-6 w-6" />
          </div>
          <h3 className="font-heading text-lg font-semibold text-ink">No Draws Executed</h3>
          <p className="mt-1.5 text-xs text-[#6B7280] max-w-sm mx-auto leading-normal">
            The monthly golf draws have not started yet. Once the administration publishes the current month&apos;s draw, your results will appear here.
          </p>
        </Card>
      ) : (
        <>
          {/* Latest Published Draw Card */}
          <Card className="rounded-2xl border border-border bg-white shadow-sm overflow-hidden">
            <div className="bg-ink p-6 text-white">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#8C8C96]">Latest Monthly Draw</span>
              <h2 className="font-heading text-2xl font-bold mt-1 text-white">
                {MONTHS[latestDraw.month - 1]} {latestDraw.year} Results
              </h2>
            </div>
            
            <CardContent className="p-6 space-y-6">
              {/* Drawn Numbers Reveal */}
              <div className="text-center space-y-3">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#6B7280]">Official Winning Numbers</span>
                <m.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                  className="flex items-center justify-center gap-3 flex-wrap"
                >
                  {latestDraw.drawn_numbers.map((num) => (
                    <m.div
                      key={num}
                      variants={itemVariants}
                      className="h-12 w-12 rounded-full bg-ink text-white font-heading text-lg font-bold flex items-center justify-center border border-neutral-800 shadow-md select-none"
                    >
                      {num}
                    </m.div>
                  ))}
                </m.div>
              </div>

              {/* User Results Evaluation Section */}
              <div className="border-t border-border pt-6">
                {(() => {
                  const result = getResultForDraw(latestDraw.id);
                  const drawScores = getScoresForDraw(latestDraw.month, latestDraw.year);
                  const participated = drawScores.length > 0;

                  if (result) {
                    // User won!
                    return (
                      <div className="rounded-xl border border-emerald-200 bg-emerald-50/[0.15] p-5 space-y-4 animate-in fade-in duration-200">
                        <div className="flex items-start gap-3">
                          <Trophy className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                          <div className="space-y-1">
                            <h4 className="font-heading text-base font-bold text-emerald-950">You Won!</h4>
                            <p className="text-xs text-emerald-800 leading-normal">
                              Congratulations! You matched <span className="font-bold">{result.match_type} numbers</span> and won a split prize of{" "}
                              <span className="font-bold">£{result.prize_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>.
                            </p>
                          </div>
                        </div>

                        {/* Winnings Status Badges */}
                        <div className="flex flex-wrap gap-4 text-xs pt-2">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[#6B7280]">Verification:</span>
                            <span
                              className={cn(
                                "inline-flex items-center gap-1 font-semibold capitalize",
                                result.verification_status === "verified"
                                  ? "text-emerald-600"
                                  : result.verification_status === "submitted"
                                  ? "text-blue-600"
                                  : "text-amber-600"
                              )}
                            >
                              {result.verification_status === "verified" ? (
                                <CheckCircle2 className="h-3.5 w-3.5" />
                              ) : (
                                <Hourglass className="h-3.5 w-3.5" />
                              )}
                              {result.verification_status}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <span className="text-[#6B7280]">Payout status:</span>
                            <span
                              className={cn(
                                "inline-flex items-center gap-1 font-semibold capitalize",
                                result.payout_status === "paid" ? "text-emerald-600" : "text-neutral-500"
                              )}
                            >
                              {result.payout_status}
                            </span>
                          </div>
                        </div>

                        {/* Upload Proof Button / Proof link */}
                        <div className="pt-2 border-t border-dashed border-emerald-100 flex items-center justify-between flex-wrap gap-3">
                          {result.proof_url ? (
                            <a
                              href={result.proof_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 inline-flex items-center gap-1"
                            >
                              <ExternalLink className="h-3.5 w-3.5" /> View Submitted Proof
                            </a>
                          ) : (
                            <div className="flex flex-col gap-2 w-full">
                              <p className="text-[10px] text-emerald-800 leading-normal">
                                please upload a screenshot of your official scorecard to verify this round.
                              </p>
                              <Button
                                onClick={() => setSelectedResultId(result.id)}
                                className="btn-accent h-9 text-2xs font-semibold rounded-lg flex items-center gap-1.5 self-start"
                              >
                                <Upload className="h-3.5 w-3.5" />
                                Upload Verification Proof
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  } else if (participated) {
                    // Participated but did not win
                    // Count how many numbers matched
                    const matchCount = drawScores.filter((s) =>
                      latestDraw.drawn_numbers.includes(s.score)
                    ).length;

                    return (
                      <div className="rounded-xl border border-border bg-neutral-50/50 p-5 space-y-3">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="h-5 w-5 text-[#8C8C96] shrink-0 mt-0.5" />
                          <div className="space-y-0.5">
                            <h4 className="font-heading text-sm font-semibold text-ink">Better luck next time</h4>
                            <p className="text-xs text-[#6B7280]">
                              You matched {matchCount} numbers for this month. Prizes start at 3 matches.
                            </p>
                          </div>
                        </div>

                        {/* Highlighted score pills */}
                        <div className="pt-2">
                          <Label className="text-[10px] font-semibold uppercase tracking-wider text-[#6B7280] block mb-2">
                            Your logged rounds and matches:
                          </Label>
                          <div className="flex gap-2 flex-wrap">
                            {drawScores.map((s, idx) => {
                              const isMatch = latestDraw.drawn_numbers.includes(s.score);
                              return (
                                <div
                                  key={idx}
                                  className={cn(
                                    "flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg border",
                                    isMatch
                                      ? "bg-coral/[0.04] border-coral text-coral"
                                      : "bg-white border-border text-[#6B7280]"
                                  )}
                                >
                                  <span className="font-heading text-sm font-bold">{s.score}</span>
                                  <span className="text-[9px] font-medium text-[#8C8C96] shrink-0">
                                    {format(new Date(s.date), "d/M")}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  } else {
                    // Did not participate
                    return (
                      <div className="rounded-xl border border-dashed border-border p-5 text-center space-y-2">
                        <h4 className="font-heading text-sm font-semibold text-[#8C8C96]">Not Entered</h4>
                        <p className="text-xs text-[#6B7280] max-w-sm mx-auto leading-normal">
                          You did not record any golf scores during {MONTHS[latestDraw.month - 1]} {latestDraw.year}. Log your stableford rounds next month to participate!
                        </p>
                      </div>
                    );
                  }
                })()}
              </div>
            </CardContent>
          </Card>

          {/* Past Draws History Section */}
          <Card className="rounded-2xl border border-border bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="font-heading text-lg font-semibold text-ink">Draw History</CardTitle>
              <CardDescription>Review winning numbers and payouts from past monthly draws.</CardDescription>
            </CardHeader>
            <CardContent>
              {pastDraws.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-xs text-[#6B7280]">No past draw records available.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-neutral-50/50 border-b border-border text-[#6B7280] font-semibold">
                        <th className="p-3.5">Draw</th>
                        <th className="p-3.5">Winning Numbers</th>
                        <th className="p-3.5">Your Performance</th>
                        <th className="p-3.5 text-right">Result</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {pastDraws.map((d) => {
                        const result = getResultForDraw(d.id);
                        const drawScores = getScoresForDraw(d.month, d.year);
                        const participated = drawScores.length > 0;
                        const matchCount = drawScores.filter((s) =>
                          d.drawn_numbers.includes(s.score)
                        ).length;

                        return (
                          <tr key={d.id} className="hover:bg-neutral-50/30 transition-colors">
                            <td className="p-3.5 font-semibold text-ink">
                              {MONTHS[d.month - 1]} {d.year}
                            </td>
                            <td className="p-3.5">
                              <div className="flex gap-1">
                                {d.drawn_numbers.map((n, idx) => (
                                  <span
                                    key={idx}
                                    className="inline-flex h-5.5 w-5.5 items-center justify-center rounded-full border border-border bg-neutral-50 text-[9px] font-bold text-ink select-none"
                                  >
                                    {n}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="p-3.5">
                              {participated ? (
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-semibold text-ink">
                                    Matched {matchCount} ({drawScores.length} rounds logged)
                                  </span>
                                </div>
                              ) : (
                                <span className="text-[10px] text-neutral-400 italic">No entry</span>
                              )}
                            </td>
                            <td className="p-3.5 text-right font-bold text-ink">
                              {result ? (
                                <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-lg px-2 py-0.5 font-semibold text-[10px]">
                                  Won £{result.prize_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </span>
                              ) : participated ? (
                                <span className="text-neutral-400 font-normal">No win</span>
                              ) : (
                                <span className="text-neutral-300 font-normal italic">—</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

          {/* Winners Section */}
          {winners.length > 0 && (
            <Card className="rounded-2xl border border-border bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="font-heading text-lg font-semibold text-ink flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-accent" />
                  Your Winner Records
                </CardTitle>
                <CardDescription>Officially confirmed wins from the winners table.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-neutral-50/50 border-b border-border text-[#6B7280] font-semibold">
                        <th className="p-3.5">Draw</th>
                        <th className="p-3.5">Match</th>
                        <th className="p-3.5">Prize</th>
                        <th className="p-3.5">Status</th>
                        <th className="p-3.5">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {winners.map((w) => (
                        <tr key={w.id} className="hover:bg-neutral-50/30 transition-colors">
                          <td className="p-3.5 font-semibold text-ink">
                            {w.draw
                              ? `${MONTHS[w.draw.month - 1]} ${w.draw.year}`
                              : "Unknown"}
                          </td>
                          <td className="p-3.5">
                            <span className="inline-flex items-center justify-center rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-bold text-accent">
                              {w.match_count}
                            </span>
                          </td>
                          <td className="p-3.5 font-semibold text-ink">
                            &pound;{w.prize_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                          <td className="p-3.5">
                            <span
                              className={cn(
                                "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold capitalize",
                                w.status === "paid"
                                  ? "bg-emerald-50 text-emerald-700"
                                  : w.status === "approved"
                                  ? "bg-blue-50 text-blue-700"
                                  : "bg-amber-50 text-amber-700"
                              )}
                            >
                              {w.status === "paid" ? (
                                <CheckCircle2 className="h-3 w-3" />
                              ) : (
                                <Hourglass className="h-3 w-3" />
                              )}
                              {w.status}
                            </span>
                          </td>
                          <td className="p-3.5 text-[#6B7280]">
                            {w.created_at
                              ? format(new Date(w.created_at), "d MMM yyyy")
                              : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

      {/* Proof Upload Dialog */}
      <Dialog open={selectedResultId !== null} onOpenChange={() => setSelectedResultId(null)}>
        <DialogContent className="max-w-sm rounded-xl">
          <form onSubmit={handleSubmitProof} className="space-y-4">
            <DialogHeader>
              <DialogTitle className="font-heading text-lg font-semibold text-ink">
                Submit Verification Proof
              </DialogTitle>
              <DialogDescription className="text-xs text-[#6B7280] leading-normal">
                Please paste a URL link to your verified scorecard (e.g. fromImgur, Dropbox, or a public golf club sheet). This will allow administrators to review and approve your split prize payout.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-1.5">
              <Label htmlFor="proofUrl" className="text-xs font-semibold text-ink">
                Scorecard Image Link / URL
              </Label>
              <Input
                id="proofUrl"
                type="url"
                required
                placeholder="https://example.com/scorecard.png"
                value={proofUrlInput}
                onChange={(e) => setProofUrlInput(e.target.value)}
                disabled={isUploading}
                className="h-10 text-xs border-border bg-white"
              />
            </div>

            <DialogFooter className="pt-2 border-t border-dashed border-border flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={isUploading}
                onClick={() => setSelectedResultId(null)}
                className="btn-secondary h-10 px-4 text-xs font-semibold rounded-lg"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isUploading}
                className="btn-primary h-10 px-4 text-xs font-semibold rounded-lg"
              >
                {isUploading ? "Uploading..." : "Submit Proof"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
