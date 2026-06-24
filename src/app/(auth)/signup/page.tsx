import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import SignUpFlow from "./SignUpFlow";

export default async function SignUpPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If already logged in and has charity, go to dashboard
  if (user) {
    const { data: profile } = await supabase
      .from("users")
      .select("charity_id")
      .eq("id", user.id)
      .single();

    if (profile?.charity_id) {
      redirect("/dashboard");
    } else {
      redirect("/onboarding");
    }
  }

  // Fetch active charities for the signup step
  const { data: charities } = await supabase
    .from("charities")
    .select("id, name, description, logo_url")
    .order("name", { ascending: true });

  return (
    <div className="min-h-screen bg-paper flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md text-center mb-8">
        <h1 className="font-heading text-3xl font-bold text-ink">causeClub</h1>
        <p className="text-ink/60 text-sm mt-1">Play golf. Fund good.</p>
      </div>

      <SignUpFlow charities={charities || []} />
    </div>
  );
}
