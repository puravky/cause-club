"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { DollarSign, Heart, Users, Percent } from "lucide-react";

interface NewUserDataPoint {
  date: string;
  count: number;
}

interface DonationRow {
  id: string;
  amount: number;
  type: string;
  created_at: string | null;
  charity_name: string;
  user_name: string;
}

interface ReportsClientProps {
  mrr: number;
  totalCharityDonated: number;
  activeUsersCount: number;
  avgCharityPct: number;
  newUsersData: NewUserDataPoint[];
  monthlyCount: number;
  yearlyCount: number;
  recentDonations: DonationRow[];
}

const COLORS = ["#f97316", "#0891b2"];

export function ReportsClient({
  mrr,
  totalCharityDonated,
  activeUsersCount,
  avgCharityPct,
  newUsersData,
  monthlyCount,
  yearlyCount,
  recentDonations,
}: ReportsClientProps) {
  const kpiCards = [
    {
      title: "Monthly Recurring Revenue",
      value: `£${mrr.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      description: `${activeUsersCount} active subscribers`,
      icon: DollarSign,
    },
    {
      title: "Total Charity Donated",
      value: `£${totalCharityDonated.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      description: "Lifetime donations to causes",
      icon: Heart,
    },
    {
      title: "Active Users",
      value: activeUsersCount,
      description: "Currently subscribed or trialing",
      icon: Users,
    },
    {
      title: "Average Charity %",
      value: `${avgCharityPct.toFixed(1)}%`,
      description: "Avg user charity split",
      icon: Percent,
    },
  ];

  const pieData = [
    { name: "Monthly", value: monthlyCount },
    { name: "Yearly", value: yearlyCount },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-heading text-3xl font-semibold tracking-tight text-ink">
          Reports Dashboard
        </h1>
        <p className="mt-1.5 text-sm text-[#6B7280]">
          Revenue, user growth, subscription breakdown, and recent transactions.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card
              key={i}
              className="rounded-2xl border border-border bg-white shadow-sm"
            >
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

      {/* Charts Row */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Line Chart */}
        <Card className="rounded-2xl border border-border bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="font-heading text-lg font-semibold text-ink">
              New Users (Last 90 Days)
            </CardTitle>
            <CardDescription>Daily user registrations</CardDescription>
          </CardHeader>
          <CardContent>
            {newUsersData.length === 0 ? (
              <p className="text-sm text-[#6B7280] py-6 text-center">
                No new users in the last 90 days.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={newUsersData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: "#6B7280" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#6B7280" }}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#f97316"
                    strokeWidth={2}
                    dot={{ r: 3, fill: "#f97316" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Pie Chart */}
        <Card className="rounded-2xl border border-border bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="font-heading text-lg font-semibold text-ink">
              Subscription Split
            </CardTitle>
            <CardDescription>Monthly vs Yearly plans</CardDescription>
          </CardHeader>
          <CardContent>
            {monthlyCount === 0 && yearlyCount === 0 ? (
              <p className="text-sm text-[#6B7280] py-6 text-center">
                No active subscriptions.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions Table */}
      <Card className="rounded-2xl border border-border bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="font-heading text-lg font-semibold text-ink">
            Recent Transactions
          </CardTitle>
          <CardDescription>Last 20 donations across all causes</CardDescription>
        </CardHeader>
        <CardContent>
          {recentDonations.length === 0 ? (
            <p className="text-sm text-[#6B7280] py-6 text-center">
              No donations yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="pb-3 font-semibold text-[#6B7280] text-xs uppercase tracking-wider">
                      Date
                    </th>
                    <th className="pb-3 font-semibold text-[#6B7280] text-xs uppercase tracking-wider">
                      User
                    </th>
                    <th className="pb-3 font-semibold text-[#6B7280] text-xs uppercase tracking-wider">
                      Charity
                    </th>
                    <th className="pb-3 font-semibold text-[#6B7280] text-xs uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="pb-3 font-semibold text-[#6B7280] text-xs uppercase tracking-wider">
                      Type
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {recentDonations.map((d) => (
                    <tr key={d.id}>
                      <td className="py-3 text-xs text-[#9CA3AF]">
                        {d.created_at
                          ? new Date(d.created_at).toLocaleDateString()
                          : "—"}
                      </td>
                      <td className="py-3 font-medium text-ink">
                        {d.user_name}
                      </td>
                      <td className="py-3 text-[#6B7280]">
                        {d.charity_name}
                      </td>
                      <td className="py-3 font-semibold text-emerald-600">
                        £{d.amount.toLocaleString()}
                      </td>
                      <td className="py-3">
                        <span className="inline-flex items-center rounded-full px-2 py-0.5 text-2xs font-semibold bg-slate-50 text-[#6B7280]">
                          {d.type === "independent"
                            ? "Independent"
                            : "Subscription"}
                        </span>
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
  );
}
