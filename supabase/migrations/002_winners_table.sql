create table public.winners (
  id uuid primary key default gen_random_uuid(),
  draw_id uuid references draws(id) on delete cascade,
  user_id uuid references users(id),
  match_count int check (match_count in (3,4,5)),
  prize_amount numeric(10,2) not null,
  status text default 'pending' check (status in ('pending','approved','paid','rejected')),
  proof_url text,
  created_at timestamptz default now()
);

alter table winners enable row level security;

create policy "Users see own wins" on winners for select using (auth.uid() = user_id);
create policy "Admin full access" on winners for all using (
  (select raw_user_meta_data->>'role' from auth.users where id = auth.uid()) = 'admin'
);
