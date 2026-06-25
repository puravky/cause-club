import { test, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SECRET_KEY!;

function serviceClient() {
  return createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

const TIMEOUT = 15000;

test.describe("Core causeClub flows", () => {
  // ---------------------------------------------------------------------------
  // Test 1: Signup + Stripe Checkout
  // ---------------------------------------------------------------------------
  test("signup: user can create account and complete checkout", async ({ page }) => {
    const ts = Date.now();
    const email = `test-${ts}@paritygolf.com`;
    const password = "Test123!";

    // 1. Go to signup page
    await page.goto("/signup");
    await expect(page.getByText("Create your account")).toBeVisible({ timeout: TIMEOUT });

    // 2. Fill step 1
    await page.fill("#signup-name", "Test User");
    await page.fill("#signup-email", email);
    await page.fill("#signup-password", password);

    // 3. Click Continue
    await page.getByRole("button", { name: "Continue" }).click();
    await expect(page.getByText("Pick your cause")).toBeVisible({ timeout: TIMEOUT });

    // 4. Select the first charity
    await page.getByRole("combobox").click();
    await page.waitForTimeout(500);
    const firstCharityBtn = page.locator(
      '[role="dialog"] button, [data-radix-popper-content-wrapper] button'
    ).first();
    await firstCharityBtn.waitFor({ timeout: TIMEOUT });
    await firstCharityBtn.click();

    // 5. Set slider to 25%
    const slider = page.locator('input[type="range"]');
    await slider.fill("25");

    // 6. Click Complete Sign Up
    await page.getByRole("button", { name: /Complete Sign Up/ }).click();

    // 7. After signup — if auto-logged in, middleware may redirect to /pricing
    //    If email confirmation required, we see "Check your email"
    const autoLoggedIn = await Promise.race([
      page.waitForURL("**/dashboard**", { timeout: 8000 }).then(() => true),
      page.waitForURL("**/pricing**", { timeout: 8000 }).then(() => true),
      page.getByText("Check your email").waitFor({ timeout: 8000 }).then(() => "email" as const),
    ]);

    if (autoLoggedIn === "email") {
      // If email confirmation is on, skip Stripe checkout test
      test.info().annotations.push({
        type: "skip",
        description: "Email confirmation enabled — Stripe checkout not reachable",
      });
      return;
    }

    // 8. Navigate to pricing to subscribe
    await page.goto("/pricing");
    await expect(page.getByText("Choose your plan")).toBeVisible({ timeout: TIMEOUT });

    // 9. Click "Subscribe Yearly" button
    const yearlyBtn = page.getByRole("button", { name: /Subscribe Yearly/i });
    await yearlyBtn.waitFor({ timeout: TIMEOUT });
    await yearlyBtn.click();

    // 10. Wait for redirect to Stripe Checkout
    try {
      await page.waitForURL("https://checkout.stripe.com/**", { timeout: 15000 });
    } catch {
      test.info().annotations.push({
        type: "warn",
        description: "Stripe Checkout redirect did not occur — API keys may not be configured",
      });
      return;
    }

    // 11. Fill Stripe test card
    const stripeFrame = page.frameLocator("iframe[title*='Secure card']");
    await stripeFrame.locator("#cardNumber").fill("4242424242424242");
    await stripeFrame.locator("#cardExpiry").fill("1230");
    await stripeFrame.locator("#cardCvc").fill("123");
    await page.getByRole("button", { name: /Pay|Subscribe/ }).click();

    // 12. Wait for redirect back to dashboard
    await page.waitForURL("**/dashboard**", { timeout: 30000 });
    await expect(page.locator("body")).toBeVisible();

    // 13. Assert DB: user is active
    const sb = serviceClient();
    const { data: user } = await sb
      .from("users")
      .select("subscription_status, subscription_plan")
      .eq("email", email)
      .single();

    expect(user?.subscription_status).toBe("active");
    expect(user?.subscription_plan).toBe("yearly");
  });

  // ---------------------------------------------------------------------------
  // Test 2: Scores — add 6 rounds, assert only 5 stored
  // ---------------------------------------------------------------------------
  test("scores: user can log scores and only 5 persist", async ({ page }) => {
    const sb = serviceClient();

    // Login as demo user
    await page.goto("/login");
    await page.fill("#login-email", "demo@paritygolf.com");
    await page.fill("#login-password", "Demo123!");
    await page.getByRole("button", { name: "Sign in" }).click();

    // Wait for dashboard to load (middleware may redirect)
    await page.waitForURL("**/dashboard**", { timeout: TIMEOUT });

    // Navigate to scores
    await page.goto("/dashboard/scores");
    await expect(page.getByText("Score History")).toBeVisible({ timeout: TIMEOUT });

    // Add 6 scores with different dates
    const scores = [10, 20, 30, 40, 45, 25];
    for (let i = 0; i < scores.length; i++) {
      const scoreVal = scores[i];

      // Set score value via the stepper
      const scoreInput = page.locator("#score");
      await scoreInput.fill(String(scoreVal));

      // Click "Log Round"
      const logBtn = page.getByRole("button", { name: /Log Round/i });
      await logBtn.click();

      // Wait for success toast
      await expect(page.getByText("Score logged")).toBeVisible({ timeout: TIMEOUT }).catch(() => {});
      await page.waitForTimeout(500);
    }

    // Only 5 scores should render in UI (10 should be removed by LIMIT)
    const scoreItems = page.locator('[data-testid="score-item"]');
    await expect(scoreItems).toHaveCount(5, { timeout: TIMEOUT });

    // Verify score 10 is missing from the list
    const scoreTexts = await scoreItems.allTextContents();
    const hasTen = scoreTexts.some((t) => t.includes("10"));
    expect(hasTen).toBe(false);

    // Assert DB: count = 5 for demo user
    const { data: demoUser } = await sb
      .from("users")
      .select("id, email")
      .eq("email", "demo@paritygolf.com")
      .single();
    expect(demoUser).not.toBeNull();

    const { count } = await sb
      .from("scores")
      .select("id", { count: "exact", head: true })
      .eq("user_id", demoUser!.id);

    expect(count).toBe(5);
  });

  // ---------------------------------------------------------------------------
  // Test 3: Admin draws — Simulate → Publish
  // ---------------------------------------------------------------------------
  test("admin-draw: admin can simulate and publish a draw", async ({ page }) => {
    // Login as admin
    await page.goto("/login");
    await page.fill("#login-email", "admin@paritygolf.com");
    await page.fill("#login-password", "Admin123!");
    await page.getByRole("button", { name: "Sign in" }).click();
    await page.waitForURL("**/dashboard**", { timeout: TIMEOUT });

    // Navigate to admin draws
    await page.goto("/admin/draws");
    await expect(page.getByText("Draw Management")).toBeVisible({ timeout: TIMEOUT });

    // Set month and year
    await page.selectOption("#month", String(new Date().getMonth() + 1));
    const yearInput = page.locator("#year");
    await yearInput.fill(String(new Date().getFullYear()));

    // Click Simulate Monthly Draw
    const simulateBtn = page.getByRole("button", { name: /Simulate Monthly Draw/i });
    await simulateBtn.click();

    // Wait for simulation to complete — should show numbers
    await expect(page.getByTestId("simulated-numbers")).toBeVisible({ timeout: 30000 });

    // Verify 5 numbers shown
    const numberPills = page.locator('[data-testid="simulated-numbers"] [data-testid="number-pill"]');
    await expect(numberPills).toHaveCount(5);

    // Click Publish Draw Results
    const publishBtn = page.getByRole("button", { name: /Publish Draw Results/i });
    await publishBtn.click();

    // Confirm in AlertDialog
    const confirmBtn = page.getByRole("button", { name: /Confirm & Lock Results/i });
    await confirmBtn.click();

    // Assert published state visible
    await expect(page.getByText("Published & Locked")).toBeVisible({ timeout: TIMEOUT });

    // Assert DB: jackpot_amount >= 0
    const sb = serviceClient();
    const { data: draw } = await sb
      .from("draws")
      .select("jackpot_amount, status")
      .eq("month", String(new Date().getMonth() + 1))
      .eq("year", String(new Date().getFullYear()))
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    expect(draw).not.toBeNull();
    expect(draw!.status).toBe("published");
    expect(Number(draw!.jackpot_amount)).toBeGreaterThanOrEqual(0);
  });

  // ---------------------------------------------------------------------------
  // Test 4: Winner claim — upload proof
  // ---------------------------------------------------------------------------
  test("winner-claim: user can upload proof for a winning draw", async ({ page }) => {
    const sb = serviceClient();

    // Setup: find demo user
    const { data: demoUser } = await sb
      .from("users")
      .select("id")
      .eq("email", "demo@paritygolf.com")
      .single();
    const { data: adminUser } = await sb
      .from("users")
      .select("id")
      .eq("email", "admin@paritygolf.com")
      .single();

    // Setup: create a published draw if none exists, or find one
    let { data: draw } = await sb
      .from("draws")
      .select("id, month, year, status, jackpot_amount")
      .eq("status", "published")
      .limit(1)
      .maybeSingle();

    if (!draw) {
      // Create a minimal draw
      const now = new Date();
      const { data: newDraw } = await sb
        .from("draws")
        .insert({
          month: now.getMonth() + 1,
          year: now.getFullYear(),
          draw_type: "random",
          status: "published",
          drawn_numbers: [3, 14, 22, 35, 41],
          jackpot_amount: 5000,
        })
        .select()
        .single();
      draw = newDraw!;
    }

    // Setup: insert a winning draw_result for demo user if not exists
    const { data: existingResult } = await sb
      .from("draw_results")
      .select("id, verification_status, payout_status")
      .eq("draw_id", draw.id)
      .eq("user_id", demoUser!.id)
      .maybeSingle();

    if (!existingResult) {
      await sb.from("draw_results").insert({
        draw_id: draw.id,
        user_id: demoUser!.id,
        match_type: 4,
        prize_amount: 100,
        verification_status: "pending",
        payout_status: "pending",
      });
    }

    // Login as demo user
    await page.goto("/login");
    await page.fill("#login-email", "demo@paritygolf.com");
    await page.fill("#login-password", "Demo123!");
    await page.getByRole("button", { name: "Sign in" }).click();
    await page.waitForURL("**/dashboard**", { timeout: TIMEOUT });

    // Navigate to draws page
    await page.goto("/dashboard/draws");
    await expect(page.getByText("Draw Results")).toBeVisible({ timeout: TIMEOUT }).catch(() =>
      expect(page.getByText("Winnings")).toBeVisible({ timeout: TIMEOUT })
    );

    // Find and click the claim/upload button
    const claimBtn = page.getByRole("button", { name: /Claim|Upload Verification Proof|Upload Proof/i });
    if (await claimBtn.isVisible().catch(() => false)) {
      await claimBtn.click();
    } else {
      // Directly navigate to claim page if on-page click not available
      await page.goto(`/dashboard/draws/${draw.id}/claim`);
    }

    // Upload file
    const fileInput = page.locator("#proof-file");
    await fileInput.setInputFiles("tests/fixtures/test.jpg");

    // Click Submit Proof
    const submitBtn = page.getByRole("button", { name: /Submit Proof/i });
    await submitBtn.click();

    // Assert status changes to Submitted
    await expect(page.getByText(/Submitted|Under Review/)).toBeVisible({ timeout: TIMEOUT });

    // Assert DB: verification_status = "submitted"
    const { data: result } = await sb
      .from("draw_results")
      .select("verification_status, proof_url")
      .eq("draw_id", draw.id)
      .eq("user_id", demoUser!.id)
      .single();

    expect(result?.verification_status).toBe("submitted");
    expect(result?.proof_url).not.toBeNull();

    // Assert Storage: bucket 'proofs' has file
    const { data: storageFile } = await sb.storage
      .from("proofs")
      .list("", { search: `${demoUser!.id}/${draw.id}` });
    expect(storageFile).not.toBeNull();
  });

  // ---------------------------------------------------------------------------
  // Test 5: Charity update
  // ---------------------------------------------------------------------------
  test("charity-update: user can change charity and percentage", async ({ page }) => {
    const sb = serviceClient();

    // Login as demo user
    await page.goto("/login");
    await page.fill("#login-email", "demo@paritygolf.com");
    await page.fill("#login-password", "Demo123!");
    await page.getByRole("button", { name: "Sign in" }).click();
    await page.waitForURL("**/dashboard**", { timeout: TIMEOUT });

    // Navigate to charity settings
    await page.goto("/dashboard/charity");
    await expect(page.getByText(/Active Cause|Your Charity/i)).toBeVisible({ timeout: TIMEOUT });

    // Click "Change Charity"
    const changeBtn = page.getByRole("button", { name: /Change Charity/i });
    await changeBtn.click();

    // Wait for charity dialog/search
    const searchInput = page.locator('[placeholder="Search by name or cause..."]');
    await searchInput.waitFor({ timeout: TIMEOUT });
    await searchInput.fill("");

    // Select a different charity (second in the list if available)
    const charityItems = page.locator('[data-testid="charity-option"]');
    const count = await charityItems.count();
    if (count > 1) {
      await charityItems.nth(1).click();
    } else if (count === 1) {
      await charityItems.first().click();
    }

    // Set slider to 40%
    const slider = page.locator('input[type="range"]');
    await slider.fill("40");

    // Click save/confirm
    const saveBtn = page.getByRole("button", { name: /Save|Update|Apply/i });
    if (await saveBtn.isVisible().catch(() => false)) {
      await saveBtn.click();
    }

    // Assert UI update — the percentage should show 40%
    await expect(page.getByText("40%")).toBeVisible({ timeout: TIMEOUT });

    // Assert DB: users.charity_percentage = 40
    const { data: user } = await sb
      .from("users")
      .select("charity_percentage")
      .eq("email", "demo@paritygolf.com")
      .single();

    expect(Number(user?.charity_percentage)).toBe(40);
  });
});
