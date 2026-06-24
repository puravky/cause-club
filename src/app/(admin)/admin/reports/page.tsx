import { createClient } from "@/lib/supabase/server";
import { ReportsClient } from "@/components/admin/ReportsClient";

export default async function AdminReportsPage() {
  const supabase = await createClient();

  // --- KPI: MRR ---
  const { data: activeUsers } = await supabase
    .from("users")
    .select("subscription_plan")
    .in("subscription_status", ["active", "trialing"]);

  const mrr = (activeUsers || []).reduce((acc, u) => {
    return acc + (u.subscription_plan === "yearly" ? 89.99 / 12 : 9.99);
  }, 0);

  // --- KPI: Total Charity Donated ---
  const { data: totalDonationData } = await supabase
    .from("donations")
    .select("amount");

  const totalCharityDonated = (totalDonationData || []).reduce(
    (acc, d) => acc + Number(d.amount),
    0,
  );

  // --- KPI: Active Users ---
  const { count: activeUsersCount } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true })
    .in("subscription_status", ["active", "trialing"]);

  // --- KPI: Avg Charity % ---
  const { data: charityPercentages } = await supabase
    .from("users")
    .select("charity_percentage");

  const avgCharityPct =
    charityPercentages && charityPercentages.length > 0
      ? charityPercentages.reduce((acc, u) => acc + (u.charity_percentage ?? 0), 0) /
        charityPercentages.length
      : 0;

  // --- Line Chart: New users last 90 days ---
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  const { data: newUsers } = await supabase
    .from("users")
    .select("created_at")
    .gte("created_at", ninetyDaysAgo.toISOString())
    .order("created_at", { ascending: true });

  const userCountByDate: Record<string, number> = {};
  (newUsers || []).forEach((u) => {
    if (!u.created_at) return;
    const date = new Date(u.created_at).toISOString().split("T")[0];
    userCountByDate[date] = (userCountByDate[date] || 0) + 1;
  });

  const newUsersData = Object.entries(userCountByDate).map(([date, count]) => ({
    date,
    count,
  }));

  // --- Pie Chart: Subscription split ---
  const monthlyCount = (activeUsers || []).filter(
    (u) => u.subscription_plan === "monthly",
  ).length;
  const yearlyCount = (activeUsers || []).filter(
    (u) => u.subscription_plan === "yearly",
  ).length;

  // --- Recent Transactions Table ---
  const { data: recentDonations } = await supabase
    .from("donations")
    .select(
      `
      id,
      amount,
      type,
      created_at,
      charities (name),
      users (name, email)
    `,
    )
    .order("created_at", { ascending: false })
    .limit(20);

  const formattedDonations = (recentDonations || []).map((d) => ({
    id: d.id,
    amount: Number(d.amount),
    type: d.type,
    created_at: d.created_at,
    charity_name: (d.charities as unknown as { name: string })?.name ?? "Unknown",
    user_name:
      (d.users as unknown as { name: string | null; email: string })?.name ??
      (d.users as unknown as { email: string })?.email ??
      "Unknown",
  }));

  return (
    <ReportsClient
      mrr={mrr}
      totalCharityDonated={totalCharityDonated}
      activeUsersCount={activeUsersCount ?? 0}
      avgCharityPct={avgCharityPct}
      newUsersData={newUsersData}
      monthlyCount={monthlyCount}
      yearlyCount={yearlyCount}
      recentDonations={formattedDonations}
    />
  );
}
