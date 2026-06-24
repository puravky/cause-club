import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { WinnersClient } from "@/components/admin/WinnersClient";

export default async function AdminWinnersPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch submitted and reviewed results (not pending upload)
  const { data: results, error } = await supabase
    .from("draw_results")
    .select(`
      id,
      match_type,
      prize_amount,
      verification_status,
      payout_status,
      proof_url,
      admin_note,
      draws (
        month,
        year
      ),
      users (
        email
      )
    `)
    .neq("verification_status", "pending")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching winners:", error);
  }

  // Safely map the returned joined objects
  const formattedResults = (results || []).map(r => {
    const drawData = r.draws as unknown as { month: number, year: number };
    const userData = r.users as unknown as { email: string };
    
    return {
      id: r.id,
      match_type: r.match_type,
      prize_amount: Number(r.prize_amount),
      verification_status: r.verification_status,
      payout_status: r.payout_status,
      proof_url: r.proof_url || "",
      admin_note: r.admin_note,
      draws: {
        month: drawData.month,
        year: drawData.year,
      },
      users: {
        email: userData.email,
      }
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-semibold tracking-tight text-ink">Winners Verification</h1>
        <p className="mt-1.5 text-sm text-[#6B7280]">
          Review uploaded scorecards, verify winning claims, and manage payouts.
        </p>
      </div>

      <WinnersClient results={formattedResults} />
    </div>
  );
}
