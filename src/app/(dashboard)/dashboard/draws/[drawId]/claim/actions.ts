"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function submitClaim(drawId: string, proofUrl: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  // Update draw_results
  const { error } = await supabase
    .from("draw_results")
    .update({
      proof_url: proofUrl,
      verification_status: "submitted",
    })
    .eq("draw_id", drawId)
    .eq("user_id", user.id)
    .eq("verification_status", "pending");

  if (error) {
    console.error("Error submitting claim:", error.message);
    return { success: false, error: "Failed to submit claim" };
  }

  revalidatePath(`/dashboard/draws`);
  revalidatePath(`/dashboard/draws/${drawId}/claim`);
  
  return { success: true };
}
