alter table public.profiles
  add column if not exists class_year text not null default '',
  add column if not exists gender text not null default '',
  add column if not exists clothing_size text not null default '',
  add column if not exists height_text text not null default '',
  add column if not exists weight_text text not null default '',
  add column if not exists preference_tags text[] not null default '{}',
  add column if not exists onboarding_completed boolean not null default false;

-- Existing accounts should not be blocked into onboarding retroactively.
update public.profiles
set onboarding_completed = true
where onboarding_completed is false;
