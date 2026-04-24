-- 0005_demo_follow_policies.sql — tighten follow policies after the demo phase.
-- Applied via Supabase MCP as `handoff_demo_follow_policies` on 2026-04-21.

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
