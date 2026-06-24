import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { OnboardingStepper } from "@/components/auth/OnboardingStepper";

export default async function OnboardingPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check if they already have a charity selected
  const { data: profile } = await supabase
    .from("users")
    .select("charity_id")
    .eq("id", user.id)
    .single();

  if (profile?.charity_id) {
    redirect("/dashboard");
  }

  // Fetch all active charities for the stepper
  const { data: charities } = await supabase
    .from("charities")
    .select("id, name, description, logo_url")
    .order("name", { ascending: true });

  return (
    <div className="min-h-screen bg-paper flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-2xl text-center mb-12">
        <h1 className="font-heading text-4xl font-bold text-ink mb-4">Welcome to causeClub</h1>
        <p className="text-ink/60 text-lg">
          Before we tee off, let&apos;s set up your charitable impact.
        </p>
      </div>

      <OnboardingStepper charities={charities || []} />
    </div>
  );
}
