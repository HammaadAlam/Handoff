-- 0003_demo_read_policies.sql — relax SELECT policies on messaging tables for
-- the demo/anon path so seed data renders without a linked auth user. Any
-- signed-in session still falls through to participant-only visibility.
-- Applied via Supabase MCP as `handoff_demo_read_policies` on 2026-04-21.

drop policy if exists "conversations_select_participant" on public.conversations;
create policy "conversations_select_participant" on public.conversations for select
  using (
    auth.uid() is null
    or buyer_id = public.current_profile_id()
    or seller_id = public.current_profile_id()
  );

drop policy if exists "messages_select_participant" on public.messages;
create policy "messages_select_participant" on public.messages for select
  using (
    auth.uid() is null
    or exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.buyer_id = public.current_profile_id() or c.seller_id = public.current_profile_id())
    )
  );

drop policy if exists "offers_select_participant" on public.offers;
create policy "offers_select_participant" on public.offers for select
  using (
    auth.uid() is null
    or exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.buyer_id = public.current_profile_id() or c.seller_id = public.current_profile_id())
    )
  );

drop policy if exists "meetups_select_participant" on public.meetups;
create policy "meetups_select_participant" on public.meetups for select
  using (
    auth.uid() is null
    or exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.buyer_id = public.current_profile_id() or c.seller_id = public.current_profile_id())
    )
  );
