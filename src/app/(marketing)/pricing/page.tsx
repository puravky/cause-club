import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SubscribeButton } from "@/components/marketing/SubscribeButton";

export default async function PricingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from("users")
      .select("subscription_status")
      .eq("id", user.id)
      .single();

    if (
      profile?.subscription_status === "active" ||
      profile?.subscription_status === "trialing"
    ) {
      redirect("/dashboard");
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-paper px-4">
      <div className="max-w-md text-center">
        <h1 className="font-heading text-3xl font-semibold text-ink">
          Choose your plan
        </h1>
        <p className="mt-3 text-[#6B7280]">
          Subscribe to causeClub to enter monthly draws and fund charitable
          causes.
        </p>
        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
          <div className="rounded-2xl border border-border bg-white p-6 shadow-sm flex flex-col items-center">
            <p className="text-sm font-medium text-[#6B7280]">Monthly</p>
            <p className="mt-1 font-heading text-3xl font-semibold text-ink">
              £9.99<span className="text-base font-normal text-[#6B7280]">/mo</span>
            </p>
            <div className="mt-6">
              <SubscribeButton
                priceId={process.env.STRIPE_PRICE_MONTHLY || ""}
                label="Subscribe Monthly"
              />
            </div>
          </div>
          <div className="rounded-2xl border border-coral bg-white p-6 shadow-sm flex flex-col items-center">
            <p className="text-sm font-medium text-coral">Yearly - Save 20%</p>
            <p className="mt-1 font-heading text-3xl font-semibold text-ink">
              £89.99<span className="text-base font-normal text-[#6B7280]">/yr</span>
            </p>
            <div className="mt-6">
              <SubscribeButton
                priceId={process.env.STRIPE_PRICE_YEARLY || ""}
                label="Subscribe Yearly"
                variant="primary"
              />
            </div>
          </div>
        </div>
        <p className="mt-8 text-xs text-[#6B7280]">
          Already have an account?{" "}
          <a href="/login" className="underline underline-offset-4 hover:text-ink transition-colors">
            Log in
          </a>
        </p>
      </div>
    </main>
  );
}
