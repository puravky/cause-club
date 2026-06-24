import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CreditCard, BarChart3, Heart, TrendingUp } from "lucide-react";

export default async function AdminPage() {
  const supabase = await createClient();

  // 1. Total registered users
  const { count: totalUsers } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true });

  // 2. Active subscriptions
  const { count: activeSubs } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true })
    .in("subscription_status", ["active", "trialing"]);

  // 3. Total scores logged
  const { count: totalScores } = await supabase
    .from("scores")
    .select("*", { count: "exact", head: true });

  // 4. Total donations raised
  const { data: donations } = await supabase
    .from("donations")
    .select("amount");

  const totalRaised = (donations || []).reduce((acc, curr) => acc + Number(curr.amount), 0);

  // 5. Fetch recent 5 user registrations
  const { data: recentUsers } = await supabase
    .from("users")
    .select("id, name, email, subscription_status, created_at")
    .order("created_at", { ascending: false })
    .limit(5);

  const stats = [
    {
      title: "Total Members",
      value: totalUsers ?? 0,
      description: "Registered causeClub profiles",
      icon: Users,
    },
    {
      title: "Active Subscriptions",
      value: activeSubs ?? 0,
      description: `${(((activeSubs ?? 0) / Math.max(1, totalUsers ?? 0)) * 100).toFixed(0)}% conversion rate`,
      icon: CreditCard,
    },
    {
      title: "Total Scores Logged",
      value: totalScores ?? 0,
      description: "Stableford rounds registered",
      icon: BarChart3,
    },
    {
      title: "Charity Funds Raised",
      value: `£${totalRaised.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      description: "Direct splits from membership",
      icon: Heart,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-heading text-3xl font-semibold tracking-tight text-ink">Metrics Overview</h1>
        <p className="mt-1.5 text-sm text-[#6B7280]">
          System status, subscription growth, and total charitable fund balances.
        </p>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card key={i} className="rounded-2xl border border-border bg-white shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-[#9CA3AF]" />
              </CardHeader>
              <CardContent>
                <div className="font-heading text-2xl font-bold text-ink">
                  {stat.value}
                </div>
                <p className="mt-1 text-2xs text-[#9CA3AF]">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Grid */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Recent Activity (Left & Center) */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="rounded-2xl border border-border bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="font-heading text-lg font-semibold text-ink">Recent Registrations</CardTitle>
              <CardDescription>Latest profiles created on causeClub.</CardDescription>
            </CardHeader>
            <CardContent>
              {(!recentUsers || recentUsers.length === 0) ? (
                <p className="text-sm text-[#6B7280] py-6 text-center">No users registered yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="pb-3 font-semibold text-[#6B7280] text-xs uppercase tracking-wider">Email</th>
                        <th className="pb-3 font-semibold text-[#6B7280] text-xs uppercase tracking-wider">Name</th>
                        <th className="pb-3 font-semibold text-[#6B7280] text-xs uppercase tracking-wider">Sub Status</th>
                        <th className="pb-3 font-semibold text-[#6B7280] text-xs uppercase tracking-wider">Joined Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {recentUsers.map((u) => (
                        <tr key={u.id}>
                          <td className="py-3 font-medium text-ink truncate max-w-[180px]">{u.email}</td>
                          <td className="py-3 text-[#6B7280]">{u.name || "—"}</td>
                          <td className="py-3">
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-0.5 text-3xs font-semibold ${
                                u.subscription_status === "active"
                                  ? "bg-emerald-50 text-emerald-700"
                                  : u.subscription_status === "trialing"
                                  ? "bg-sky-50 text-sky-700"
                                  : "bg-slate-50 text-[#6B7280]"
                              }`}
                            >
                              {u.subscription_status || "inactive"}
                            </span>
                          </td>
                          <td className="py-3 text-xs text-[#9CA3AF]">
                            {new Date(u.created_at || "").toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Growth Card (Right) */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="rounded-2xl border border-border bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="font-heading text-lg font-semibold text-ink">Draw Pool Status</CardTitle>
              <CardDescription>Fund health estimation.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-xl border border-border bg-paper">
                <TrendingUp className="h-5 w-5 text-coral" />
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
                    Projected Draw Cost
                  </h4>
                  <p className="text-base font-bold text-ink">
                    £{((activeSubs ?? 0) * 9.99 * 0.4).toFixed(2)}
                  </p>
                </div>
              </div>
              <p className="text-2xs leading-relaxed text-[#9CA3AF]">
                Draw prizes are calculated by allocating 40% of the active subscriber membership pool for current month jackpot pools and cash rewards.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
