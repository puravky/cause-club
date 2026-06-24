import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CharitiesAdmin } from "@/components/admin/CharitiesAdmin";

export default async function AdminCharitiesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch all charities with their donations and users count for stats
  const { data: charities, error } = await supabase
    .from("charities")
    .select(`
      id,
      name,
      description,
      logo_url,
      website,
      stripe_account_id,
      featured,
      images,
      events,
      donations ( amount ),
      users ( id )
    `)
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching charities for admin:", error);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-semibold tracking-tight text-ink">Causes Administration</h1>
        <p className="mt-1.5 text-sm text-[#6B7280]">
          Manage partner charities, view their raised totals, and update the featured causes shown on the homepage.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 bg-white p-1 rounded-2xl border border-border shadow-sm w-fit">
        <Link
          href="/admin/charities"
          className="px-4 py-2 text-sm font-medium rounded-xl bg-ink text-white"
        >
          Manage
        </Link>
        <Link
          href="/admin/charities/reports"
          className="px-4 py-2 text-sm font-medium rounded-xl text-[#6B7280] hover:text-ink hover:bg-ink/5 transition-colors"
        >
          Reports
        </Link>
      </div>

      <CharitiesAdmin charities={charities || []} />
    </div>
  );
}
