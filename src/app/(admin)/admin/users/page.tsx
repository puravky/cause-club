import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { UsersClient } from "@/components/admin/UsersClient";
import type { Database } from "@/types/database.types";

type UserWithRelations = Database["public"]["Tables"]["users"]["Row"] & {
  charities: { name: string } | null;
  donations: { amount: number }[];
};

export default async function UsersPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: users } = await supabase
    .from("users")
    .select(`
      id,
      email,
      name,
      role,
      subscription_status,
      charity_id,
      created_at,
      charities ( name ),
      donations ( amount )
    `)
    .order("created_at", { ascending: false });

  const formattedUsers = ((users || []) as unknown as UserWithRelations[]).map((u) => ({
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role || "subscriber",
    subscription_status: u.subscription_status,
    charity_name: u.charities?.name || null,
    total_donated: (u.donations || []).reduce((sum, d) => sum + Number(d.amount), 0),
    created_at: u.created_at,
  }));

  return <UsersClient initialUsers={formattedUsers} />;
}
