import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardSidebar } from "@/components/dashboard/sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch user profile + subscription info
  const { data: profile } = await supabase
    .from("users")
    .select("name, email, role, subscription_status, subscription_plan, charity_percentage")
    .eq("id", user.id)
    .single();

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("plan, status, current_period_end")
    .eq("user_id", user.id)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  return (
    <div className="flex min-h-screen bg-paper">
      <DashboardSidebar
        user={{
          name: profile?.name || user.email?.split("@")[0] || "User",
          email: profile?.email || user.email || "",
          role: profile?.role || "subscriber",
          subscriptionStatus: profile?.subscription_status || "inactive",
          subscriptionPlan: profile?.subscription_plan || null,
          charityPercentage: profile?.charity_percentage ?? 10,
          renewalDate: subscription?.current_period_end || null,
        }}
      />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-5xl px-6 py-8 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
