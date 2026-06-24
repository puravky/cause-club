"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import crypto from "crypto";

// Helper to generate a secure random integer between min and max inclusive
function getRandomInt(min: number, max: number): number {
  const range = max - min + 1;
  const bytes = crypto.randomBytes(4);
  const val = bytes.readUInt32BE(0);
  return min + (val % range);
}

// A. Calculate prize pool breakdown and rollovers
export async function calculatePrizePool(month: number, year: number) {
  const supabase = await createClient();

  const startOfMonth = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
  const startOfMonthStr = startOfMonth.toISOString();

  // Get active subscriptions where status = 'active' and current_period_end >= start of month
  const { data: subs, error: subsErr } = await supabase
    .from("subscriptions")
    .select("plan")
    .eq("status", "active")
    .gte("current_period_end", startOfMonthStr);

  if (subsErr) {
    console.error("Error fetching subscriptions for prize pool calculation:", subsErr.message);
  }

  let basePool = 0;
  const activeSubs = subs || [];
  activeSubs.forEach((sub) => {
    if (sub.plan === "monthly") {
      basePool += 9.99 * 0.5; // £4.995
    } else if (sub.plan === "yearly") {
      basePool += (89.99 / 12) * 0.5; // £3.749...
    }
  });

  // Query previous draws to check for carryover jackpots
  const { data: allDraws, error: drawsErr } = await supabase
    .from("draws")
    .select("id, month, year, status")
    .order("year", { ascending: false })
    .order("month", { ascending: false });

  if (drawsErr) {
    console.error("Error fetching all draws for carryover checks:", drawsErr.message);
  }

  // Find the immediate previous draw relative to target month/year
  const prevDraw = (allDraws || []).find((d) => {
    return d.year < year || (d.year === year && d.month < month);
  });

  let jackpotCarry = 0;
  if (prevDraw) {
    // Check if there was a 5-match winner in the previous draw
    const { count, error: winnerErr } = await supabase
      .from("draw_results")
      .select("id", { count: "exact", head: true })
      .eq("draw_id", prevDraw.id)
      .eq("match_type", 5);

    if (winnerErr) {
      console.error("Error checking winner for previous draw:", winnerErr.message);
    }

    if (!winnerErr && count === 0) {
      // No 5-match winner -> carry over its tier 5 pool amount
      const { data: prevPool, error: poolErr } = await supabase
        .from("prize_pool")
        .select("tier_5_amount")
        .eq("draw_id", prevDraw.id)
        .maybeSingle();

      if (poolErr) {
        console.error("Error fetching previous draw prize pool:", poolErr.message);
      }

      if (prevPool) {
        jackpotCarry = Number(prevPool.tier_5_amount);
      }
    }
  }

  const total = basePool + jackpotCarry;
  // Prize splits: 5-match 40%, 4-match 35%, 3-match 25%
  const tier5 = total * 0.40;
  const tier4 = total * 0.35;
  const tier3 = total * 0.25;

  return {
    total: Number(total.toFixed(2)),
    tier5: Number(tier5.toFixed(2)),
    tier4: Number(tier4.toFixed(2)),
    tier3: Number(tier3.toFixed(2)),
    jackpotCarry: Number(jackpotCarry.toFixed(2)),
    basePool: Number(basePool.toFixed(2)),
  };
}

// B. Generate 5 unique numbers 1-45 (random or algorithmic weightings)
export async function generateDrawNumbers(type: "random" | "algorithm_most" | "algorithm_least") {
  const supabase = await createClient();

  if (type === "random") {
    const numbers = new Set<number>();
    while (numbers.size < 5) {
      numbers.add(getRandomInt(1, 45));
    }
    return Array.from(numbers).sort((a, b) => a - b);
  }

  // Algorithmic weighting: query scores logged in the last 90 days
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  const ninetyDaysAgoStr = ninetyDaysAgo.toISOString().split("T")[0];

  const { data: scoresData, error: scoresErr } = await supabase
    .from("scores")
    .select("score")
    .gte("date", ninetyDaysAgoStr);

  if (scoresErr) {
    console.error("Error fetching 90-day scores for weighted algorithm:", scoresErr.message);
  }

  // Count frequencies of each number 1 to 45
  const frequencies: Record<number, number> = {};
  for (let i = 1; i <= 45; i++) {
    frequencies[i] = 0;
  }
  if (scoresData) {
    scoresData.forEach((s) => {
      const val = Number(s.score);
      if (val >= 1 && val <= 45) {
        frequencies[val] = (frequencies[val] || 0) + 1;
      }
    });
  }

  const items = Array.from({ length: 45 }, (_, i) => i + 1);
  let weights: number[] = [];

  if (type === "algorithm_most") {
    // weight = count + 1
    weights = items.map((num) => (frequencies[num] || 0) + 1);
  } else {
    // algorithm_least: weight = 1 / (count + 1)
    weights = items.map((num) => 1 / ((frequencies[num] || 0) + 1));
  }

  // Perform weighted sampling without replacement to get 5 unique numbers
  const chosen = new Set<number>();
  while (chosen.size < 5) {
    let totalWeight = 0;
    const availableItems: number[] = [];
    const availableWeights: number[] = [];

    for (let i = 0; i < items.length; i++) {
      if (!chosen.has(items[i])) {
        availableItems.push(items[i]);
        availableWeights.push(weights[i]);
        totalWeight += weights[i];
      }
    }

    if (totalWeight <= 0) {
      // Fallback if weights are 0
      for (let i = 0; i < items.length; i++) {
        if (!chosen.has(items[i])) {
          chosen.add(items[i]);
          if (chosen.size === 5) break;
        }
      }
      break;
    }

    const r = Math.random() * totalWeight;
    let sum = 0;
    for (let i = 0; i < availableItems.length; i++) {
      sum += availableWeights[i];
      if (r <= sum) {
        chosen.add(availableItems[i]);
        break;
      }
    }
  }

  return Array.from(chosen).sort((a, b) => a - b);
}

