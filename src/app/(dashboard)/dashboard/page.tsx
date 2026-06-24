import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardClient } from "@/components/dashboard/DashboardClient";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 1. Fetch recent draws (last 5)
  const { data: draws } = await supabase
    .from("draws")
    .select("id, month, year, draw_type, status, drawn_numbers, jackpot_amount, created_at")
    .order("year", { ascending: false })
    .order("month", { ascending: false })
    .limit(5);

  // 2. Fetch user's draw results (prizes won)
  const { data: results } = await supabase
    .from("draw_results")
    .select(`
      id,
      draw_id,
      match_type,
      prize_amount,
      verification_status,
      payout_status,
      proof_url,
      created_at,
      draws (
        id,
        month,
        year,
        draw_type,
        status,
        drawn_numbers,
        jackpot_amount,
        created_at
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // 3. Fetch user's profile and active charity details
  const { data: profile } = await supabase
    .from("users")
    .select("charity_percentage, charity_id")
    .eq("id", user.id)
    .single();

  let activeCharity = null;
  if (profile?.charity_id) {
    const { data: charityInfo } = await supabase
      .from("charities")
      .select("name")
      .eq("id", profile.charity_id)
      .single();

    if (charityInfo) {
      activeCharity = {
        name: charityInfo.name,
        percentage: profile.charity_percentage ?? 10,
      };
    }
  }

  // Map types safely
  const formattedDraws = (draws || []).map((d) => ({
    id: d.id,
    month: Number(d.month),
    year: Number(d.year),
    draw_type: d.draw_type,
    status: d.status,
    drawn_numbers: d.drawn_numbers,
    jackpot_amount: Number(d.jackpot_amount),
    created_at: d.created_at,
  }));

  const formattedWinnings = (results || []).map((w) => {
    const drawData = w.draws as unknown as Record<string, unknown> | null;
    return {
      id: w.id,
      draw_id: w.draw_id,
      match_type: Number(w.match_type),
      prize_amount: Number(w.prize_amount),
      verification_status: w.verification_status,
      payout_status: w.payout_status,
      proof_url: w.proof_url,
      created_at: w.created_at,
      draws: drawData ? {
        id: drawData.id as string,
        month: Number(drawData.month),
        year: Number(drawData.year),
        draw_type: drawData.draw_type as string,
        status: drawData.status as string,
        drawn_numbers: drawData.drawn_numbers as number[] | null,
        jackpot_amount: Number(drawData.jackpot_amount),
        created_at: drawData.created_at as string,
      } : null,
    };
  });

  return (
    <DashboardClient
      recentDraws={formattedDraws}
      winnings={formattedWinnings}
      charity={activeCharity}
    />
  );
}
