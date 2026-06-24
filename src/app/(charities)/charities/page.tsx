import { createClient } from "@/lib/supabase/server";
import { CharitiesDirectory } from "@/components/marketing/CharitiesDirectory";

export default async function CharitiesPage() {
  const supabase = await createClient();

  const { data: charities, error } = await supabase
    .from("charities")
    .select(`
      id,
      name,
      description,
      images,
      logo_url,
      events,
      featured,
      donations (
        amount
      )
    `);

  if (error) {
    console.error("Failed to fetch charities:", error);
  }

  return (
    <div className="bg-paper min-h-screen pt-24">
      <CharitiesDirectory charities={charities || []} />
    </div>
  );
}
