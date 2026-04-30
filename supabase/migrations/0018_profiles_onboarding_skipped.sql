alter table public.profiles
  add column if not exists onboarding_skipped boolean not null default false;

comment on column public.profiles.onboarding_skipped is
  'User dismissed first-run personalization; app is usable without onboarding_completed.';
