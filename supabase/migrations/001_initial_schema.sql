-- ═══════════════════════════════════════════════════════════════
--  causeClub · Digital Heroes PRD — Supabase Schema
--  Run this in the Supabase SQL Editor (single execution)
-- ═══════════════════════════════════════════════════════════════

-- ─── Extensions ────────────────────────────────────────────────
create extension if not exists "pgcrypto";


-- ═══════════════════════════════════════════════════════════════
--  1. TABLES
-- ═══════════════════════════════════════════════════════════════

-- ─── charities (created first — users references it) ──────────
create table public.charities (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  description text,
  images      text[],
  events      jsonb,
  featured    boolean default false,
  created_at  timestamptz default now()
);

-- ─── users ─────────────────────────────────────────────────────
create table public.users (
  id                   uuid primary key references auth.users on delete cascade,
  email                text unique not null,
  name                 text,
  role                 text default 'subscriber',
  subscription_status  text,
  subscription_plan    text,
  charity_id           uuid references public.charities(id) on delete set null,
  charity_percentage   integer default 10
                       check (charity_percentage >= 10),
  stripe_customer_id   text,
  created_at           timestamptz default now()
);

-- ─── scores ────────────────────────────────────────────────────
create table public.scores (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.users(id) on delete cascade,
  score      integer not null
             check (score between 1 and 45),
  date       date not null,
  created_at timestamptz default now(),

  unique (user_id, date)
);

-- ─── subscriptions ─────────────────────────────────────────────
create table public.subscriptions (
  id                     uuid primary key default gen_random_uuid(),
  user_id                uuid not null references public.users(id) on delete cascade,
  stripe_subscription_id text unique,
  plan                   text not null
                         check (plan in ('monthly', 'yearly')),
  status                 text,
  current_period_end     timestamptz,
  created_at             timestamptz default now()
);

-- ─── draws ─────────────────────────────────────────────────────
create table public.draws (
  id              uuid primary key default gen_random_uuid(),
  month           int not null,
  year            int not null,
  draw_type       text not null
                  check (draw_type in ('random', 'algorithm')),
  status          text default 'draft'
                  check (status in ('draft', 'simulated', 'published')),
  drawn_numbers   int[],
  jackpot_amount  numeric default 0,
  created_at      timestamptz default now()
);

-- ─── draw_results ──────────────────────────────────────────────
create table public.draw_results (
  id                  uuid primary key default gen_random_uuid(),
  draw_id             uuid not null references public.draws(id) on delete cascade,
  user_id             uuid not null references public.users(id) on delete cascade,
  match_type          int not null
                      check (match_type in (3, 4, 5)),
  prize_amount        numeric not null default 0,
  verification_status text default 'pending',
  payout_status       text default 'pending',
  proof_url           text,
  created_at          timestamptz default now()
);

-- ─── prize_pool ────────────────────────────────────────────────
create table public.prize_pool (
  id                    uuid primary key default gen_random_uuid(),
  draw_id               uuid not null references public.draws(id) on delete cascade,
  total_amount          numeric not null default 0,
  tier_3_amount         numeric not null default 0,
  tier_4_amount         numeric not null default 0,
  tier_5_amount         numeric not null default 0,
  jackpot_carried_over  numeric not null default 0
);

-- ─── donations ─────────────────────────────────────────────────
create table public.donations (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.users(id) on delete cascade,
  charity_id  uuid not null references public.charities(id) on delete cascade,
  amount      numeric not null default 0,
  type        text not null
              check (type in ('subscription_percentage', 'independent')),
  created_at  timestamptz default now()
);


-- ═══════════════════════════════════════════════════════════════
--  2. INDEXES
-- ═══════════════════════════════════════════════════════════════

create index idx_scores_user_date
  on public.scores (user_id, date desc);

create index idx_draws_year_month
  on public.draws (year, month);


-- ═══════════════════════════════════════════════════════════════
--  3. ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════════════════════

-- Enable RLS on every table
alter table public.users          enable row level security;
alter table public.scores         enable row level security;
alter table public.charities      enable row level security;
alter table public.subscriptions  enable row level security;
alter table public.draws          enable row level security;
alter table public.draw_results   enable row level security;
alter table public.prize_pool     enable row level security;
alter table public.donations      enable row level security;

-- ─── Helper: is current user an admin? ─────────────────────────
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1
    from public.users
    where id = auth.uid()
      and role = 'admin'
  );
$$;

-- ─── users ─────────────────────────────────────────────────────
create policy "Users can view own row"
  on public.users for select
  using (auth.uid() = id);

create policy "Users can update own row"
  on public.users for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Admin full access to users"
  on public.users for all
  using (public.is_admin());

-- ─── scores ────────────────────────────────────────────────────
create policy "Users can view own scores"
  on public.scores for select
  using (auth.uid() = user_id);

create policy "Users can insert own scores"
  on public.scores for insert
  with check (auth.uid() = user_id);

create policy "Users can update own scores"
  on public.scores for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own scores"
  on public.scores for delete
  using (auth.uid() = user_id);

create policy "Admin full access to scores"
  on public.scores for all
  using (public.is_admin());

-- ─── charities (public read, admin write) ──────────────────────
create policy "Anyone can view charities"
  on public.charities for select
  using (true);

create policy "Admin full access to charities"
  on public.charities for all
  using (public.is_admin());

-- ─── subscriptions ─────────────────────────────────────────────
create policy "Users can view own subscriptions"
  on public.subscriptions for select
  using (auth.uid() = user_id);

create policy "Admin full access to subscriptions"
  on public.subscriptions for all
  using (public.is_admin());

-- ─── draws (public read, admin write) ──────────────────────────
create policy "Anyone can view published draws"
  on public.draws for select
  using (status = 'published' or public.is_admin());

create policy "Admin full access to draws"
  on public.draws for all
  using (public.is_admin());

-- ─── draw_results ──────────────────────────────────────────────
create policy "Users can view own draw results"
  on public.draw_results for select
  using (auth.uid() = user_id);

create policy "Admin full access to draw_results"
  on public.draw_results for all
  using (public.is_admin());

-- ─── prize_pool (public read, admin write) ─────────────────────
create policy "Anyone can view prize pool"
  on public.prize_pool for select
  using (true);

create policy "Admin full access to prize_pool"
  on public.prize_pool for all
  using (public.is_admin());

-- ─── donations ─────────────────────────────────────────────────
create policy "Users can view own donations"
  on public.donations for select
  using (auth.uid() = user_id);

create policy "Admin full access to donations"
  on public.donations for all
  using (public.is_admin());


-- ═══════════════════════════════════════════════════════════════
--  4. FUNCTION + TRIGGER — enforce max 5 scores per user
-- ═══════════════════════════════════════════════════════════════

create or replace function public.enforce_five_scores()
returns trigger
language plpgsql
security definer
as $$
begin
  -- Delete the oldest score(s) when user has more than 5
  delete from public.scores
  where id in (
    select id
    from public.scores
    where user_id = NEW.user_id
    order by date desc, created_at desc
    offset 5
  );

  return NEW;
end;
$$;

create trigger trg_enforce_five_scores
  after insert on public.scores
  for each row
  execute function public.enforce_five_scores();


-- ═══════════════════════════════════════════════════════════════
--  Done. All tables, indexes, RLS, and triggers are ready.
-- ═══════════════════════════════════════════════════════════════
