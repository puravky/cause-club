# causeClub Test Suite

## Prerequisites

- Node 18+ with `npm`
- `bun` (for security checks)
- Playwright browsers installed (`npx playwright install chromium`)
- Supabase project with test users seeded
- Stripe test keys configured in `.env`
- A running production build on port 3000

## Required env vars (`.env`)

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_YEARLY=
STRIPE_PRICE_MONTHLY=
NEXT_PUBLIC_BASE_URL=http://localhost:3000
CRON_SECRET=
RESEND_API_KEY=
```

## Test users (must exist in Supabase)

| Email | Password | Role |
|-------|----------|------|
| `demo@paritygolf.com` | `Demo123!` | regular user |
| `admin@paritygolf.com` | `Admin123!` | admin |

## Running tests

### E2E (Playwright)

```bash
npm run test:e2e
```

Runs all specs in `tests/e2e/`. Configuration in `playwright.config.ts`.

### Security checks

```bash
npm run test:security
```

Scans source for hardcoded secrets, verifies RLS blocks anon reads, and checks that the Stripe webhook endpoint rejects unsigned requests.

### Lighthouse CI

```bash
npm run test:lh
```

Runs Lighthouse against the production build. Asserts accessibility=100, performance≥90.

### Full pipeline

```bash
npm run verify
```

Sequential: build → security → e2e → lighthouse. Exits on first failure.

## Test coverage

| Test | What it covers |
|------|---------------|
| signup | Account creation, charity picker, Stripe Checkout, subscription status in DB |
| scores | Log 6 rounds, verify only 5 persist (LIMIT enforcement) |
| admin-draw | Simulate monthly draw, publish, assert draw status in DB |
| winner-claim | Upload proof file, verify verification_status + proof_url in DB + storage bucket |
| charity-update | Change charity, update percentage slider, verify charity_percentage in DB |

## Test file structure

```
tests/
  fixtures/
    test.jpg              # placeholder JPEG for proof upload
  e2e/
    flows.spec.ts         # all 5 test specs
scripts/
  security-check.ts       # 3 security checks
  verify-all.sh           # CI pipeline runner
lighthouserc.js           # Lighthouse CI config
playwright.config.ts      # Playwright config (webServer, 1 worker, retries)
```
