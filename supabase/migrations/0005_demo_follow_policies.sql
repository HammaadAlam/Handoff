-- 0005_demo_follow_policies.sql — allow anon (auth.uid() is null) to follow /
-- unfollow for the handoff demo database. Signed-in users remain bound to
-- their linked profile. Tighten before prod.
-- Applied via Supabase MCP as `handoff_demo_follow_policies` on 2026-04-21.

drop policy if exists "follows_write_own" on public.follows;
create policy "follows_write_own" on public.follows for all
  using (
    auth.uid() is null
    or follower_id = public.current_profile_id()
  )
  with check (
    auth.uid() is null
    or follower_id = public.current_profile_id()
  );
