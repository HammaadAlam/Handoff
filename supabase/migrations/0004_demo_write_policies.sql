-- 0004_demo_write_policies.sql — allow anon (auth.uid() is null) to perform
-- the basic marketplace writes needed for the UI to be interactive without
-- a linked auth user. Signed-in users remain bound to participant / owner
-- checks. Intended for the handoff demo database; tighten before prod.
-- Applied via Supabase MCP as `handoff_demo_write_policies` on 2026-04-21.

drop policy if exists "favorites_write_own" on public.favorites;
create policy "favorites_write_own" on public.favorites for all
  using (
    auth.uid() is null
    or user_id = public.current_profile_id()
  )
  with check (
    auth.uid() is null
    or user_id = public.current_profile_id()
  );

drop policy if exists "favorites_select_own" on public.favorites;
create policy "favorites_select_own" on public.favorites for select
  using (
    auth.uid() is null
    or user_id = public.current_profile_id()
  );

drop policy if exists "messages_insert_sender" on public.messages;
create policy "messages_insert_sender" on public.messages for insert
  with check (
    auth.uid() is null
    or (
      sender_id = public.current_profile_id()
      and exists (
        select 1 from public.conversations c
        where c.id = conversation_id
          and (c.buyer_id = public.current_profile_id() or c.seller_id = public.current_profile_id())
      )
    )
  );

drop policy if exists "conversations_insert_participant" on public.conversations;
create policy "conversations_insert_participant" on public.conversations for insert
  with check (
    auth.uid() is null
    or buyer_id = public.current_profile_id()
    or seller_id = public.current_profile_id()
  );

drop policy if exists "conversations_update_participant" on public.conversations;
create policy "conversations_update_participant" on public.conversations for update
  using (
    auth.uid() is null
    or buyer_id = public.current_profile_id()
    or seller_id = public.current_profile_id()
  )
  with check (
    auth.uid() is null
    or buyer_id = public.current_profile_id()
    or seller_id = public.current_profile_id()
  );
