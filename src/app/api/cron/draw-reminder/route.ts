import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SECRET_KEY!;

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const now = new Date();
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const diffDays = Math.ceil((endOfMonth.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays > 3) {
    return NextResponse.json({ message: "Not yet within 3-day reminder window", emailsSent: 0 });
  }

  const { data: users, error: usersErr } = await supabase
    .from("users")
    .select("id, email, name")
    .in("subscription_status", ["active", "trialing"]);

  if (usersErr) {
    console.error("Failed to fetch active users:", usersErr.message);
    return NextResponse.json({ error: usersErr.message }, { status: 500 });
  }

  let emailsSent = 0;

  for (const user of users || []) {
    const { count, error: countErr } = await supabase
      .from("scores")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id);

    if (countErr) {
      console.error(`Error counting scores for user ${user.id}:`, countErr.message);
      continue;
    }

    if ((count ?? 0) < 5) {
      const name = user.name || user.email.split("@")[0];
      const result = await sendEmail({
        to: user.email,
        subject: "Add your scores before the draw!",
        html: `<p>Hi ${name},</p><p>Add your 5th score before draw. The monthly draw closes soon. Log your remaining rounds to maximize your chances.</p>`,
      });

      if (result.success) {
        emailsSent++;
      }
    }
  }

  return NextResponse.json({ emailsSent });
}
