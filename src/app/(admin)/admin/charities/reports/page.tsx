import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CharityReportsClient } from "@/components/admin/CharityReportsClient";

export default async function AdminCharityReportsPage({
  searchParams,
}: {
  searchParams: { range?: string };
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const range = searchParams?.range || "this-month";
  const now = new Date();

  let startDate: Date;
  let endDate: Date;

  if (range === "last-month") {
    startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
  } else if (range === "this-month") {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  } else {
    startDate = new Date(0);
    endDate = new Date(8640000000000000);
  }

  let query = supabase
    .from("donations")
    .select(
      `
      amount,
      charity_id,
      user_id,
      created_at,
      charities (name)
    `,
    );

  if (range !== "all") {
    query = query
      .gte("created_at", startDate.toISOString())
      .lte("created_at", endDate.toISOString());
  }

  const { data: donations } = await query;

  const charityMap: Record<string, { name: string; total: number }> = {};
  const userTotals: Record<string, number> = {};
  let totalDonationsValue = 0;

  (donations || []).forEach((d) => {
    const charityName = (d.charities as unknown as { name: string })?.name ?? "Unknown";
    const charityId = d.charity_id;
    const amount = Number(d.amount);

    if (!charityMap[charityId]) {
      charityMap[charityId] = { name: charityName, total: 0 };
    }
    charityMap[charityId].total += amount;

    userTotals[d.user_id] = (userTotals[d.user_id] || 0) + amount;
    totalDonationsValue += amount;
  });

  const barChartData = Object.entries(charityMap).map(([, { name, total }]) => ({
    name,
    total: Math.round(total * 100) / 100,
    percentage:
      totalDonationsValue > 0
        ? Math.round((total / totalDonationsValue) * 100)
        : 0,
  }));
  barChartData.sort((a, b) => b.total - a.total);

  const topDonorEntry = Object.entries(userTotals).sort(
    (a, b) => b[1] - a[1],
  )[0];
  let topDonorName = "N/A";
  let topDonorAmount = 0;

  if (topDonorEntry) {
    topDonorAmount = Math.round(topDonorEntry[1] * 100) / 100;
    const { data: topUser } = await supabase
      .from("users")
      .select("name, email")
      .eq("id", topDonorEntry[0])
      .single();

    topDonorName = topUser?.name || topUser?.email || "N/A";
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-semibold tracking-tight text-ink">
          Causes Reports
        </h1>
        <p className="mt-1.5 text-sm text-[#6B7280]">
          Donation distribution and performance across all partner charities.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 bg-white p-1 rounded-2xl border border-border shadow-sm w-fit">
        <Link
          href="/admin/charities"
          className="px-4 py-2 text-sm font-medium rounded-xl text-[#6B7280] hover:text-ink hover:bg-ink/5 transition-colors"
        >
          Manage
        </Link>
        <Link
          href="/admin/charities/reports"
          className="px-4 py-2 text-sm font-medium rounded-xl bg-ink text-white"
        >
          Reports
        </Link>
      </div>

      <CharityReportsClient
        barChartData={barChartData}
        totalDonations={totalDonationsValue}
        topDonorName={topDonorName}
        topDonorAmount={topDonorAmount}
        currentRange={range}
      />
    </div>
  );
}
