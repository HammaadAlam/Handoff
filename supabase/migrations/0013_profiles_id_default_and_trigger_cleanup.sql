-- 0013_profiles_id_default_and_trigger_cleanup.sql
-- Applied via Supabase MCP as `profiles_id_default_and_trigger_cleanup` on 2026-04-23.
--
-- Fixes a bug where new sign-ups never produced a `public.profiles` row,
-- leaving the listing/create flow with "Profile not ready". Root causes:
--   1. `public.profiles.id` had no default, so any insert that omitted `id`
--      (e.g. the client-side fallback in src/services/viewer.ts) failed with
--      "null value in column \"id\" violates not-null constraint".
--   2. Two AFTER INSERT triggers on `auth.users` raced each other
--      (`handoff_new_auth_user` + `on_auth_user_created`). Only the latter
--      was idempotent, so the former could throw on handle collisions and
--      leave the account without a profile.
--
-- This migration:
--   * Adds DEFAULT gen_random_uuid() to profiles.id.
--   * Drops the redundant `handoff_new_auth_user` trigger + function,
--     keeping the idempotent `on_auth_user_created` / handle_new_user().
--   * Backfills profiles for any auth.users rows that are still missing one.

alter table public.profiles
  alter column id set default gen_random_uuid();

drop trigger if exists handoff_new_auth_user on auth.users;
drop function if exists public.handle_new_auth_user();

do $$
declare
  au record;
  base_handle text;
  candidate text;
  collision int;
begin
  for au in select u.id, u.email, u.raw_user_meta_data
            from auth.users u
            left join public.profiles p on p.auth_user_id = u.id
            where p.id is null
  loop
    base_handle := regexp_replace(
      lower(split_part(coalesce(au.email, ''), '@', 1)),
      '[^a-z0-9_]+', '_', 'g'
    );
    base_handle := regexp_replace(base_handle, '^_+|_+$', '', 'g');
    if base_handle is null or base_handle = '' then
      base_handle := 'user';
    end if;
    if length(base_handle) > 24 then
      base_handle := substr(base_handle, 1, 24);
    end if;

    candidate := base_handle;
    collision := 0;
    while exists (select 1 from public.profiles where handle = candidate) loop
      collision := collision + 1;
      candidate := base_handle || collision::text;
    end loop;

    insert into public.profiles (
      id, handle, display_name, avatar_url, auth_user_id, is_verified_edu
    ) values (
      gen_random_uuid(),
      candidate,
      coalesce(
        nullif(au.raw_user_meta_data->>'full_name', ''),
        nullif(au.raw_user_meta_data->>'name', ''),
        nullif(au.raw_user_meta_data->>'display_name', ''),
        candidate
      ),
      coalesce(
        nullif(au.raw_user_meta_data->>'avatar_url', ''),
        nullif(au.raw_user_meta_data->>'picture', ''),
        'https://api.dicebear.com/7.x/identicon/svg?seed=' || candidate
      ),
      au.id,
      coalesce(au.email, '') ilike '%.edu'
    );
  end loop;
end $$;
