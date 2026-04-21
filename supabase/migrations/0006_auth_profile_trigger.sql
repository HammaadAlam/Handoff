-- 0006_auth_profile_trigger.sql — auto-provision a public.profiles row whenever
-- a new auth.users row is created. Handles duplicate handles by appending a
-- numeric suffix, derives display_name / avatar_url from auth metadata when
-- present, and flags .edu emails as is_verified_edu.
-- Applied via Supabase MCP as `handoff_auth_user_profile_trigger` on 2026-04-21.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  base_handle text;
  candidate text;
  collision int := 0;
  meta_name text;
  meta_avatar text;
begin
  if exists (select 1 from public.profiles where auth_user_id = new.id) then
    return new;
  end if;

  base_handle := regexp_replace(
    lower(split_part(coalesce(new.email, ''), '@', 1)),
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
  while exists (select 1 from public.profiles where handle = candidate) loop
    collision := collision + 1;
    candidate := base_handle || collision::text;
  end loop;

  meta_name := coalesce(
    nullif(new.raw_user_meta_data->>'full_name', ''),
    nullif(new.raw_user_meta_data->>'name', ''),
    nullif(new.raw_user_meta_data->>'display_name', ''),
    candidate
  );
  meta_avatar := coalesce(
    nullif(new.raw_user_meta_data->>'avatar_url', ''),
    nullif(new.raw_user_meta_data->>'picture', ''),
    'https://api.dicebear.com/7.x/identicon/svg?seed=' || candidate
  );

  insert into public.profiles (
    id, handle, display_name, avatar_url, auth_user_id, is_verified_edu
  ) values (
    gen_random_uuid(),
    candidate,
    meta_name,
    meta_avatar,
    new.id,
    coalesce(new.email, '') ilike '%.edu'
  );

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
