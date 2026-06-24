import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function maskKey(key: string | undefined): string {
  if (!key) return "Not set";
  if (key.length <= 8) return "****";
  return key.slice(0, 4) + "****" + key.slice(-4);
}

export default async function AdminSettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/dashboard");
  }

  const envVars = [
    { label: "Supabase URL", value: process.env.NEXT_PUBLIC_SUPABASE_URL || "Not set" },
    { label: "Stripe Publishable Key", value: maskKey(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) },
    { label: "Stripe Secret Key", value: maskKey(process.env.STRIPE_SECRET_KEY) },
    { label: "Stripe Webhook Secret", value: maskKey(process.env.STRIPE_WEBHOOK_SECRET) },
    { label: "Resend API Key", value: maskKey(process.env.RESEND_API_KEY) },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-semibold tracking-tight text-ink">Settings</h1>
        <p className="mt-1.5 text-sm text-[#6B7280]">System configuration and environment variables.</p>
      </div>

      <div className="rounded-2xl border border-border bg-white shadow-sm">
        <div className="border-b border-border px-6 py-4">
          <h2 className="font-heading text-lg font-semibold text-ink">Environment Variables</h2>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Secret keys are masked for security.
          </p>
        </div>
        <div className="divide-y divide-border">
          {envVars.map((env) => (
            <div key={env.label} className="flex items-center justify-between px-6 py-3.5">
              <span className="text-sm font-medium text-ink">{env.label}</span>
              <span className="text-xs font-mono text-[#6B7280]">{env.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-white shadow-sm">
        <div className="border-b border-border px-6 py-4">
          <h2 className="font-heading text-lg font-semibold text-ink">System Info</h2>
        </div>
        <div className="divide-y divide-border">
          <div className="flex items-center justify-between px-6 py-3.5">
            <span className="text-sm font-medium text-ink">Node Environment</span>
            <span className="text-xs font-mono text-[#6B7280]">{process.env.NODE_ENV || "Not set"}</span>
          </div>
          <div className="flex items-center justify-between px-6 py-3.5">
            <span className="text-sm font-medium text-ink">Platform</span>
            <span className="text-xs font-mono text-[#6B7280]">{process.platform}</span>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-white shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-heading text-lg font-semibold text-ink">Notifications</h2>
            <p className="text-xs text-[#6B7280] mt-0.5">
              Admin email notification preferences.
            </p>
          </div>
          <span className="text-xs text-neutral-400">Coming soon</span>
        </div>
      </div>
    </div>
  );
}
