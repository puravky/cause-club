import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ClaimForm } from "@/components/dashboard/ClaimForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function ClaimPage({ params }: { params: { drawId: string } }) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch the user's result for this draw
  const { data: result } = await supabase
    .from("draw_results")
    .select("id, verification_status, payout_status, match_type, prize_amount, draw_id")
    .eq("draw_id", params.drawId)
    .eq("user_id", user.id)
    .single();

  if (!result || result.match_type < 3) {
    // User hasn't won anything in this draw
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/dashboard/draws"
          className="inline-flex items-center text-sm text-ink/60 hover:text-ink transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Draws
        </Link>
        <h1 className="text-3xl font-heading font-bold text-ink">Verify Winnings</h1>
        <p className="text-ink/70">
          You won £{result.prize_amount} for matching {result.match_type} numbers! Please upload your scorecard to claim your prize.
        </p>
      </div>

      <ClaimForm
        drawId={result.draw_id}
        userId={user.id}
        verificationStatus={result.verification_status}
        payoutStatus={result.payout_status}
      />
    </div>
  );
}
