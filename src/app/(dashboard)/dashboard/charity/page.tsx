import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CharityClient } from "@/components/dashboard/CharityClient";

export default async function CharityPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch all available charities
  const { data: charities } = await supabase
    .from("charities")
    .select("id, name, description, images, logo_url, events, featured")
    .order("name", { ascending: true });

  // Fetch current user's profile to get selected charity and percentage contribution
  const { data: profile } = await supabase
    .from("users")
    .select("charity_id, charity_percentage")
    .eq("id", user.id)
    .single();

  // Fetch donation history
  const { data: donations } = await supabase
    .from("donations")
    .select(`
      id,
      amount,
      type,
      created_at,
      charities (name)
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const formattedCharities = (charities || []).map((c) => ({
    id: c.id,
    name: c.name,
    description: c.description,
    images: c.images,
    logo_url: c.logo_url,
    events: c.events,
    featured: c.featured,
  }));

  const userProfile = {
    charity_id: profile?.charity_id || null,
    charity_percentage: profile?.charity_percentage ?? 10,
  };

  const formattedDonations = (donations || []).map((d) => ({
    id: d.id,
    amount: Number(d.amount),
    type: d.type,
    created_at: d.created_at,
    charity_name: (d.charities as unknown as { name: string }).name,
  }));

  return (
    <CharityClient
      charities={formattedCharities}
      userProfile={userProfile}
      donations={formattedDonations}
    />
  );
}
