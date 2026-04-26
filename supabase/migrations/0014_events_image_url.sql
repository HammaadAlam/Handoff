-- Add optional event cover image for event creation flow previews.
alter table public.events
  add column if not exists image_url text;
