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
    <div className="min-h-screen bg-[#FAFAF9] dark:bg-[#0A0A0B] flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md text-center mb-8">
        <h1 className="font-heading text-3xl font-bold text-[#0A0A0B] dark:text-[#FAFAF9]">causeClub</h1>
        <p className="text-[#0A0A0B]/60 dark:text-[#FAFAF9]/60 text-sm mt-1">Play Golf, Find Good.</p>
      </div>

      <SignUpFlow charities={charities || []} />
    </div>
  );
}
