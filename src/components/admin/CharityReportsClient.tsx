"use client";

import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { DollarSign, User } from "lucide-react";

interface CharityBarData {
  name: string;
  total: number;
  percentage: number;
}

interface CharityReportsClientProps {
  barChartData: CharityBarData[];
  totalDonations: number;
  topDonorName: string;
  topDonorAmount: number;
  currentRange: string;
}

const RANGES = [
  { value: "this-month", label: "This Month" },
  { value: "last-month", label: "Last Month" },
  { value: "all", label: "All Time" },
];

export function CharityReportsClient({
  barChartData,
  totalDonations,
  topDonorName,
  topDonorAmount,
  currentRange,
}: CharityReportsClientProps) {
  return (
    <div className="space-y-8">
      {/* Date Range Selector */}
      <div className="flex gap-1 bg-white p-1 rounded-2xl border border-border shadow-sm w-fit">
        {RANGES.map((r) => (
          <Link
            key={r.value}
            href={`/admin/charities/reports?range=${r.value}`}
            className={`px-4 py-2 text-sm font-medium rounded-xl transition-colors ${
              currentRange === r.value
                ? "bg-ink text-white"
                : "text-[#6B7280] hover:text-ink hover:bg-ink/5"
            }`}
          >
            {r.label}
          </Link>
        ))}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 sm:grid-cols-2">
        <Card className="rounded-2xl border border-border bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
              Total Donations
            </CardTitle>
            <DollarSign className="h-4 w-4 text-[#9CA3AF]" />
          </CardHeader>
          <CardContent>
            <div className="font-heading text-2xl font-bold text-ink">
              £{totalDonations.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="mt-1 text-2xs text-[#9CA3AF]">
              {currentRange === "this-month"
                ? "This month"
                : currentRange === "last-month"
                  ? "Last month"
                  : "All time"}
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-border bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
              Top Donor
            </CardTitle>
            <User className="h-4 w-4 text-[#9CA3AF]" />
          </CardHeader>
          <CardContent>
            <div className="font-heading text-2xl font-bold text-ink truncate">
              {topDonorName}
            </div>
            <p className="mt-1 text-2xs text-[#9CA3AF]">
              £{topDonorAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} total donated
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Bar Chart and Percentage Breakdown */}
      <div className="grid gap-8 lg:grid-cols-3">
        <Card className="lg:col-span-2 rounded-2xl border border-border bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="font-heading text-lg font-semibold text-ink">
              Donations by Charity
            </CardTitle>
            <CardDescription>
              Total amount raised per cause
            </CardDescription>
          </CardHeader>
          <CardContent>
            {barChartData.length === 0 ? (
              <p className="text-sm text-[#6B7280] py-6 text-center">
                No donations in this period.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={barChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: "#6B7280" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#6B7280" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    formatter={(value) => [`£${Number(value).toLocaleString()}`, "Donations"]}
                  />
                  <Bar dataKey="total" fill="#f97316" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-border bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="font-heading text-lg font-semibold text-ink">
              Distribution
            </CardTitle>
            <CardDescription>
              % share per charity
            </CardDescription>
          </CardHeader>
          <CardContent>
            {barChartData.length === 0 ? (
              <p className="text-sm text-[#6B7280] py-6 text-center">
                No data yet.
              </p>
            ) : (
              <div className="space-y-4">
                {barChartData.map((item, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="font-medium text-ink truncate mr-2">
                        {item.name}
                      </span>
                      <span className="text-[#6B7280] text-xs font-semibold">
                        {item.percentage}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-ink/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-coral rounded-full transition-all"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
