import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Past Draws | causeClub",
};

export default async function PastDrawsPage() {
  const supabase = await createClient();

  const { data: draws } = await supabase
    .from("draws")
    .select("id, month, year, drawn_numbers, jackpot_amount, created_at, status")
    .eq("status", "published")
    .order("year", { ascending: false })
    .order("month", { ascending: false })
    .limit(12);

  const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  return (
    <main className="min-h-screen pt-32 pb-24">
      <div className="mx-auto max-w-[1200px] px-6">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h1 className="font-fraunces text-4xl font-bold tracking-tight sm:text-5xl">
            Past Draws
          </h1>
          <p className="mt-4 text-[#0A0A0B]/60 dark:text-[#FAFAF9]/60">
            View winning numbers and prize pool amounts from previous months.
          </p>
        </div>

        {!draws || draws.length === 0 ? (
          <div className="mx-auto max-w-md rounded-2xl border border-border bg-background p-12 text-center">
            <p className="font-fraunces text-xl font-bold">First draw coming soon</p>
            <p className="mt-2 text-sm text-[#0A0A0B]/60 dark:text-[#FAFAF9]/60">
              The first draw runs on the 1st of next month. Sign up now to be entered.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-4 pr-6 text-xs font-semibold uppercase tracking-wider text-[#0A0A0B]/60 dark:text-[#FAFAF9]/60">
                    Date
                  </th>
                  <th className="pb-4 pr-6 text-xs font-semibold uppercase tracking-wider text-[#0A0A0B]/60 dark:text-[#FAFAF9]/60">
                    Numbers
                  </th>
                  <th className="pb-4 pr-6 text-xs font-semibold uppercase tracking-wider text-[#0A0A0B]/60 dark:text-[#FAFAF9]/60">
                    Jackpot
                  </th>
                  <th className="pb-4 text-xs font-semibold uppercase tracking-wider text-[#0A0A0B]/60 dark:text-[#FAFAF9]/60">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {draws.map((draw) => {
                  const numbers = (draw.drawn_numbers as number[]) || [];
                  return (
                    <tr key={draw.id} className="group">
                      <td className="py-5 pr-6 font-medium">
                        {MONTHS[Number(draw.month) - 1]} {draw.year}
                      </td>
                      <td className="py-5 pr-6">
                        <div className="flex items-center gap-2">
                          {numbers.length > 0 ? (
                            numbers.map((n, i) => (
                              <span
                                key={i}
                                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FF5C35]/10 text-sm font-bold text-[#FF5C35]"
                              >
                                {n}
                              </span>
                            ))
                          ) : (
                            <span className="text-sm text-[#0A0A0B]/40 dark:text-[#FAFAF9]/40">
                              TBD
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-5 pr-6 font-fraunces text-lg font-bold">
                        &pound;{Number(draw.jackpot_amount).toLocaleString()}
                      </td>
                      <td className="py-5 text-sm capitalize text-[#0A0A0B]/60 dark:text-[#FAFAF9]/60">
                        {draw.status}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
