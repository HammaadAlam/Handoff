-- 0004_demo_write_policies.sql — tighten write policies after the demo phase.
-- Applied via Supabase MCP as `handoff_demo_write_policies` on 2026-04-21.

drop policy if exists "favorites_write_own" on public.favorites;
drop policy if exists "favorites_insert_own" on public.favorites;
drop policy if exists "favorites_update_own" on public.favorites;
drop policy if exists "favorites_delete_own" on public.favorites;

create policy "favorites_insert_own" on public.favorites for insert
  with check (user_id = (select app_private.current_profile_id()));
create policy "favorites_update_own" on public.favorites for update
  using (user_id = (select app_private.current_profile_id()))
  with check (user_id = (select app_private.current_profile_id()));
create policy "favorites_delete_own" on public.favorites for delete
  using (user_id = (select app_private.current_profile_id()));

drop policy if exists "favorites_select_own" on public.favorites;
create policy "favorites_select_own" on public.favorites for select
  using (user_id = (select app_private.current_profile_id()));

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
