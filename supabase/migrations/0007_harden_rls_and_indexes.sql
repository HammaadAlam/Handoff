-- 0007_harden_rls_and_indexes.sql — remove demo-era anonymous access, move
-- helper functions out of exposed schemas, add missing FK indexes, and
-- simplify RLS policy evaluation for better security and performance.

create schema if not exists app_private;

create or replace function app_private.current_profile_id() returns uuid
language sql stable security definer set search_path = public as $$
  select id from public.profiles where auth_user_id = auth.uid() limit 1;
$$;

create index if not exists messages_sender_idx on public.messages (sender_id);
create index if not exists offers_buyer_idx on public.offers (buyer_id);
create index if not exists reviews_author_idx on public.reviews (author_id);

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

drop policy if exists "favorites_write_own" on public.favorites;
drop policy if exists "favorites_select_own" on public.favorites;
drop policy if exists "favorites_insert_own" on public.favorites;
drop policy if exists "favorites_update_own" on public.favorites;
drop policy if exists "favorites_delete_own" on public.favorites;

create policy "favorites_select_own" on public.favorites for select
  using (user_id = (select app_private.current_profile_id()));
create policy "favorites_insert_own" on public.favorites for insert
  with check (user_id = (select app_private.current_profile_id()));
create policy "favorites_update_own" on public.favorites for update
  using (user_id = (select app_private.current_profile_id()))
  with check (user_id = (select app_private.current_profile_id()));
create policy "favorites_delete_own" on public.favorites for delete
  using (user_id = (select app_private.current_profile_id()));

drop policy if exists "follows_write_own" on public.follows;
drop policy if exists "follows_insert_own" on public.follows;
drop policy if exists "follows_update_own" on public.follows;
drop policy if exists "follows_delete_own" on public.follows;

create policy "follows_insert_own" on public.follows for insert
  with check (follower_id = (select app_private.current_profile_id()));
create policy "follows_update_own" on public.follows for update
  using (follower_id = (select app_private.current_profile_id()))
  with check (follower_id = (select app_private.current_profile_id()));
create policy "follows_delete_own" on public.follows for delete
  using (follower_id = (select app_private.current_profile_id()));

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

drop policy if exists "meetups_write_participant" on public.meetups;
drop policy if exists "meetups_insert_participant" on public.meetups;
drop policy if exists "meetups_update_participant" on public.meetups;
drop policy if exists "meetups_delete_participant" on public.meetups;

create policy "meetups_insert_participant" on public.meetups for insert
  with check (exists (
    select 1 from public.conversations c
    where c.id = conversation_id
      and (
        c.buyer_id = (select app_private.current_profile_id())
        or c.seller_id = (select app_private.current_profile_id())
      )
  ));
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
create policy "meetups_delete_participant" on public.meetups for delete
  using (exists (
    select 1 from public.conversations c
    where c.id = conversation_id
      and (
        c.buyer_id = (select app_private.current_profile_id())
        or c.seller_id = (select app_private.current_profile_id())
      )
  ));

drop policy if exists "reviews_write_own" on public.reviews;
drop policy if exists "reviews_insert_own" on public.reviews;
drop policy if exists "reviews_update_own" on public.reviews;
drop policy if exists "reviews_delete_own" on public.reviews;

create policy "reviews_insert_own" on public.reviews for insert
  with check (author_id = (select app_private.current_profile_id()));
create policy "reviews_update_own" on public.reviews for update
  using (author_id = (select app_private.current_profile_id()))
  with check (author_id = (select app_private.current_profile_id()));
create policy "reviews_delete_own" on public.reviews for delete
  using (author_id = (select app_private.current_profile_id()));

drop policy if exists "events_mutate_owner" on public.events;
drop policy if exists "events_insert_owner" on public.events;
drop policy if exists "events_update_owner" on public.events;
drop policy if exists "events_delete_owner" on public.events;

create policy "events_insert_owner" on public.events for insert
  with check (owner_id = (select app_private.current_profile_id()));
create policy "events_update_owner" on public.events for update
  using (owner_id = (select app_private.current_profile_id()))
  with check (owner_id = (select app_private.current_profile_id()));
create policy "events_delete_owner" on public.events for delete
  using (owner_id = (select app_private.current_profile_id()));

drop policy if exists "listings_insert_owner" on public.listings;
create policy "listings_insert_owner" on public.listings for insert to authenticated
  with check (exists (
    select 1
    from public.profiles p
    where p.id = listings.seller_id
      and p.auth_user_id = (select auth.uid())
  ));

drop policy if exists "listings_update_owner" on public.listings;
create policy "listings_update_owner" on public.listings for update to authenticated
  using (exists (
    select 1
    from public.profiles p
    where p.id = listings.seller_id
      and p.auth_user_id = (select auth.uid())
  ))
  with check (exists (
    select 1
    from public.profiles p
    where p.id = listings.seller_id
      and p.auth_user_id = (select auth.uid())
  ));

drop policy if exists "listings_delete_owner" on public.listings;
create policy "listings_delete_owner" on public.listings for delete to authenticated
  using (exists (
    select 1
    from public.profiles p
    where p.id = listings.seller_id
      and p.auth_user_id = (select auth.uid())
  ));

drop policy if exists "profiles_insert_self" on public.profiles;
create policy "profiles_insert_self" on public.profiles for insert to authenticated
  with check (auth_user_id = (select auth.uid()));

drop policy if exists "profiles_update_self" on public.profiles;
create policy "profiles_update_self" on public.profiles for update to authenticated
  using (auth_user_id = (select auth.uid()))
  with check (auth_user_id = (select auth.uid()));

drop function if exists public.current_profile_id();
