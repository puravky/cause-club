# Production Pass -- Changes

## Fixed
- Pricing page yearly price: £95.90 -> £89.99 to match PRD (£89.99/yr)
- Stripe Price IDs now passed via env for checkout session creation
- Em dashes removed from code comments and metadata (Hero.tsx, layout.tsx, test-draw/route.ts, pricing page label)

## Added
- `SubscribeButton` client component on pricing page for both Monthly (£9.99) and Yearly (£89.99) plans
- `proofs` storage bucket creation with RLS policies in seed.sql
- `checkout_success` toast on DashboardClient mount when returning from Stripe Checkout

## Verified
- No secret keys leaked to client (grep confirmed server-only env vars)
- Stripe webhook uses `constructEvent` with signature validation
- Score actions enforce 1-45 range, duplicate date check, trigger-enforced 5-score limit
- Draw engine calculates prize pool at 50% of subs, splits 40/35/25, carries over 5-match jackpot
- Admin winners flow: review submission (approve/reject), mark payout paid
- Claim flow: file upload to Supabase Storage `proofs` bucket, server action to update `draw_results`
- Middleware protects `/dashboard`, `/admin`, `/onboarding` with subscription + role checks
- All 23 routes build successfully
