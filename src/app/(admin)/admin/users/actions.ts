"use server";

import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { getStripe } from "@/lib/stripe";
import { revalidatePath } from "next/cache";
import type { Database } from "@/types/database.types";

type UserWithRelations = Database["public"]["Tables"]["users"]["Row"] & {
  charities: { name: string } | null;
  donations: { amount: number }[];
};

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    throw new Error("Unauthorized");
  }

  return supabase;
}

export async function getUsers(search?: string, statusFilter?: string) {
  try {
    const supabase = await requireAdmin();

    let query = supabase
      .from("users")
      .select(`
        id, email, name, role, subscription_status, charity_id, created_at,
        charities ( name ),
        donations ( amount )
      `)
      .order("created_at", { ascending: false });

    if (search) {
      query = query.or(`email.ilike.%${search}%,name.ilike.%${search}%`);
    }

    if (statusFilter && statusFilter !== "all") {
      query = query.eq("subscription_status", statusFilter);
    }

    const { data: users, error } = await query;

    if (error) throw error;

    const formatted = ((users || []) as unknown as UserWithRelations[]).map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role || "subscriber",
      subscription_status: u.subscription_status,
      charity_id: u.charity_id,
      charity_name: u.charities?.name || null,
      total_donated: (u.donations || []).reduce((sum, d) => sum + Number(d.amount), 0),
      created_at: u.created_at,
    }));

    return { success: true, users: formatted };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch users";
    return { success: false, error: message };
  }
}

export async function cancelStripeSubscription(userId: string) {
  try {
    const supabase = await requireAdmin();

    const { data: user, error: userErr } = await supabase
      .from("users")
      .select("stripe_customer_id, email")
      .eq("id", userId)
      .single();

    if (userErr || !user) throw new Error("User not found");
    if (!user.stripe_customer_id) throw new Error("User has no Stripe customer ID");

    const stripe = getStripe();

    const subscriptions = await stripe.subscriptions.list({
      customer: user.stripe_customer_id,
      status: "active",
      limit: 10,
    });

    if (subscriptions.data.length === 0) {
      throw new Error("No active subscriptions found for this user");
    }

    for (const sub of subscriptions.data) {
      await stripe.subscriptions.cancel(sub.id);
    }

    const { error: updateErr } = await supabase
      .from("users")
      .update({ subscription_status: "cancelled" })
      .eq("id", userId);

    if (updateErr) throw updateErr;

    revalidatePath("/admin/users");

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to cancel subscription";
    return { success: false, error: message };
  }
}

export async function createAdminSession(userId: string) {
  try {
    await requireAdmin();

    if (process.env.NODE_ENV !== "development") {
      throw new Error("Impersonation is only available in development mode");
    }

    const serviceClient = createServiceClient();

    const { data, error } = await (serviceClient.auth.admin as unknown as {
      createSession: (params: { user_id: string }) => Promise<{ data: { access_token: string } | null; error: Error | null }>;
    }).createSession({
      user_id: userId,
    });

    if (error) throw error;

    return { success: true, session: data };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create admin session";
    return { success: false, error: message };
  }
}

export async function exportUsersCSV() {
  try {
    const supabase = await requireAdmin();

    const { data: users, error } = await supabase
      .from("users")
      .select(`
        id, email, name, role, subscription_status, charity_id, created_at,
        charities ( name ),
        donations ( amount )
      `)
      .order("created_at", { ascending: false });

    if (error) throw error;

    const rows = ((users || []) as unknown as UserWithRelations[]).map((u) => {
      const charityName = u.charities?.name || "";
      const totalDonated = (u.donations || []).reduce((sum, d) => sum + Number(d.amount), 0);
      const escapedEmail = u.email.replace(/"/g, '""');
      const escapedName = (u.name || "").replace(/"/g, '""');
      const escapedCharity = charityName.replace(/"/g, '""');
      return `"${escapedEmail}","${escapedName}","${u.role}","${u.subscription_status || ""}","${escapedCharity}",${totalDonated},"${u.created_at}"`;
    });

    const header = '"Email","Name","Role","Subscription Status","Charity","Total Donated","Joined Date"';
    const csv = [header, ...rows].join("\n");

    return { success: true, csv };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to export users";
    return { success: false, error: message };
  }
}
