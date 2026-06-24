"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const scoreSchema = z.object({
  score: z.number().int().min(1, "Score must be at least 1").max(45, "Score cannot exceed 45"),
  date: z.coerce.date().max(new Date(), "Date cannot be in the future"),
});

export async function getScores() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { data, error } = await supabase
    .from("scores")
    .select("id, score, date, created_at")
    .eq("user_id", user.id)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(5);

  if (error) {
    console.error("Error fetching scores:", error.message);
    return [];
  }

  return (data || []).map((s) => ({
    id: s.id,
    score: s.score,
    date: s.date,
    created_at: s.created_at,
  }));
}

export async function createScore(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  const rawScore = formData.get("score");
  const rawDate = formData.get("date");

  if (!rawScore || !rawDate) {
    return { success: false, error: "Score and Date are required fields." };
  }

  // Parse values
  const scoreParsed = parseInt(rawScore as string, 10);
  const dateParsed = new Date(rawDate as string);

  // Validate with Zod
  const validation = scoreSchema.safeParse({ score: scoreParsed, date: dateParsed });
  if (!validation.success) {
    const errorMsg = validation.error.issues[0]?.message || "Validation failed";
    return { success: false, error: errorMsg };
  }

  // Format date to YYYY-MM-DD to store consistently in database
  const formattedDate = dateParsed.toISOString().split("T")[0];

  try {
    // Check pre-insert count to alert client about auto-delete behavior
    const { count, error: countErr } = await supabase
      .from("scores")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id);

    if (countErr) {
      return { success: false, error: countErr.message };
    }

    const preCount = count || 0;

    // Perform database insert
    const { error: insertErr } = await supabase.from("scores").insert({
      user_id: user.id,
      score: scoreParsed,
      date: formattedDate,
    });

    if (insertErr) {
      if (insertErr.code === "23505") {
        return { success: false, error: "You already have a score for this date" };
      }
      return { success: false, error: insertErr.message };
    }

    revalidatePath("/dashboard/scores");
    
    // If user already had 5 scores, inserting a 6th will activate trigger delete
    return { success: true, oldestRemoved: preCount >= 5 };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: message };
  }
}

export async function updateScore(id: string, scoreVal: number, dateVal: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  // Parse and validate with Zod
  const scoreParsed = typeof scoreVal === "string" ? parseInt(scoreVal, 10) : scoreVal;
  const dateParsed = new Date(dateVal);

  const validation = scoreSchema.safeParse({ score: scoreParsed, date: dateParsed });
  if (!validation.success) {
    const errorMsg = validation.error.issues[0]?.message || "Validation failed";
    return { success: false, error: errorMsg };
  }

  const formattedDate = dateParsed.toISOString().split("T")[0];

  const { error } = await supabase
    .from("scores")
    .update({
      score: scoreParsed,
      date: formattedDate,
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    if (error.code === "23505") {
      return { success: false, error: "You already have a score for this date" };
    }
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard/scores");
  return { success: true };
}

export async function deleteScore(id: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  const { error } = await supabase
    .from("scores")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard/scores");
  return { success: true };
}
