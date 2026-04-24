-- 0012_follow_counts_trigger.sql
-- Keep public.profiles.followers_count in sync with public.follows.

create or replace function app_private.refresh_followers_count_for_profile(
  target_profile_id uuid
)
returns void
language sql
security definer
set search_path = public, app_private
as $$
  update public.profiles p
  set followers_count = (
    select count(*)::int
    from public.follows f
    where f.following_id = p.id
  )
  where p.id = target_profile_id;
$$;

create or replace function app_private.on_follow_changed_refresh_counts()
returns trigger
language plpgsql
security definer
set search_path = public, app_private
as $$
begin
  if tg_op = 'INSERT' then
    perform app_private.refresh_followers_count_for_profile(new.following_id);
    return new;
  end if;

  if tg_op = 'DELETE' then
    perform app_private.refresh_followers_count_for_profile(old.following_id);
    return old;
  end if;

  if tg_op = 'UPDATE' then
    if old.following_id is distinct from new.following_id then
      perform app_private.refresh_followers_count_for_profile(old.following_id);
      perform app_private.refresh_followers_count_for_profile(new.following_id);
    else
      perform app_private.refresh_followers_count_for_profile(new.following_id);
    end if;
    return new;
  end if;

  return null;
end;
$$;

drop trigger if exists follows_refresh_followers_count on public.follows;
create trigger follows_refresh_followers_count
after insert or update or delete on public.follows
for each row
execute function app_private.on_follow_changed_refresh_counts();

-- Backfill counts once on migration.
update public.profiles p
set followers_count = (
  select count(*)::int
  from public.follows f
  where f.following_id = p.id
);
