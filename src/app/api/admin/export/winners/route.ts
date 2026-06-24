import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
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

  const { searchParams } = new URL(request.url);
  const drawId = searchParams.get("drawId");

  if (!drawId) {
    return NextResponse.json({ error: "drawId query parameter is required" }, { status: 400 });
  }

  const { data: results } = await supabase
    .from("draw_results")
    .select(`
      id,
      match_type,
      prize_amount,
      users ( email, name )
    `)
    .eq("draw_id", drawId);

  const rows = (results || []).map((r: Record<string, unknown>) => {
    const userData = r.users as { email?: string; name?: string | null } | null;
    return {
      email: userData?.email || "unknown",
      name: userData?.name || "Unknown",
      match_type: r.match_type,
      prize_amount: Number(r.prize_amount || 0),
    };
  });

  const header = "Name,Email,Match Type,Prize Amount\n";
  const csv = rows.map(
    (r) => `"${r.name}","${r.email}",${r.match_type},${r.prize_amount.toFixed(2)}`
  ).join("\n");

  return new NextResponse(header + csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="winners-${drawId}.csv"`,
    },
  });
}
