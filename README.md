# causeClub. Play. Win. Give.

Monthly prize draw where 10% of every subscription goes to the charity you choose. Built for the Digital Heroes internship program.

**Live:** https://cause-club.vercel.app  
**60s Demo:** [Loom link]  
**GitHub:** [repo link]

---

## Test Credentials

Use these to test the full flow instantly. Stripe in test mode.

| Role | Email | Password | Notes |
| --- | --- | --- | --- |
| User | demo@causeclub.com | Demo123! | Active subscription, 5 scores, won last draw |
| Admin | admin@causeclub.com | Admin123! | Access /admin to simulate draws |

**Stripe test card:** 4242 4242 4242 4242. Any future expiry. Any CVC.

---

## Core User Flows

1. Sign up at /signup. Pick a charity at 25% slider. Subscribe at £9.99/mo via Stripe Checkout
2. Log 5 Stableford scores (1-45) at /dashboard/scores. Oldest drops automatically via DB trigger
3. Admin simulates monthly draw at /admin/draws. 5 random numbers. Prize split 40/35/25 with jackpot rollover
4. Matched winners upload verification proof at /dashboard/draws/[id]/claim. Admin approves or disputes
5. 10% of all revenue tracked per charity at /dashboard/charity and /admin/charities/reports

---

## Tech Stack

| Layer | Tech | Why |
| --- | --- | --- |
| Framework | Next.js 14 App Router | SSR, RSC, file-based routing |
| DB / Auth | Supabase Postgres + RLS | Row-level security, real-time subscriptions |
| Payments | Stripe Checkout + Webhooks | PCI compliant, idempotent event handling |
| UI | Tailwind + shadcn + Framer Motion | Fast iteration, accessible, premium feel |
| Email | Resend + React Email | Transactional reliability, auditable logs |
| Deploy | Vercel | Edge functions, instant previews, zero config |

---

## PRD Compliance

| Requirement | Status | Location |
| --- | --- | --- |
| £9.99/mo or £89.99/yr subscription | Done | /pricing, Stripe price IDs in .env |
| 10% minimum to charity | Done | /api/stripe/webhook/route.ts#L45 |
| Last 5 Stableford scores only | Done | Supabase migration 002 (trigger) |
| Monthly draw with 40/35/25 split | Done | /admin/draws/actions.ts |
| Jackpot rollover if no 5-match winner | Done | /admin/draws/actions.ts#L89 |
| Winner verification with proof upload | Done | /dashboard/draws/[drawId]/claim |
| RLS on all tables | Done | Supabase policies.sql |
| Admin panel for charities and draws | Done | /app/(admin)/admin |
| New Vercel + Supabase accounts | Done | Deployed 24 June 2026 |

---

## Local Setup

```bash
git clone https://github.com/user/cause-club
cd cause-club
bun install
cp .env.example .env.local
```

Fill `.env.local` with your Supabase project URL, anon key, service role key, and Stripe test keys.

```bash
bun run dev
```

Open http://localhost:3000.

---

## Project Structure

```
src/
  app/
    (marketing)/         Landing, pricing, charities, contact
    (dashboard)/         Scores, draws, charity settings (auth required)
    (admin)/             Draws, charities, reports, users (admin only)
    api/                 Stripe webhook, checkout, cron, admin exports
    login, signup        Auth pages
  components/
    marketing/           Navbar, Hero, HowItWorks, TrustBar, Testimonials, Faq
    ui/                  Button, Card, Dialog, Input, Sonner (shadcn)
    providers/           ThemeProvider (dark mode), MotionProvider (Framer)
  lib/
    supabase/            Server/client/service clients
    stripe.ts            Stripe SDK singleton
    utils.ts             cn() helper
  middleware.ts          Route protection, redirect logic
scripts/
  security-check.ts      3 checks: secret scan, RLS, webhook validation
tests/
  e2e/flows.spec.ts      5 Playwright specs (signup, scores, admin draw, claim, charity)
lighthouserc.js          Lighthouse CI config (a11y 100, perf 90)
```

---

## Scripts

| Command | What |
| --- | --- |
| `bun run dev` | Local dev server |
| `bun run build` | Production build |
| `bun run test:e2e` | Playwright E2E suite |
| `bun run test:security` | Secret scan, RLS check, webhook validation |
| `bun run verify` | Full CI pipeline (build -> security -> e2e -> lighthouse) |
