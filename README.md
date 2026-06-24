# causeClub — Play Golf, Find Good.
Monthly prize draw where 10% always goes to charity you choose.

Live Link: https://cause-club.vercel.app  

---

## ⚡ Test in 60 Seconds

| Role | Email | Password | What to test |
| --- | --- | --- | --- |
| User | player@causeclub.com | CauseClub2026! | Dashboard, add scores, view draws, claim win |
| Admin | admin@causeclub.com | AdminSecure2026! | /admin/draws, simulate + publish, approve proof |

Stripe test card: `4242 4242 4242 4242` any future expiry, any CVC, any ZIP. (e.g. 4242 4242 4242 4242, 12/34, 123, 12345)

**Quick test flow:**
1. Login as player@causeclub.com → `/dashboard/scores` → add 5 scores: 10, 20, 30, 40, 45
2. Login as admin@causeclub.com → `/admin/draws` → Simulate Draw → Publish
3. Login as player@causeclub.com → `/dashboard/draws` → see if you won → Claim → upload any jpg
4. Login as admin@causeclub.com → `/admin/winners` → Approve
5. Check Supabase `donations` table → verify 10% of subscription recorded

---

## 🎯 How It Works

**User Journey:**
1. `/signup` → Pick charity and set donation 10-100%
2. `/pricing` → Subscribe £9.99/mo or £89.99/yr via Stripe Checkout
3. `/dashboard/scores` → Add Stableford scores 1-45. Last 5 automatically kept
4. Auto-entered into monthly draw if subscription active and 5 scores logged
5. `/dashboard/draws` → View results. Match 3, 4, or 5 numbers to win
6. `/dashboard/draws/:id/claim` → Upload proof if you win

**Admin Journey:**
1. `/admin` → View total users, active subs, donations, monthly pool
2. `/admin/draws` → Simulate draw with RNG, then Publish to all users
3. `/admin/winners` → Review uploaded proof, Approve or Reject claims
4. `/admin/charities` → Add, edit, or disable charities
5. `/admin/reports` → Export CSV of donations by charity and date

**Key Routes:**

| Route | Purpose | Auth Required |
| --- | --- | --- |
| `/` | Landing page, signup CTA | No |
| `/signup` | Create account, charity selection | No |
| `/login` | Sign in | No |
| `/pricing` | Stripe Checkout redirect | Yes |
| `/dashboard` | User stats, recent activity | User |
| `/dashboard/scores` | Add scores, view last 5 | User |
| `/dashboard/draws` | Draw history, claim winnings | User |
| `/dashboard/charity` | Change charity, update % | User |
| `/charities` | Public charity directory | No |
| `/draws` | Public past draw results | No |
| `/admin` | Admin overview | Admin |
| `/admin/draws` | Run draws, view history | Admin |
| `/admin/winners` | Verify winner claims | Admin |
| `/admin/charities` | CRUD charities | Admin |
| `/admin/reports` | Export donation data | Admin |
| `/api/stripe/webhook` | Handles payments + donations | Stripe |
| `/terms` | Legal terms | No |
| `/privacy` | Privacy policy | No |
| `/contact` | Contact form | No |
| `/responsible` | Responsible play info | No |

---

## ✓ Digital Heroes PRD Compliance

| Requirement | Status | File |
| --- | --- | --- |
| £9.99/mo or £89.99/yr subscription | Done | `/app/(marketing)/pricing/page.tsx` |
| 10% minimum to charity enforced | Done | `/app/api/stripe/webhook/route.ts#L45` |
| User picks charity + percentage at signup | Done | `/app/(auth)/signup/page.tsx` |
| Last 5 Stableford scores only | Done | `/supabase/migrations/002_trigger.sql` |
| Auto entry to monthly draw | Done | Draw logic checks active subs + score count |
| Prize split 40/35/25 for 5/4/3 matches | Done | `/app/(admin)/admin/draws/actions.ts#L89` |
| Monthly pool rollover if no 5-match winner | Done | `/app/(admin)/admin/draws/actions.ts` |
| Winner verification with proof upload | Done | `/app/(dashboard)/dashboard/draws/[id]/claim/page.tsx` |
| RLS on all user tables | Done | `/supabase/policies.sql` |
| Admin panel for charities and draws | Done | `/app/(admin)/admin` |
| Transactional emails via Resend | Done | `/src/lib/email.ts`, `/src/emails/*` |
| New Vercel + Supabase accounts | Done | Deployed 24 June 2026 |
| Legal pages | Done | `/app/(marketing)/terms`, `/privacy` |
| Responsible play info | Done | `/app/(marketing)/responsible/page.tsx` |

---

## 🛠 Tech Stack

| Layer | Tech | Reason |
| --- | --- | --- |
| Framework | Next.js 14 App Router | SSR, RSC, server actions |
| Database | Supabase Postgres | Row Level Security, triggers |
| Auth | Supabase Auth | Email password, RLS integration |
| Payments | Stripe Checkout + Webhooks | PCI compliant, subscriptions |
| UI | Tailwind + shadcn/ui | Fast styling, accessible components |
| Animation | Framer Motion | Premium interactions |
| Email | Resend + React Email | Typed templates, audit trail |
| Storage | Supabase Storage | Private bucket for proof uploads |
| Deploy | Vercel | Edge functions, preview deploys |
| Testing | Playwright + Vitest | E2E user flows + unit tests |

---

## 💻 Local Setup

**1. Clone and install**
```bash
git clone https://github.com/yourusername/cause-club
cd cause-club
bun install
```

**2. Environment variables**
Copy `.env.example` to `.env.local` and fill in Supabase + Stripe keys.

**3. Database**
```bash
bunx supabase start
bunx supabase db push
bunx supabase db seed
```

**4. Stripe webhooks (local)**
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
stripe trigger checkout.session.completed
```

**5. Run**
```bash
bun run dev
```
