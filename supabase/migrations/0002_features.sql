-- 0002_features.sql — favorites, follows, listing_images, messaging
-- (conversations/messages), offers, meetups, reviews, and RLS.
-- Applied via Supabase MCP as `handoff_features_schema` on 2026-04-21.
-- Idempotent; safe to re-run. Paste into the SQL Editor after schema.sql.

alter table public.profiles
  add column if not exists auth_user_id uuid unique references auth.users(id) on delete set null;

create schema if not exists app_private;

create or replace function app_private.current_profile_id() returns uuid
language sql stable security definer set search_path = public as $$
  select id from public.profiles where auth_user_id = auth.uid() limit 1;
$$;

create table if not exists public.listing_images (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  url text not null,
  position int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists listing_images_listing_idx on public.listing_images (listing_id, position);

create table if not exists public.favorites (
  user_id uuid not null references public.profiles(id) on delete cascade,
  listing_id uuid not null references public.listings(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, listing_id)
);
create index if not exists favorites_listing_idx on public.favorites (listing_id);

create table if not exists public.follows (
  follower_id uuid not null references public.profiles(id) on delete cascade,
  following_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id),
  constraint follows_no_self check (follower_id <> following_id)
);
create index if not exists follows_following_idx on public.follows (following_id);

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references public.listings(id) on delete set null,
  buyer_id uuid not null references public.profiles(id) on delete cascade,
  seller_id uuid not null references public.profiles(id) on delete cascade,
  last_message_at timestamptz,
  archived_by uuid[] not null default '{}',
  created_at timestamptz not null default now(),
  unique (listing_id, buyer_id, seller_id),
  constraint conversations_distinct_parties check (buyer_id <> seller_id)
);
create index if not exists conversations_buyer_idx on public.conversations (buyer_id, last_message_at desc);
create index if not exists conversations_seller_idx on public.conversations (seller_id, last_message_at desc);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  read_at timestamptz
);
create index if not exists messages_conv_idx on public.messages (conversation_id, created_at);
create index if not exists messages_sender_idx on public.messages (sender_id);

create table if not exists public.offers (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  buyer_id uuid not null references public.profiles(id) on delete cascade,
  amount_cents int not null check (amount_cents > 0),
  status text not null default 'pending'
    check (status in ('pending','accepted','declined','withdrawn')),
  created_at timestamptz not null default now()
);
create index if not exists offers_conv_idx on public.offers (conversation_id, created_at desc);
create index if not exists offers_buyer_idx on public.offers (buyer_id);

create table if not exists public.meetups (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  location_label text not null default '',
  lat double precision,
  lng double precision,
  scheduled_at timestamptz,
  status text not null default 'proposed'
    check (status in ('proposed','confirmed','completed','cancelled')),
  created_at timestamptz not null default now()
);
create index if not exists meetups_conv_idx on public.meetups (conversation_id);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references public.profiles(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  body text not null default '',
  created_at timestamptz not null default now(),
  constraint reviews_no_self check (subject_id <> author_id)
);
create index if not exists reviews_subject_idx on public.reviews (subject_id, created_at desc);
create index if not exists reviews_author_idx on public.reviews (author_id);

alter table public.listing_images enable row level security;
alter table public.favorites      enable row level security;
alter table public.follows        enable row level security;
alter table public.conversations  enable row level security;
alter table public.messages       enable row level security;
alter table public.offers         enable row level security;
alter table public.meetups        enable row level security;
alter table public.reviews        enable row level security;

drop policy if exists "listing_images_select_all" on public.listing_images;
create policy "listing_images_select_all" on public.listing_images for select using (true);

drop policy if exists "favorites_select_own" on public.favorites;
create policy "favorites_select_own" on public.favorites for select
  using (user_id = (select app_private.current_profile_id()));
drop policy if exists "favorites_insert_own" on public.favorites;
create policy "favorites_insert_own" on public.favorites for insert
  with check (user_id = (select app_private.current_profile_id()));
drop policy if exists "favorites_update_own" on public.favorites;
create policy "favorites_update_own" on public.favorites for update
  using (user_id = (select app_private.current_profile_id()))
  with check (user_id = (select app_private.current_profile_id()));
drop policy if exists "favorites_delete_own" on public.favorites;
create policy "favorites_delete_own" on public.favorites for delete
  using (user_id = (select app_private.current_profile_id()));

drop policy if exists "follows_select_all" on public.follows;
create policy "follows_select_all" on public.follows for select using (true);
drop policy if exists "follows_insert_own" on public.follows;
create policy "follows_insert_own" on public.follows for insert
  with check (follower_id = (select app_private.current_profile_id()));
drop policy if exists "follows_update_own" on public.follows;
create policy "follows_update_own" on public.follows for update
  using (follower_id = (select app_private.current_profile_id()))
  with check (follower_id = (select app_private.current_profile_id()));
drop policy if exists "follows_delete_own" on public.follows;
create policy "follows_delete_own" on public.follows for delete
  using (follower_id = (select app_private.current_profile_id()));