// C. Simulate Draw
export async function simulateDraw({
  month,
  year,
  drawType,
}: {
  month: number;
  year: number;
  drawType: "random" | "algorithm_most" | "algorithm_least";
}) {
  const supabase = await createClient();

  const startOfMonth = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
  const startOfMonthStr = startOfMonth.toISOString();

  // 1. Get active subscriptions in the target month
  const { data: subs, error: subsErr } = await supabase
    .from("subscriptions")
    .select("user_id")
    .eq("status", "active")
    .gte("current_period_end", startOfMonthStr);

  if (subsErr) {
    return { success: false, error: "Failed to fetch active subscriptions: " + subsErr.message };
  }

  if (!subs || subs.length === 0) {
    return { success: false, error: "Cannot run draw with 0 subscribers" };
  }

  const userIds = subs.map((s) => s.user_id);

  // 2. Prevent re-simulating locked published draws
  const { data: existingDraw, error: existErr } = await supabase
    .from("draws")
    .select("id, status")
    .eq("month", month)
    .eq("year", year)
    .maybeSingle();

  if (existErr) {
    return { success: false, error: "Failed to check existing draws: " + existErr.message };
  }

  if (existingDraw) {
    if (existingDraw.status === "published") {
      return { success: false, error: "Cannot re-simulate a published draw. It is locked." };
    }
    // Delete old simulated draw. Trigger cascade will delete past results/prize pools
    const { error: delErr } = await supabase
      .from("draws")
      .delete()
      .eq("id", existingDraw.id);

    if (delErr) {
      return { success: false, error: "Failed to clear existing simulated draw: " + delErr.message };
    }
  }

  // 3. Compute prize pool & generate winning numbers
  const prizePoolData = await calculatePrizePool(month, year);
  const drawnNumbers = await generateDrawNumbers(drawType);

  // 4. Create new draw entry
  const dbDrawType = drawType === "random" ? "random" : "algorithm";
  const { data: newDraw, error: drawCreateErr } = await supabase
    .from("draws")
    .insert({
      month,
      year,
      draw_type: dbDrawType,
      status: "simulated",
      drawn_numbers: drawnNumbers,
      jackpot_amount: prizePoolData.jackpotCarry,
    })
    .select()
    .single();

  if (drawCreateErr || !newDraw) {
    return { success: false, error: "Failed to insert draw: " + drawCreateErr?.message };
  }

  // 5. Create prize pool entry
  const { error: poolCreateErr } = await supabase
    .from("prize_pool")
    .insert({
      draw_id: newDraw.id,
      total_amount: prizePoolData.total,
      tier_3_amount: prizePoolData.tier3,
      tier_4_amount: prizePoolData.tier4,
      tier_5_amount: prizePoolData.tier5,
      jackpot_carried_over: prizePoolData.jackpotCarry,
    });

  if (poolCreateErr) {
    return { success: false, error: "Failed to record prize pool: " + poolCreateErr.message };
  }

  // 6. Fetch user scores
  const { data: scoresData, error: scoresFetchErr } = await supabase
    .from("scores")
    .select("user_id, score")
    .in("user_id", userIds)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  if (scoresFetchErr) {
    return { success: false, error: "Failed to fetch subscriber scores: " + scoresFetchErr.message };
  }

  // Group scores by user id (caps at latest 5 per database setup)
  const userScores: Record<string, number[]> = {};
  (scoresData || []).forEach((row) => {
    const uid = row.user_id;
    if (!userScores[uid]) {
      userScores[uid] = [];
    }
    if (userScores[uid].length < 5) {
      userScores[uid].push(row.score);
    }
  });

  // Evaluate matching scores
  const winners: { user_id: string; matches: number }[] = [];
  userIds.forEach((uid) => {
    const scores = userScores[uid] || [];
    let matchCount = 0;
    scores.forEach((s) => {
      if (drawnNumbers.includes(s)) {
        matchCount++;
      }
    });

    if (matchCount >= 3) {
      winners.push({ user_id: uid, matches: matchCount });
    }
  });

  // 7. Insert draw results with initial prize amount = 0
  if (winners.length > 0) {
    const resultsPayload = winners.map((w) => ({
      draw_id: newDraw.id,
      user_id: w.user_id,
      match_type: w.matches,
      prize_amount: 0,
      verification_status: "pending",
      payout_status: "pending",
    }));

    const { error: resultsInsertErr } = await supabase
      .from("draw_results")
      .insert(resultsPayload);

    if (resultsInsertErr) {
      return { success: false, error: "Failed to record winners: " + resultsInsertErr.message };
    }
  }

  // Evaluate splits for each tier and update database
  const tier3Winners = winners.filter((w) => w.matches === 3);
  const tier4Winners = winners.filter((w) => w.matches === 4);
  const tier5Winners = winners.filter((w) => w.matches === 5);

  // Tier 5 (Jackpot)
  if (tier5Winners.length > 0) {
    const tier5Prize = Number((prizePoolData.tier5 / tier5Winners.length).toFixed(2));
    const { error } = await supabase
      .from("draw_results")
      .update({ prize_amount: tier5Prize })
      .eq("draw_id", newDraw.id)
      .eq("match_type", 5);

    if (error) return { success: false, error: error.message };
  } else {
    // If no 5-match jackpot winners, roll over tier 5 amount
    const { error } = await supabase
      .from("draws")
      .update({ jackpot_amount: prizePoolData.tier5 })
      .eq("id", newDraw.id);

    if (error) return { success: false, error: error.message };
    newDraw.jackpot_amount = prizePoolData.tier5;
  }

  // Tier 4
  if (tier4Winners.length > 0) {
    const tier4Prize = Number((prizePoolData.tier4 / tier4Winners.length).toFixed(2));
    const { error } = await supabase
      .from("draw_results")
      .update({ prize_amount: tier4Prize })
      .eq("draw_id", newDraw.id)
      .eq("match_type", 4);

    if (error) return { success: false, error: error.message };
  }

  // Tier 3
  if (tier3Winners.length > 0) {
    const tier3Prize = Number((prizePoolData.tier3 / tier3Winners.length).toFixed(2));
    const { error } = await supabase
      .from("draw_results")
      .update({ prize_amount: tier3Prize })
      .eq("draw_id", newDraw.id)
      .eq("match_type", 3);

    if (error) return { success: false, error: error.message };
  }

  // Retrieve full winners details for terminal logs
  const { data: resultsDetails, error: detailsErr } = await supabase
    .from("draw_results")
    .select(`
      id,
      user_id,
      match_type,
      prize_amount,
      user:users(email, name)
    `)
    .eq("draw_id", newDraw.id);

  if (detailsErr) {
    return { success: false, error: "Failed to compile winner details: " + detailsErr.message };
  }

  interface DbWinnerInfo {
    id: string;
    user_id: string;
    match_type: number;
    prize_amount: number;
    user: {
      email: string;
      name: string | null;
    } | null;
  }

  const formattedWinners = ((resultsDetails as unknown as DbWinnerInfo[]) || []).map((w) => ({
    id: w.id,
    match_type: w.match_type,
    prize_amount: Number(w.prize_amount),
    email: w.user?.email || "unknown@user.com",
    name: w.user?.name || "Unknown User",
    scores: userScores[w.user_id] || [],
  }));

  revalidatePath("/admin/draws");
  revalidatePath("/dashboard/draws");

  return {
    success: true,
    draw: {
      id: newDraw.id,
      month: newDraw.month,
      year: newDraw.year,
      draw_type: newDraw.draw_type,
      status: newDraw.status,
      drawn_numbers: newDraw.drawn_numbers || [],
      jackpot_amount: Number(newDraw.jackpot_amount),
    },
    prizePool: {
      total: prizePoolData.total,
      tier3: prizePoolData.tier3,
      tier4: prizePoolData.tier4,
      tier5: prizePoolData.tier5,
      jackpotCarry: prizePoolData.jackpotCarry,
    },
    winners: formattedWinners,
  };
}

// D. Publish simulated draw results
export async function publishDraw(drawId: string) {
  const supabase = await createClient();

  const { data: draw, error: fetchErr } = await supabase
    .from("draws")
    .select("id, status")
    .eq("id", drawId)
    .maybeSingle();

  if (fetchErr || !draw) {
    return { success: false, error: "Draw not found" };
  }

  if (draw.status === "published") {
    return { success: false, error: "Draw is already published" };
  }

  const { error: updateErr } = await supabase
    .from("draws")
    .update({ status: "published" })
    .eq("id", drawId);

  if (updateErr) {
    return { success: false, error: "Failed to publish draw: " + updateErr.message };
  }

  revalidatePath("/admin/draws");
  revalidatePath("/admin");
  revalidatePath("/dashboard/draws");
  revalidatePath("/dashboard");

  return { success: true };
}
