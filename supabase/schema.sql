-- Handoff marketplace schema — run in Supabase SQL Editor (idempotent for existing projects).
-- Full demo data: run supabase/seed.sql after this (or `npm run db:emit-seed` then paste).

create extension if not exists "pgcrypto";

-- Legacy core table (kept for upgrades)
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

-- Seller storefronts (seed UUIDs match src/data/seedCatalog.ts)
create table if not exists public.profiles (
  id uuid primary key,
  handle text unique not null,
  display_name text not null,
  avatar_url text not null,
  bio text not null default '',
  campus text not null default '',
  primary_meetup_spot text not null default '',
  rating_avg numeric(2,1) not null default 5.0,
  review_count int not null default 0,
  items_sold int not null default 0,
  followers_count int not null default 0,
  is_verified_edu boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists profiles_handle_idx on public.profiles (handle);

-- Rich listing columns (nullable until backfilled)
alter table public.listings add column if not exists seller_id uuid references public.profiles(id) on delete cascade;
alter table public.listings add column if not exists description text not null default '';
alter table public.listings add column if not exists category text;
alter table public.listings add column if not exists condition text;
alter table public.listings add column if not exists brand text;
alter table public.listings add column if not exists size text;
alter table public.listings add column if not exists location_label text;
alter table public.listings add column if not exists posted_at timestamptz not null default now();

create index if not exists listings_seller_id_idx on public.listings (seller_id);
create index if not exists listings_category_idx on public.listings (category);

-- RLS
alter table public.listings enable row level security;
alter table public.profiles enable row level security;

drop policy if exists "listings_select_active" on public.listings;
create policy "listings_select_active"
  on public.listings
  for select
  using (status = 'active');

drop policy if exists "listings_select_sold_removed_own" on public.listings;
-- Allow reading non-active rows only when authenticated as owner (future); for demo, active-only is enough.

drop policy if exists "profiles_select_all" on public.profiles;
create policy "profiles_select_all"
  on public.profiles
  for select
  using (true);

-- Remove legacy 4-row seed that has no seller_id (optional; safe if table empty)
-- Prefer running supabase/seed.sql for a clean catalog.

-- Feature tables (favorites, follows, listing_images, conversations, messages,
-- offers, meetups, reviews) + RLS live in supabase/migrations/0002_features.sql.
-- Paste that file next, or the bundled supabase/full_setup.sql (npm run db:bundle).
