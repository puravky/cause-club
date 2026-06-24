import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { CharityProfile } from "@/components/marketing/CharityProfile";

export default async function CharityProfilePage({ params }: { params: { id: string } }) {
  const supabase = await createClient();

  const { data: charity, error } = await supabase
    .from("charities")
    .select(`
      id,
      name,
      description,
      images,
      logo_url,
      website,
      events,
      donations (
        amount,
        user_id
      )
    `)
    .eq("id", params.id)
    .single();

  if (error || !charity) {
    notFound();
  }

  const { data: { session } } = await supabase.auth.getSession();

  return (
    <CharityProfile 
      charity={charity} 
      isLoggedIn={!!session} 
    />
  );
}
