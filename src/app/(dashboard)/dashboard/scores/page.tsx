import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ScoresClient } from "@/components/dashboard/ScoresClient";

export default async function ScoresPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch initial scores from the database
  const { data: scores } = await supabase
    .from("scores")
    .select("id, score, date, created_at")
    .eq("user_id", user.id)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  // Map to correct types for the client component
  const typedScores = (scores || []).map((s) => ({
    id: s.id,
    score: s.score,
    date: s.date,
    created_at: s.created_at,
  }));

  return <ScoresClient initialScores={typedScores} userId={user.id} />;
}
