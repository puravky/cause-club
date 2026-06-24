"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateCharityPercentage(percentage: number) {
  if (percentage < 10 || percentage > 100) {
    return { success: false, error: "Percentage must be between 10% and 100%" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  const { error } = await supabase
    .from("users")
    .update({ charity_percentage: percentage })
    .eq("id", user.id);

  if (error) {
    console.error("Error updating charity percentage:", error.message);
    return { success: false, error: error.message || "Failed to update contribution split" };
  }

  revalidatePath("/dashboard/charity");
  return { success: true };
}

export async function changeCharity(charityId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  const { error } = await supabase
    .from("users")
    .update({ charity_id: charityId })
    .eq("id", user.id);

  if (error) {
    console.error("Error changing charity:", error.message);
    return { success: false, error: error.message || "Failed to update charity" };
  }

  revalidatePath("/dashboard/charity");
  return { success: true };
}

export async function updateOnboardingPreferences(charityId: string, percentage: number) {
  if (percentage < 10 || percentage > 100) {
    return { success: false, error: "Percentage must be between 10% and 100%" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  const { error } = await supabase
    .from("users")
    .update({
      charity_id: charityId,
      charity_percentage: percentage,
    })
    .eq("id", user.id);

  if (error) {
    console.error("Error setting onboarding preferences:", error.message);
    return { success: false, error: error.message || "Failed to save preferences" };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/charity");
  return { success: true };
}
