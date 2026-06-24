import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DrawsDashboardClient } from "@/components/dashboard/DrawsDashboardClient";

export default async function DashboardDrawsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 1. Fetch all published draws (newest first)
  const { data: draws } = await supabase
    .from("draws")
    .select("id, month, year, draw_type, status, drawn_numbers, jackpot_amount, created_at")
    .eq("status", "published")
    .order("year", { ascending: false })
    .order("month", { ascending: false });

  // 2. Fetch user's draw results
  const { data: results } = await supabase
    .from("draw_results")
    .select("id, draw_id, match_type, prize_amount, verification_status, payout_status, proof_url")
    .eq("user_id", user.id);

  // 3. Fetch user's scores to check participation details
  const { data: scores } = await supabase
    .from("scores")
    .select("score, date")
    .eq("user_id", user.id);

  // 4. Fetch winner records with draw join
  const { data: winnerRows } = await supabase
    .from("winners")
    .select(`
      id,
      draw_id,
      match_count,
      prize_amount,
      status,
      proof_url,
      created_at,
      draws (
        id,
        month,
        year,
        drawn_numbers,
        jackpot_amount,
        status
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // Format types safely
  const formattedDraws = (draws || []).map((d) => ({
    id: d.id,
    month: Number(d.month),
    year: Number(d.year),
    draw_type: d.draw_type,
    status: d.status,
    drawn_numbers: d.drawn_numbers || [],
    jackpot_amount: Number(d.jackpot_amount),
    created_at: d.created_at,
  }));

  const formattedResults = (results || []).map((r) => ({
    id: r.id,
    draw_id: r.draw_id,
    match_type: Number(r.match_type),
    prize_amount: Number(r.prize_amount),
    verification_status: r.verification_status,
    payout_status: r.payout_status,
    proof_url: r.proof_url,
  }));

  const formattedScores = (scores || []).map((s) => ({
    score: Number(s.score),
    date: s.date,
  }));

  const formattedWinners = (winnerRows || []).map((w) => {
    const drawArray = w.draws as { id: string; month: number; year: number; drawn_numbers: number[] | null; jackpot_amount: number; status: string }[] | null;
    const drawData = drawArray?.[0] ?? null;
    return {
      id: w.id,
      draw_id: w.draw_id,
      match_count: Number(w.match_count),
      prize_amount: Number(w.prize_amount),
      status: w.status,
      proof_url: w.proof_url,
      created_at: w.created_at,
      draw: drawData
        ? {
            id: drawData.id,
            month: Number(drawData.month),
            year: Number(drawData.year),
            drawn_numbers: drawData.drawn_numbers,
            jackpot_amount: Number(drawData.jackpot_amount),
            status: drawData.status,
          }
        : null,
    };
  });

  return (
    <DrawsDashboardClient
      draws={formattedDraws}
      results={formattedResults}
      scores={formattedScores}
      winners={formattedWinners}
    />
  );
}
