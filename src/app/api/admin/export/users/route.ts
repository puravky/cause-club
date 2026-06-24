import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data: users } = await supabase
    .from("users")
    .select(`
      id,
      email,
      name,
      role,
      subscription_status,
      created_at,
      charities ( name ),
      donations ( amount )
    `)
    .order("created_at", { ascending: false });

  const rows = ((users || []) as unknown as Array<Record<string, unknown>>).map((u) => {
    const charityData = u.charities as { name?: string } | null;
    const donationsData = u.donations as Array<{ amount: number }> | null;
    return {
      email: u.email,
      name: u.name || "",
      role: u.role || "subscriber",
      subscription_status: u.subscription_status || "none",
      charity_name: charityData?.name || "",
      total_donated: (donationsData || []).reduce((sum, d) => sum + Number(d.amount || 0), 0),
      created_at: u.created_at || "",
    };
  });

  const header = "Name,Email,Role,Subscription Status,Charity,Total Donated,Created At\n";
  const csv = rows.map(
    (r) =>
      `"${r.name}","${r.email}","${r.role}","${r.subscription_status}","${r.charity_name}",${r.total_donated.toFixed(2)},"${r.created_at}"`
  ).join("\n");

  return new NextResponse(header + csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": 'attachment; filename="users-export.csv"',
    },
  });
}
