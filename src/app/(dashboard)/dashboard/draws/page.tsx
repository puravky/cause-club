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

  return (
    <DrawsDashboardClient
      draws={formattedDraws}
      results={formattedResults}
      scores={formattedScores}
    />
  );
}
