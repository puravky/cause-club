"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Info, CalendarDays, Award, ChevronUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScoreForm } from "./ScoreForm";
import { ScoreList } from "./ScoreList";
import { getScores } from "@/app/(dashboard)/dashboard/scores/actions";
import { cn } from "@/lib/utils";

interface ScoreRow {
  id: string;
  score: number;
  date: string;
  created_at: string;
}

interface ScoresClientProps {
  initialScores: ScoreRow[];
  userId: string;
}

export function ScoresClient({ initialScores }: ScoresClientProps) {
  const [scores, setScores] = useState<ScoreRow[]>(initialScores);

  // Sync state if initialScores prop updates due to Next.js server navigation/revalidation
  useEffect(() => {
    setScores(initialScores);
  }, [initialScores]);

  // Fetch updated scores from server action
  async function refreshScores() {
    try {
      const updated = await getScores();
      setScores(updated);
    } catch (error) {
      console.error("Failed to refresh scores", error);
    }
  }

  // Stats Calculations
  const scoresCount = scores.length;
  const averageScore =
    scoresCount > 0
      ? (scores.reduce((acc, curr) => acc + curr.score, 0) / scoresCount).toFixed(1)
      : null;

  // The database keeps only the newest 5 scores.
  // If the user has 5 scores, the oldest score is the last element (due to descending sort by date/created_at)
  const oldestScoreDate = scores.length >= 5 ? scores[scores.length - 1].date : null;

  return (
    <div className="space-y-8 max-w-6xl mx-auto px-4 sm:px-6">
      {/* Page Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight text-ink sm:text-4xl">Golf Scores</h1>
          <p className="mt-1.5 text-sm text-[#6B7280]">
            Log stableford rounds. Only your 5 most recent rounds are kept for active draws.
          </p>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Avg Score Card */}
        <Card className="rounded-2xl border border-border bg-white shadow-sm p-1">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
              Average Score
            </CardTitle>
            <Award className="h-4 w-4 text-coral shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="font-heading text-4xl font-extrabold text-coral">
                {averageScore || "—"}
              </span>
              {averageScore && (
                <span className="text-xs font-medium text-[#6B7280] pb-1">points (par is 36)</span>
              )}
            </div>
            <p className="text-[11px] text-[#8C8C96] mt-1.5">
              Calculated across your active round history.
            </p>
          </CardContent>
        </Card>

        {/* Scores Logged Card */}
        <Card className="rounded-2xl border border-border bg-white shadow-sm p-1">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
              Rounds Active
            </CardTitle>
            <CalendarDays className="h-4 w-4 text-ink shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="font-heading text-4xl font-extrabold text-ink">
                {scoresCount}
              </span>
              <span className="text-sm font-semibold text-[#8C8C96]">/ 5 maximum</span>
            </div>
            <p className="text-[11px] text-[#8C8C96] mt-1.5">
              New rounds automatically replace the oldest round.
            </p>
          </CardContent>
        </Card>

        {/* Best Performance Card */}
        <Card className="rounded-2xl border border-border bg-white shadow-sm p-1 sm:col-span-2 lg:col-span-1">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
              Peak Score
            </CardTitle>
            <ChevronUp className="h-4 w-4 text-emerald-600 shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="font-heading text-4xl font-extrabold text-ink">
                {scoresCount > 0 ? Math.max(...scores.map((s) => s.score)) : "—"}
              </span>
              {scoresCount > 0 && (
                <span className="text-xs font-medium text-[#6B7280] pb-1">stableford points</span>
              )}
            </div>
            <p className="text-[11px] text-[#8C8C96] mt-1.5">
              Your highest recorded stableford score.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Form, Chart & List */}
      <div className="grid gap-8 lg:grid-cols-12">
        {/* Left Column: Form & History Chart (col span 5) */}
        <div className="space-y-8 lg:col-span-5">
          {/* Score Form */}
          <ScoreForm onSuccess={refreshScores} oldestScoreDate={oldestScoreDate} />

          {/* Interactive Chart */}
          {scoresCount > 0 && (
            <Card className="rounded-2xl border border-border bg-white shadow-sm p-1">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
                  Score History & Progression
                </CardTitle>
                <CardDescription className="text-2xs text-[#8C8C96]">
                  Showing rounds chronologically from oldest to newest.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="flex h-44 items-end gap-3 px-2 border-b border-border pb-3">
                  {/* Reverse array to show chronological order: oldest to newest */}
                  {scores.slice().reverse().map((s) => {
                    const heightPercent = `${Math.min(100, (s.score / 45) * 100)}%`;
                    return (
                      <div
                        key={s.id}
                        className="group relative flex flex-1 flex-col items-center gap-1.5 h-full justify-end"
                      >
                        {/* Tooltip */}
                        <div className="absolute -top-9 scale-0 transition-transform duration-150 group-hover:scale-100 rounded-lg bg-ink px-2.5 py-1.5 text-[10px] font-bold text-white shadow-md z-10 border border-neutral-800">
                          {s.score} pts
                        </div>
                        {/* Bar Container */}
                        <div className="w-full flex-1 flex flex-col justify-end h-full">
                          <div
                            className={cn(
                              "w-full rounded-t-md transition-all duration-200 cursor-pointer relative",
                              s.score > 30 ? "bg-coral/10 hover:bg-coral" : "bg-ink/5 hover:bg-ink"
                            )}
                            style={{ height: heightPercent }}
                          >
                            {/* Accent highlight fill */}
                            <div
                              className={cn(
                                "absolute bottom-0 inset-x-0 rounded-t-md opacity-80 transition-colors group-hover:opacity-100",
                                s.score > 30 ? "bg-coral" : "bg-ink"
                              )}
                              style={{ height: "100%" }}
                            />
                          </div>
                        </div>
                        <span className="text-[10px] font-semibold text-[#8C8C96] select-none">
                          {format(new Date(s.date), "d/M")}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] text-[#6B7280]">
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded bg-ink" />
                    <span className="font-medium text-ink">Score (≤30)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded bg-coral" />
                    <span className="font-medium text-coral">Peak score (&gt;30)</span>
                  </div>
                  <div className="flex items-center gap-1.5 ml-auto">
                    <Info className="h-3.5 w-3.5 text-[#8C8C96]" />
                    <span className="text-[#8C8C96]">Stableford cap is 45</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column: Score List (col span 7) */}
        <div className="lg:col-span-7">
          <ScoreList scores={scores} onRefresh={refreshScores} />
        </div>
      </div>
    </div>
  );
}
