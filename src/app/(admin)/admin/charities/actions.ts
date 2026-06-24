"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { Json } from "@/types/database.types";

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

export async function addCharity(data: {
  name: string;
  description?: string;
  logo_url?: string;
  website?: string;
  stripe_account_id?: string;
  featured?: boolean;
  events?: Json;
  images?: string[];
}) {
  try {
    const supabase = await requireAdmin();

    const { error } = await supabase
      .from("charities")
      .insert({
        name: data.name,
        description: data.description,
        logo_url: data.logo_url,
        website: data.website,
        stripe_account_id: data.stripe_account_id,
        featured: data.featured || false,
        events: data.events || [],
        images: data.images || [],
      });

    if (error) throw error;

    revalidatePath("/admin/charities");
    revalidatePath("/charities");
    revalidatePath("/");
    
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to add charity";
    return { success: false, error: message };
  }
}

export async function updateCharity(id: string, data: {
  name?: string;
  description?: string;
  logo_url?: string;
  website?: string;
  stripe_account_id?: string;
  featured?: boolean;
  events?: Json;
  images?: string[];
}) {
  try {
    const supabase = await requireAdmin();

    const { error } = await supabase
      .from("charities")
      .update(data)
      .eq("id", id);

    if (error) throw error;

    revalidatePath("/admin/charities");
    revalidatePath("/charities");
    revalidatePath(`/charities/${id}`);
    revalidatePath("/");

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update charity";
    return { success: false, error: message };
  }
}

export async function deleteCharity(id: string) {
  try {
    const supabase = await requireAdmin();

    const { error } = await supabase
      .from("charities")
      .delete()
      .eq("id", id);

    if (error) throw error;

    revalidatePath("/admin/charities");
    revalidatePath("/charities");
    
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to delete charity";
    return { success: false, error: message };
  }
}
