import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { calculatePrizePool, simulateDraw, publishDraw } from "@/app/(admin)/admin/draws/actions";

export const dynamic = 'force-dynamic';

export async function GET() {
  const logs: string[] = [];
  const log = (...args: unknown[]) => {
    const msg = args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ');
    console.log(msg);
    logs.push(msg);
  };

  try {
    log("=== STARTING DRAW ENGINE TESTING ===");

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // 1. Clean up existing test users if any
    log("Cleaning up previous test accounts...");
    const { data: usersList, error: listErr } = await supabase.auth.admin.listUsers();
    if (listErr) {
      throw new Error("Error listing users: " + listErr.message);
    }

    const testAuthUsers = (usersList?.users || []).filter(
      (u) => u.email?.startsWith("test") && u.email?.endsWith("@causeclub.com")
    );

    for (const u of testAuthUsers) {
      await supabase.auth.admin.deleteUser(u.id);
    }
    log(`Deleted ${testAuthUsers.length} old test accounts.`);

    // 2. Create 3 test subscribers
    log("Creating 3 test subscribers...");
    const testEmails = ["test1@causeclub.com", "test2@causeclub.com", "test3@causeclub.com"];
    const userIds: string[] = [];

    for (let i = 0; i < testEmails.length; i++) {
      const email = testEmails[i];
      const { data: authUser, error: authErr } = await supabase.auth.admin.createUser({
        email,
        password: "password123",
        email_confirm: true,
      });

      if (authErr || !authUser.user) {
        throw new Error(`Failed to create auth user ${email}: ` + authErr?.message);
      }

      const userId = authUser.user.id;
      userIds.push(userId);

      // Insert into public.users
      const { error: publicErr } = await supabase.from("users").insert({
        id: userId,
        email,
        name: `Test User ${i + 1}`,
        role: "subscriber",
        subscription_status: "active",
        subscription_plan: "monthly",
      });

      if (publicErr) {
        throw new Error(`Failed to create public user for ${email}: ` + publicErr.message);
      }

      // Insert active subscription
      const oneMonthFuture = new Date();
      oneMonthFuture.setMonth(oneMonthFuture.getMonth() + 1);

      const { error: subErr } = await supabase.from("subscriptions").insert({
        user_id: userId,
        stripe_subscription_id: `sub_mock_${userId}`,
        plan: "monthly",
        status: "active",
        current_period_end: oneMonthFuture.toISOString(),
      });

      if (subErr) {
        throw new Error(`Failed to create subscription for ${email}: ` + subErr.message);
      }
    }
    log("Successfully created 3 test users and active subscriptions.");

    // 3. Give them initial scores (Stableford 1-45)
    log("Seeding round scores...");
    const initialScores = [
      { userId: userIds[0], scores: [10, 15, 20, 25, 30] }, // test1
      { userId: userIds[1], scores: [11, 16, 21, 26, 31] }, // test2
      { userId: userIds[2], scores: [12, 17, 22, 27, 32] }, // test3
    ];

    for (const item of initialScores) {
      for (let idx = 0; idx < item.scores.length; idx++) {
        const score = item.scores[idx];
        const { error: scoreErr } = await supabase.from("scores").insert({
          user_id: item.userId,
          score,
          date: `2026-06-0${idx + 1}`,
        });

        if (scoreErr) {
          throw new Error(`Failed to insert score ${score} for ${item.userId}: ` + scoreErr.message);
        }
      }
    }
    log("Seeded 5 scores per test user.");

    // 4. Run simulate with Random - verify 5 unique numbers 1-45
    log("Running simulation 1 (Random draw)...");
    const sim1 = await simulateDraw({ month: 6, year: 2026, drawType: "random" });
    if (!sim1.success || !sim1.draw) {
      throw new Error("Simulation 1 failed: " + sim1.error);
    }

    const winningNumbers = sim1.draw.drawn_numbers;
    log("Generated winning numbers:", winningNumbers);

    // Verification checks for numbers
    const uniqueNumbers = new Set(winningNumbers);
    if (winningNumbers.length !== 5 || uniqueNumbers.size !== 5) {
      throw new Error("FAIL: Drawn numbers must contain exactly 5 unique integers.");
    }
    const inRange = winningNumbers.every((n: number) => n >= 1 && n <= 45);
    if (!inRange) {
      throw new Error("FAIL: Drawn numbers must be between 1 and 45.");
    }
    log("SUCCESS: 5 unique numbers between 1-45 generated.");

    // 5. Adjust test1 scores to match exactly 3 numbers of winning numbers
    log("Modifying test1 scores to match exactly 3 winning numbers...");
    const matchedNumbers = winningNumbers.slice(0, 3); // take first 3 winning numbers
    const unmatchedNumbers = [1, 2, 3, 4, 5].filter((n) => !winningNumbers.includes(n)).slice(0, 2); // get 2 non-winning numbers

    const targetScores = [...matchedNumbers, ...unmatchedNumbers];
    log(`Setting test1 scores to: ${targetScores} (Matches: ${matchedNumbers})`);

    // Clear existing scores for test1
    await supabase.from("scores").delete().eq("user_id", userIds[0]);

    // Insert new scores matching target
    for (let idx = 0; idx < targetScores.length; idx++) {
      const score = targetScores[idx];
      const { error: scoreErr } = await supabase.from("scores").insert({
        user_id: userIds[0],
        score,
        date: `2026-06-1${idx + 1}`,
      });

      if (scoreErr) {
        throw new Error(`Failed to insert matching score ${score}: ` + scoreErr.message);
      }
    }

    // 6. Run simulation again - verify test1 appears in Tier 3
    log("Re-running simulation for June 2026...");
    const sim2 = await simulateDraw({ month: 6, year: 2026, drawType: "random" });
    if (!sim2.success || !sim2.winners) {
      throw new Error("Simulation 2 failed: " + sim2.error);
    }

    // Verify test1 won Tier 3
    const winner1 = sim2.winners.find((w) => w.email === "test1@causeclub.com");
    if (!winner1) {
      throw new Error("FAIL: test1@causeclub.com did not qualify as a winner.");
    }

    if (winner1.match_type !== 3) {
      throw new Error(`FAIL: Expected 3 matches for test1, got ${winner1.match_type}`);
    }

    log(`SUCCESS: test1 won Tier 3! Prize amount: £${winner1.prize_amount}`);

    // 7. Verify no 5-match jackpot winner, and verify carry over rollover in July 2026 pool
    const jackpotWinners = sim2.winners.filter((w) => w.match_type === 5);
    log(`Jackpot (Tier 5) Winners: ${jackpotWinners.length}`);

    if (jackpotWinners.length === 0) {
      log("No jackpot winner. Checking rollover carry for next month...");
      const julyPool = await calculatePrizePool(7, 2026);
      log("July 2026 Prize Pool breakdown:", julyPool);

      const expectedCarry = sim2.prizePool.tier5;
      if (Math.abs(julyPool.jackpotCarry - expectedCarry) > 0.01) {
        throw new Error(`FAIL: July jackpot carry over (£${julyPool.jackpotCarry}) does not match simulated June Tier 5 pool (£${expectedCarry})`);
      }
      log(`SUCCESS: Rollover carried over £${julyPool.jackpotCarry} to July jackpot!`);
    } else {
      log("Warning: test scores accidentally matched 5 winning numbers. Carry over test skipped.");
    }

    // 8. Publish the draw and verify state changes to published
    log("Publishing June 2026 draw...");
    const publishRes = await publishDraw(sim2.draw.id);
    if (!publishRes.success) {
      throw new Error("Publish failed: " + publishRes.error);
    }

    // Fetch draw state to confirm
    const { data: finalDraw, error: drawErr } = await supabase
      .from("draws")
      .select("status")
      .eq("id", sim2.draw.id)
      .single();

    if (drawErr || !finalDraw) {
      throw new Error("Failed to query final draw state: " + drawErr?.message);
    }

    if (finalDraw.status !== "published") {
      throw new Error(`FAIL: Expected status 'published', got '${finalDraw.status}'`);
    }

    log("SUCCESS: Draw status updated to 'published' in database.");

    // Clean up test data
    log("Cleaning up test accounts from database...");
    for (const uid of userIds) {
      await supabase.auth.admin.deleteUser(uid);
    }
    log("Clean up finished.");
    log("=== ALL TEST RUNS PASSED SUCCESSFULLY ===");

    return NextResponse.json({ success: true, logs });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    log("ERROR IN TESTS:", errorMsg);
    return NextResponse.json({ success: false, error: errorMsg, logs }, { status: 500 });
  }
}
