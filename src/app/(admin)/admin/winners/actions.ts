"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

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

export async function reviewSubmission(id: string, approve: boolean, note?: string) {
  try {
    const supabase = await requireAdmin();

    const updateData: {
      verification_status: "approved" | "rejected";
      admin_note?: string;
      payout_status?: "pending";
    } = {
      verification_status: approve ? "approved" : "rejected",
    };

    if (note) {
      updateData.admin_note = note;
    }

    if (approve) {
      updateData.payout_status = "pending";
    }

    const { error } = await supabase
      .from("draw_results")
      .update(updateData)
      .eq("id", id);

    if (error) {
      throw error;
    }

    revalidatePath("/admin/winners");
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to review submission";
    return { success: false, error: message };
  }
}

export async function markPayoutPaid(id: string) {
  try {
    const supabase = await requireAdmin();

    // Verify it's approved first
    const { data: result } = await supabase
      .from("draw_results")
      .select("verification_status")
      .eq("id", id)
      .single();

    if (result?.verification_status !== "approved") {
      throw new Error("Cannot mark paid unless verification is approved");
    }

    const { error } = await supabase
      .from("draw_results")
      .update({
        payout_status: "paid",
      })
      .eq("id", id);

    if (error) {
      throw error;
    }

    revalidatePath("/admin/winners");
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to mark paid";
    return { success: false, error: message };
  }
}
