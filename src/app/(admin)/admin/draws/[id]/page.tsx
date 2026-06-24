import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default async function DrawDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: draw } = await supabase
    .from("draws")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();

  if (!draw) {
    notFound();
  }

  const { data: results } = await supabase
    .from("draw_results")
    .select(`
      id,
      match_type,
      prize_amount,
      verification_status,
      payout_status,
      users ( email, name )
    `)
    .eq("draw_id", params.id)
    .order("match_type", { ascending: false })
    .order("prize_amount", { ascending: false });

  const formattedResults = ((results || []) as unknown as Array<Record<string, unknown>>).map((r) => {
    const userRecord = r.users as Record<string, unknown> | null;
    return {
      id: String(r.id),
      match_type: Number(r.match_type),
      prize_amount: Number(r.prize_amount),
      verification_status: String(r.verification_status || "pending"),
      payout_status: String(r.payout_status || "pending"),
      email: userRecord?.email as string || "unknown",
      name: userRecord?.name as string || "Unknown",
    };
  });

  const grouped = {
    5: formattedResults.filter((r) => r.match_type === 5),
    4: formattedResults.filter((r) => r.match_type === 4),
    3: formattedResults.filter((r) => r.match_type === 3),
  };

  const tierNames: Record<number, string> = {
    5: "5-Match Jackpot",
    4: "4-Match",
    3: "3-Match",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/admin/draws/history"
            className="text-xs text-[#6B7280] hover:text-ink transition-colors"
          >
            &larr; Back to History
          </Link>
          <h1 className="font-heading text-3xl font-semibold tracking-tight text-ink mt-1">
            {MONTHS[Number(draw.month) - 1]} {draw.year}
          </h1>
          <p className="mt-1 text-sm text-[#6B7280]">
            Draw type: <span className="capitalize font-medium text-ink">{draw.draw_type}</span>
            &middot; Status: <span className="font-medium text-emerald-600">{draw.status}</span>
          </p>
        </div>

        {formattedResults.length > 0 && (
          <Link
            href={`/api/admin/export/winners?drawId=${draw.id}`}
            className="btn-primary text-xs font-semibold rounded-xl h-11 px-5"
          >
            Export Winners CSV
          </Link>
        )}
      </div>

      <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
        <h2 className="font-heading text-lg font-semibold text-ink mb-4">Winning Numbers</h2>
        <div className="flex items-center gap-3">
          {(draw.drawn_numbers || []).map((n: number, idx: number) => (
            <span
              key={idx}
              className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-ink text-white font-heading text-lg font-bold select-none"
            >
              {n}
            </span>
          ))}
        </div>
        <p className="mt-4 text-sm text-[#6B7280]">
          Jackpot Amount: <span className="font-semibold text-ink">£{Number(draw.jackpot_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
        </p>
      </div>

      {[5, 4, 3].map((tier) => {
        const winners = grouped[tier as keyof typeof grouped];
        if (winners.length === 0) return null;

        return (
          <div key={tier} className="rounded-2xl border border-border bg-white shadow-sm">
            <div className="border-b border-border px-6 py-4">
              <h2 className="font-heading text-lg font-semibold text-ink">
                {tierNames[tier]}
              </h2>
              <p className="text-xs text-[#6B7280] mt-0.5">
                {winners.length} winner{winners.length !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-neutral-50/50 border-b border-border text-[#6B7280] font-semibold">
                    <th className="p-3.5">Name</th>
                    <th className="p-3.5">Email</th>
                    <th className="p-3.5 text-right">Prize Amount</th>
                    <th className="p-3.5">Verification</th>
                    <th className="p-3.5">Payout</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {winners.map((w) => (
                    <tr key={w.id} className="hover:bg-neutral-50/30 transition-colors">
                      <td className="p-3.5 font-medium text-ink">{w.name}</td>
                      <td className="p-3.5 text-[#6B7280]">{w.email}</td>
                      <td className="p-3.5 text-right font-semibold text-ink">
                        £{w.prize_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3.5">
                        <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-[9px] font-bold text-amber-700 border border-amber-100 capitalize">
                          {w.verification_status}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-[9px] font-bold text-blue-700 border border-blue-100 capitalize">
                          {w.payout_status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}

      {formattedResults.length === 0 && (
        <div className="rounded-2xl border border-border bg-white p-12 text-center">
          <p className="text-sm text-[#6B7280]">No winners for this draw.</p>
        </div>
      )}
    </div>
  );
}
