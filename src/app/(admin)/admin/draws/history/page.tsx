import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default async function DrawsHistoryPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: draws } = await supabase
    .from("draws")
    .select(`
      id,
      month,
      year,
      drawn_numbers,
      jackpot_amount,
      draw_results ( match_type, prize_amount )
    `)
    .eq("status", "published")
    .order("year", { ascending: false })
    .order("month", { ascending: false });

  const formatted = ((draws || []) as unknown as Array<Record<string, unknown>>).map((d) => {
    const results = (d.draw_results || []) as unknown as Array<Record<string, unknown>>;
    const tier5Count = results.filter((r) => Number(r.match_type) === 5).length;
    const totalPayout = results.reduce((sum, r) => sum + Number(r.prize_amount || 0), 0);
    return {
      id: String(d.id),
      month: Number(d.month),
      year: Number(d.year),
      drawn_numbers: d.drawn_numbers as number[] | null,
      jackpot_amount: Number(d.jackpot_amount),
      tier5Count,
      totalPayout,
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-semibold tracking-tight text-ink">Draws History</h1>
        <p className="mt-1.5 text-sm text-[#6B7280]">All published monthly draws and their results.</p>
      </div>

      {formatted.length === 0 ? (
        <div className="rounded-2xl border border-border bg-white p-12 text-center">
          <p className="text-sm text-[#6B7280]">No published draws yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-white shadow-sm">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-neutral-50/50 border-b border-border text-[#6B7280] font-semibold">
                <th className="p-3.5">Draw</th>
                <th className="p-3.5">Winning Numbers</th>
                <th className="p-3.5 text-right">Jackpot</th>
                <th className="p-3.5 text-right">5-Match Winners</th>
                <th className="p-3.5 text-right">Total Payout</th>
                <th className="p-3.5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {formatted.map((d) => (
                <tr key={d.id} className="hover:bg-neutral-50/30 transition-colors">
                  <td className="p-3.5 font-semibold text-ink">
                    {MONTHS[d.month - 1]} {d.year}
                  </td>
                  <td className="p-3.5">
                    {d.drawn_numbers && d.drawn_numbers.length > 0 ? (
                      <div className="flex items-center gap-1.5">
                        {d.drawn_numbers.map((n, idx) => (
                          <span
                            key={idx}
                            className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-ink text-white text-[10px] font-bold select-none"
                          >
                            {n}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-[10px] text-neutral-400 italic">N/A</span>
                    )}
                  </td>
                  <td className="p-3.5 text-right font-semibold text-ink">
                    £{d.jackpot_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-3.5 text-right">
                    <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
                      {d.tier5Count}
                    </span>
                  </td>
                  <td className="p-3.5 text-right font-semibold text-ink">
                    £{d.totalPayout.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-3.5 text-right">
                    <Link
                      href={`/admin/draws/${d.id}`}
                      className="btn-secondary text-[10px] px-3 py-1.5 rounded-lg"
                    >
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
