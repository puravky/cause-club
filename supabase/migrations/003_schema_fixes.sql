-- 1. Add 'submitted' as valid verification_status for claim submissions
ALTER TABLE draw_results
  DROP CONSTRAINT IF EXISTS draw_results_verification_status_check;
ALTER TABLE draw_results
  ADD CONSTRAINT draw_results_verification_status_check
  CHECK (verification_status IN ('pending','submitted','approved','rejected'));

-- 2. Add missing admin_note column to draw_results
ALTER TABLE draw_results
  ADD COLUMN IF NOT EXISTS admin_note text;

-- 3. Fix prize_pool.jackpot_carried_over — change boolean to numeric
-- (code inserts a carry amount in GBP, not a boolean)
ALTER TABLE prize_pool
  ALTER COLUMN jackpot_carried_over TYPE numeric(10,2) USING 0;

-- 4. Add 'canceled' (Stripe US spelling) to users subscription_status
-- and 'trialing', 'past_due' which Stripe also sends
ALTER TABLE users
  DROP CONSTRAINT IF EXISTS users_subscription_status_check;
ALTER TABLE users
  ADD CONSTRAINT users_subscription_status_check
  CHECK (subscription_status IN (
    'active','inactive','cancelled','canceled','lapsed','trialing','past_due'
  ));

-- 5. Fix winners table RLS: admin check was reading from auth metadata
-- but admin role is in public.users.role
DROP POLICY IF EXISTS "Admin full access" ON winners;
CREATE POLICY "Admin full access" ON winners FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  )
);
