-- Run in Supabase: SQL Editor → New query → paste → Run.
-- Then Table Editor → listings to confirm rows (or use seed below).

create extension if not exists "pgcrypto";

create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  price text not null,
  image_url text not null,
  status text not null default 'active' check (status in ('active', 'sold', 'removed')),
  created_at timestamptz not null default now()
);

create index if not exists listings_status_created_at_idx
  on public.listings (status, created_at desc);

alter table public.listings enable row level security;

-- Anyone with the anon key can read active listings (typical marketplace feed).
create policy "listings_select_active"
  on public.listings
  for select
  using (status = 'active');

-- Writes from the app should use Supabase Auth; run inserts as service role from a backend,
-- or add policies for authenticated users when you wire sign-in.
-- Example (uncomment after enabling Supabase Auth in the app):
-- create policy "listings_insert_own"
--   on public.listings
--   for insert
--   to authenticated
--   with check (true);

-- Optional seed: runs only when `listings` is empty (re-run safe).
insert into public.listings (title, price, image_url, status)
select title, price, image_url, status
from (values
  ('White Cabinet', '$50', 'https://images.unsplash.com/photo-1595428776513-d54e20fe486c?w=400&q=80', 'active'),
  ('Sociology Textbook', '$25', 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&q=80', 'active'),
  ('Cozy Chair', '$200', 'https://images.unsplash.com/photo-1567538096639-e914c58b9e55?w=400&q=80', 'active'),
  ('Black Cabinet', '$50', 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80', 'active')
) as seed(title, price, image_url, status)
where not exists (select 1 from public.listings limit 1);
