#!/usr/bin/env bun
/**
 * security-check.ts
 *
 * 3 checks:
 *   1. Secret scan — look for hardcoded keys/credentials in source
 *   2. RLS policy check — try direct table read as anon user
 *   3. Webhook signature validation — POST to stripe/webhook without signature
 */

import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { createClient } from "@supabase/supabase-js";

interface CheckResult {
  name: string;
  passed: boolean;
  detail: string;
}

function* walkSync(dir: string): Generator<string> {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      if (!entry.startsWith(".") && entry !== "node_modules") {
        yield* walkSync(full);
      }
    } else if (/\.(ts|tsx|js|jsx|mjs|cjs)$/.test(entry)) {
      yield full;
    }
  }
}

async function secretScan(): Promise<CheckResult> {
  const sourceDirs = ["src"].filter(existsSync);
  const secrets: string[] = [];

  for (const dir of sourceDirs) {
    for (const file of walkSync(dir)) {
      const content = readFileSync(file, "utf-8");

      // Catch likely hardcoded secrets (not env var references)
      const patterns = [
        /sk_live_[A-Za-z0-9]{10,}/,
        /pk_live_[A-Za-z0-9]{10,}/,
        /SUPABASE_SECRET_KEY\s*[:=]\s*["'][^"']+["']/,
        /STRIPE_SECRET_KEY\s*[:=]\s*["'][^"']+["']/,
        /STRIPE_WEBHOOK_SECRET\s*[:=]\s*["'][^"']+["']/,
        /RESEND_API_KEY\s*[:=]\s*["'][^"']+["']/,
        /CRON_SECRET\s*[:=]\s*["'][^"']+["']/,
        /secret_key.*["'][^"']+["']/i,
      ];

      for (const re of patterns) {
        const match = content.match(re);
        if (match) {
          secrets.push(`${file}: ${match[0].slice(0, 60)}`);
        }
      }
    }
  }

  return {
    name: "Secret scan",
    passed: secrets.length === 0,
    detail:
      secrets.length === 0
        ? "No hardcoded secrets found in source files"
        : `Found ${secrets.length} potential secret(s):\n${secrets.join("\n")}`,
  };
}

async function rlsCheck(): Promise<CheckResult> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !anonKey) {
    return {
      name: "RLS policy check",
      passed: false,
      detail: "NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY not set",
    };
  }

  const anonClient = createClient(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const tables = ["users", "scores", "draws", "draw_results", "payments"];

  try {
    const { error } = await anonClient.from("users").select("id").limit(1);
    // If the query succeeds (anon can read users), RLS may be missing or too permissive
    return {
      name: "RLS policy check",
      passed: error !== null,
      detail: error
        ? "RLS blocks anon reads (expected)"
        : "WARNING: anon client can read from users table — RLS may be missing or permissive",
    };
  } catch (err) {
    return {
      name: "RLS policy check",
      passed: false,
      detail: `Error during RLS check: ${err}`,
    };
  }
}

async function webhookValidationCheck(): Promise<CheckResult> {
  const baseUrl = process.env.BASE_URL || "http://localhost:3000";
  const url = `${baseUrl}/api/stripe/webhook`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ test: true }),
    });

    const passed = response.status === 400;
    return {
      name: "Webhook signature validation",
      passed,
      detail: passed
        ? `Webhook returns ${response.status} without signature (expected)`
        : `Webhook returned ${response.status} instead of 400`,
    };
  } catch (err) {
    return {
      name: "Webhook signature validation",
      passed: false,
      detail: `Could not reach webhook endpoint at ${url}: ${err}`,
    };
  }
}

async function main() {
  const checks: CheckResult[] = await Promise.all([
    secretScan(),
    rlsCheck(),
    webhookValidationCheck(),
  ]);

  let allPassed = true;
  console.log("\n--- Security Check Results ---\n");

  for (const c of checks) {
    const symbol = c.passed ? "PASS" : "FAIL";
    console.log(`  [${symbol}] ${c.name}`);
    if (!c.passed) allPassed = false;
    console.log(`          ${c.detail}\n`);
  }

  console.log(`Summary: ${checks.filter((c) => c.passed).length}/${checks.length} passed\n`);

  if (!allPassed) {
    console.error("Some checks failed. Review details above.");
    process.exit(1);
  }
}

main();
