import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DrawsClient } from "@/components/admin/DrawsClient";

export default async function DrawsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch draws from database
  const { data: draws } = await supabase
    .from("draws")
    .select("id, month, year, draw_type, status, drawn_numbers, jackpot_amount, created_at")
    .order("year", { ascending: false })
    .order("month", { ascending: false });

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

  return <DrawsClient initialDraws={formattedDraws} />;
}
