-- ═══════════════════════════════════════════════════════════════
--  causeClub · Seed Data SQL
--  Run this in the Supabase SQL Editor to populate initial data.
-- ═══════════════════════════════════════════════════════════════

-- ─── 0. Create Storage Bucket for Scorecard Proofs ──────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'proofs',
  'proofs',
  true,
  5242880,
  array['image/png', 'image/jpeg', 'application/pdf']
)
on conflict (id) do nothing;

-- Storage RLS: authenticated users can upload to proofs bucket
create policy "Authenticated users can upload proofs"
  on storage.objects for insert
  with check (
    bucket_id = 'proofs'
    and auth.role() = 'authenticated'
  );

-- Storage RLS: users can read own proofs
create policy "Users can read own proofs"
  on storage.objects for select
  using (
    bucket_id = 'proofs'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Storage RLS: admins can read all proofs
create policy "Admins can read all proofs"
  on storage.objects for select
  using (
    bucket_id = 'proofs'
    and public.is_admin()
  );

-- ─── 1. Insert Initial Charities ──────────────────────────────
INSERT INTO public.charities (id, name, description, images, logo_url, website, stripe_account_id, events, featured, created_at)
VALUES
  (
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    'Macmillan Cancer Support',
    'Providing physical, financial and emotional support to help people with cancer live life as fully as they can.',
    ARRAY['https://images.unsplash.com/photo-1576765608535-5f04d1e3f289'],
    'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=128&h=128&fit=crop',
    'https://www.macmillan.org.uk',
    'acct_123',
    '[
      {"title": "Macmillan Golf Classic", "date": "2026-08-15", "location": "St Andrews, Scotland"},
      {"title": "Brave the Shave 2026", "date": "2026-10-01", "location": "London, UK"}
    ]'::jsonb,
    true,
    now()
  ),
  (
    'b2c3d4e5-f67a-8b9c-0d1e-2f3a4b5c6d7e',
    'British Heart Foundation',
    'Funding pioneering research to find cures and treatments for heart and circulatory diseases, the UK''s biggest killers.',
    ARRAY['https://images.unsplash.com/photo-1559839734-2b71ea197ec2'],
    'https://images.unsplash.com/photo-1505572186315-5e76e09e1e3e?w=128&h=128&fit=crop',
    'https://www.bhf.org.uk',
    'acct_456',
    '[
      {"title": "London to Brighton Bike Ride", "date": "2026-06-21", "location": "Brighton, UK"},
      {"title": "Heart Hero Awards", "date": "2026-09-18", "location": "Manchester, UK"}
    ]'::jsonb,
    true,
    now()
  ),
  (
    'c3d4e5f6-7a8b-9c0d-1e2f-3a4b5c6d7e8f',
    'RSPCA',
    'The oldest and largest animal welfare charity in the UK, rescuing, rehabilitating, and rehoming animals in need.',
    ARRAY['https://images.unsplash.com/photo-1587300003388-59208cc962cb'],
    'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=128&h=128&fit=crop',
    'https://www.rspca.org.uk',
    'acct_789',
    '[
      {"title": "RSPCA Dog Walkathon", "date": "2026-07-05", "location": "Hyde Park, London"}
    ]'::jsonb,
    false,
    now()
  ),
  (
    '11111111-2222-3333-4444-555555555555',
    'Shelter',
    'Defending the right to a safe home. Shelter helps millions of people every year struggling with bad housing or homelessness through advice, support, and legal services.',
    ARRAY['https://images.unsplash.com/photo-1513694203232-719a280e022f'],
    'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=128&h=128&fit=crop',
    'https://www.shelter.org.uk',
    'acct_shelter',
    '[
      {"title": "Sleep Out Challenge 2026", "date": "2026-11-12", "location": "Birmingham, UK"}
    ]'::jsonb,
    false,
    now()
  ),
  (
    '22222222-3333-4444-5555-666666666666',
    'National Trust',
    'Preserving and protecting historic places and spaces in England, Wales and Northern Ireland, for everyone, forever.',
    ARRAY['https://images.unsplash.com/photo-1464822759023-fed622ff2c3b'],
    'https://images.unsplash.com/photo-1448375240586-882707db888b?w=128&h=128&fit=crop',
    'https://www.nationaltrust.org.uk',
    'acct_nt',
    '[
      {"title": "Historic Gardens Tour", "date": "2026-08-22", "location": "Kent, UK"}
    ]'::jsonb,
    false,
    now()
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  images = EXCLUDED.images,
  logo_url = EXCLUDED.logo_url,
  website = EXCLUDED.website,
  stripe_account_id = EXCLUDED.stripe_account_id,
  events = EXCLUDED.events,
  featured = EXCLUDED.featured;

-- ─── 2. Insert Test/Current Draws ─────────────────────────────
-- Past draw: May 2026
INSERT INTO public.draws (id, month, year, draw_type, status, drawn_numbers, jackpot_amount, created_at)
VALUES (
  'd4e5f67a-8b9c-0d1e-2f3a-4b5c6d7e8f9a',
  5,
  2026,
  'algorithm',
  'published',
  ARRAY[12, 28, 33, 19, 41],
  127430.00,
  now() - interval '30 days'
) ON CONFLICT (id) DO NOTHING;

-- Active draw: June 2026
INSERT INTO public.draws (id, month, year, draw_type, status, drawn_numbers, jackpot_amount, created_at)
VALUES (
  'e5f67a8b-9c0d-1e2f-3a4b-5c6d7e8f9a0b',
  6,
  2026,
  'random',
  'draft',
  NULL,
  15000.00,
  now()
) ON CONFLICT (id) DO NOTHING;
