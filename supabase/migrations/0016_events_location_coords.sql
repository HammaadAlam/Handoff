alter table public.events
  add column if not exists location_lat double precision,
  add column if not exists location_lng double precision;
