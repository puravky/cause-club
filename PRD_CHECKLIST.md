# PRD Requirements Checklist

## Section 6: User Authentication & Profiles

- [x] User signup with email/password — `src/app/(auth)/signup/page.tsx`
- [x] User login — `src/app/(auth)/login/page.tsx`
- [x] Auth callback handler — `src/app/auth/callback/route.ts`
- [x] User profile (name, email, role) stored in `public.users` table — `supabase/migrations/001_initial_schema.sql`
- [x] Onboarding flow (charity selection + percentage) — `src/app/(auth)/onboarding/page.tsx`
- [ ] Social login (Google/GitHub OAuth)
- [ ] Password reset flow
- [ ] Email verification flow
- [ ] User settings page (name, email preferences)
- [ ] Profile photo upload

## Section 7: Subscription & Payments (Stripe)

- [x] Stripe Checkout session creation — `src/app/api/stripe/checkout/route.ts`
- [x] Stripe webhook handler (checkout.session.completed, subscription.updated, subscription.deleted, invoice.payment_succeeded, charge.refunded) — `src/app/api/stripe/webhook/route.ts`
- [x] Subscription status sync to `users` and `subscriptions` tables — `src/app/api/stripe/webhook/route.ts`
- [x] Monthly (£9.99) and Yearly (£89.99) pricing — `src/app/(marketing)/pricing/page.tsx`
- [x] SubscribeButton component — `src/components/marketing/SubscribeButton.tsx`
- [x] Independent donation checkout — `src/app/api/stripe/checkout/independent/route.ts`
- [x] Middleware subscription guard (redirects to /pricing if no active subscription) — `src/middleware.ts`
- [ ] Customer portal for managing billing
- [ ] Trial period handling
- [ ] Invoice history view

## Section 8: Score Management

- [x] Score CRUD (create, read, update, delete) — `src/app/(dashboard)/dashboard/scores/actions.ts`
- [x] Score validation (1-45 range, duplicate date check) — `src/app/(dashboard)/dashboard/scores/actions.ts`
- [x] 5-score maximum enforced via database trigger — `supabase/migrations/001_initial_schema.sql`
- [x] Scores list view with limit of 5 — `src/app/(dashboard)/dashboard/scores/page.tsx`
- [x] Auto-delete oldest score when limit exceeded — `supabase/migrations/001_initial_schema.sql`
- [ ] Score import/upload (CSV)
- [ ] Score history archive

## Section 9: Draw Engine & Prize Pool

- [x] Draw simulation (random and algorithmic) — `src/app/(admin)/admin/draws/actions.ts`
- [x] 5 unique numbers drawn from 1-45 — `src/app/(admin)/admin/draws/actions.ts`
- [x] Prize pool calculation at 50% of subscription revenue — `src/app/(admin)/admin/draws/actions.ts`
- [x] Tier distribution: 5-match (40%), 4-match (35%), 3-match (25%) — `src/app/(admin)/admin/draws/actions.ts`
- [x] Jackpot carry-over on no 5-match winner — `src/app/(admin)/admin/draws/actions.ts`
- [x] Draw publishing (locks results) — `src/app/(admin)/admin/draws/actions.ts`
- [x] Draw history display for users — `src/app/(dashboard)/dashboard/draws/page.tsx`
- [x] Winner claim flow with proof upload — `src/app/(dashboard)/dashboard/draws/[drawId]/claim/actions.ts`
- [ ] Draw scheduling (auto-run at month end)
- [ ] Jackpot countdown timer on dashboard

## Section 10: Charity System