drop policy if exists "conversations_select_participant" on public.conversations;
create policy "conversations_select_participant" on public.conversations for select
  using (
    buyer_id = (select app_private.current_profile_id())
    or seller_id = (select app_private.current_profile_id())
  );
drop policy if exists "conversations_insert_participant" on public.conversations;
create policy "conversations_insert_participant" on public.conversations for insert
  with check (
    buyer_id = (select app_private.current_profile_id())
    or seller_id = (select app_private.current_profile_id())
  );
drop policy if exists "conversations_update_participant" on public.conversations;
create policy "conversations_update_participant" on public.conversations for update
  using (
    buyer_id = (select app_private.current_profile_id())
    or seller_id = (select app_private.current_profile_id())
  )
  with check (
    buyer_id = (select app_private.current_profile_id())
    or seller_id = (select app_private.current_profile_id())
  );

drop policy if exists "messages_select_participant" on public.messages;
create policy "messages_select_participant" on public.messages for select
  using (exists (
    select 1 from public.conversations c
    where c.id = conversation_id
      and (
        c.buyer_id = (select app_private.current_profile_id())
        or c.seller_id = (select app_private.current_profile_id())
      )
  ));
drop policy if exists "messages_insert_sender" on public.messages;
create policy "messages_insert_sender" on public.messages for insert
  with check (
    sender_id = (select app_private.current_profile_id())
    and exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (
          c.buyer_id = (select app_private.current_profile_id())
          or c.seller_id = (select app_private.current_profile_id())
        )
    )
  );

drop policy if exists "offers_select_participant" on public.offers;
create policy "offers_select_participant" on public.offers for select
  using (exists (
    select 1 from public.conversations c
    where c.id = conversation_id
      and (
        c.buyer_id = (select app_private.current_profile_id())
        or c.seller_id = (select app_private.current_profile_id())
      )
  ));
drop policy if exists "offers_insert_buyer" on public.offers;
create policy "offers_insert_buyer" on public.offers for insert
  with check (
    buyer_id = (select app_private.current_profile_id())
    and exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and c.buyer_id = (select app_private.current_profile_id())
    )
  );
drop policy if exists "offers_update_participant" on public.offers;
create policy "offers_update_participant" on public.offers for update
  using (exists (
    select 1 from public.conversations c
    where c.id = conversation_id
      and (
        c.buyer_id = (select app_private.current_profile_id())
        or c.seller_id = (select app_private.current_profile_id())
      )
  ))
  with check (exists (
    select 1 from public.conversations c
    where c.id = conversation_id
      and (
        c.buyer_id = (select app_private.current_profile_id())
        or c.seller_id = (select app_private.current_profile_id())
      )
  ));

drop policy if exists "meetups_select_participant" on public.meetups;
create policy "meetups_select_participant" on public.meetups for select
  using (exists (
    select 1 from public.conversations c
    where c.id = conversation_id
      and (
        c.buyer_id = (select app_private.current_profile_id())
        or c.seller_id = (select app_private.current_profile_id())
      )
  ));
drop policy if exists "meetups_insert_participant" on public.meetups;
create policy "meetups_insert_participant" on public.meetups for insert
  with check (exists (
    select 1 from public.conversations c
    where c.id = conversation_id
      and (
        c.buyer_id = (select app_private.current_profile_id())
        or c.seller_id = (select app_private.current_profile_id())
      )
  ));
drop policy if exists "meetups_update_participant" on public.meetups;
create policy "meetups_update_participant" on public.meetups for update
  using (exists (
    select 1 from public.conversations c
    where c.id = conversation_id
      and (
        c.buyer_id = (select app_private.current_profile_id())
        or c.seller_id = (select app_private.current_profile_id())
      )
  ))
  with check (exists (
    select 1 from public.conversations c
    where c.id = conversation_id
      and (
        c.buyer_id = (select app_private.current_profile_id())
        or c.seller_id = (select app_private.current_profile_id())
      )
  ));
drop policy if exists "meetups_delete_participant" on public.meetups;
create policy "meetups_delete_participant" on public.meetups for delete
  using (exists (
    select 1 from public.conversations c
    where c.id = conversation_id
      and (
        c.buyer_id = (select app_private.current_profile_id())
        or c.seller_id = (select app_private.current_profile_id())
      )
  ));

drop policy if exists "reviews_select_all" on public.reviews;
create policy "reviews_select_all" on public.reviews for select using (true);
drop policy if exists "reviews_insert_own" on public.reviews;
create policy "reviews_insert_own" on public.reviews for insert
  with check (author_id = (select app_private.current_profile_id()));
drop policy if exists "reviews_update_own" on public.reviews;
create policy "reviews_update_own" on public.reviews for update
  using (author_id = (select app_private.current_profile_id()))
  with check (author_id = (select app_private.current_profile_id()));
drop policy if exists "reviews_delete_own" on public.reviews;
create policy "reviews_delete_own" on public.reviews for delete
  using (author_id = (select app_private.current_profile_id()));
