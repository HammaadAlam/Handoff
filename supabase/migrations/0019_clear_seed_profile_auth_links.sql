-- Seed/demo catalog rows use fixed UUIDs (see supabase/seed.sql). They must never keep
-- auth.users links: a real account would otherwise resolve to that profile id, see the
-- seed seller's listings on Profile → Shop, and get "Remove Listing" on those items.

update public.profiles
set auth_user_id = null
where id::text like 'a0000000-0000-4000-8000-%'
  and auth_user_id is not null;