- [x] Charity CRUD (admin) — `src/app/(admin)/admin/charities/actions.ts`
- [x] Charity selection during onboarding — `src/app/(auth)/onboarding/page.tsx`
- [x] User can change charity — `src/app/(dashboard)/dashboard/charity/actions.ts`
- [x] Charity percentage allocation (min 10%) — `src/app/(dashboard)/dashboard/charity/actions.ts`
- [x] Donation tracking via Stripe invoice events — `src/app/api/stripe/webhook/route.ts`
- [x] Donations history view — `src/app/(dashboard)/dashboard/charity/page.tsx`
- [x] Charity reports (donation distribution) — `src/app/(admin)/admin/charities/reports/page.tsx`
- [ ] Charity profiles with images/description on marketing pages
- [ ] Public charity browse page

## Section 11: Admin Dashboard

- [x] Admin route guard — `src/middleware.ts`
- [x] Users management (list, search, filter) — `src/app/(admin)/admin/users/page.tsx`
- [x] Users CSV export — `src/app/(admin)/admin/users/actions.ts`
- [x] Subscription cancellation (admin) — `src/app/(admin)/admin/users/actions.ts`
- [x] Draw management (simulate, publish) — `src/app/(admin)/admin/draws/actions.ts`
- [x] Winners verification (review scorecard, approve/reject) — `src/app/(admin)/admin/winners/actions.ts`
- [x] Payout management (mark as paid) — `src/app/(admin)/admin/winners/actions.ts`
- [x] Charity management (CRUD) — `src/app/(admin)/admin/charities/actions.ts`
- [x] Reports (MRR, active users, donation analytics) — `src/app/(admin)/admin/reports/page.tsx`
- [x] Admin impersonation (dev only) — `src/app/(admin)/admin/users/actions.ts`
- [x] Draws history view — `src/app/(admin)/admin/draws/history/page.tsx`
- [x] Draw winner detail page + CSV export — `src/app/(admin)/admin/draws/[id]/page.tsx`
- [x] Settings page (system info) — `src/app/(admin)/admin/settings/page.tsx`
- [x] Admin sidebar with all nav links + active state — `src/components/admin/AdminSidebar.tsx`
- [ ] Audit log for admin actions
- [ ] Email campaign management

## Section 12: Email Notifications

- [x] Resend integration — `src/lib/email.ts`
- [x] sendEmail helper function — `src/lib/email.ts`
- [x] Monthly draw reminder cron route — `src/app/api/cron/draw-reminder/route.ts`
- [x] Welcome email template — `src/emails/Welcome.tsx`
- [x] Payment receipt email template — `src/emails/PaymentReceipt.tsx`
- [x] Draw result email template (win/loss) — `src/emails/DrawResult.tsx`
- [x] Verification approved email template — `src/emails/VerificationApproved.tsx`
- [x] Verification rejected email template — `src/emails/VerificationRejected.tsx`
- [ ] Welcome email triggered on signup
- [ ] Winner notification triggered on draw publish
- [ ] Payment failure email
- [ ] Charity donation receipt email

## Section 13: UI/UX & Animations

- [x] Tailwind CSS styling — `tailwind.config.ts`
- [x] Framer Motion animations — `src/lib/motion.ts`
- [x] Radix UI primitives — `package.json`
- [x] shadcn/ui components — `package.json`
- [x] Sonner toast notifications — `package.json`
- [x] Responsive layout — `src/app/layout.tsx`
- [ ] Dark mode toggle
- [x] Loading skeletons — `src/components/ui/LoadingSkeleton.tsx`
- [x] EmptyState component — `src/components/ui/EmptyState.tsx`
- [x] Route transition animations — `src/app/(admin)/template.tsx`
- [ ] Error boundaries on all routes

## Section 14: Legal & Compliance

- [x] Privacy Policy page — `src/app/(marketing)/privacy/page.tsx`
- [x] Terms of Service page — `src/app/(marketing)/terms/page.tsx`
- [x] Contact page + form — `src/app/(marketing)/contact/page.tsx`
- [x] Contact API endpoint (Resend) — `src/app/api/contact/route.ts`
- [x] Footer with legal links — `src/components/marketing/Footer.tsx`
- [ ] Cookie consent banner
- [ ] GDPR data export endpoint
- [ ] Account deletion endpoint
