-- 0008_post_seed_title_image_alignment.sql
-- Re-align seeded listing image_url values to the title-based resolver used by
-- the app so Supabase-backed listings match the canonical demo catalog.

update public.listings
set image_url = 'https://images.unsplash.com/photo-1587145820266-a5951ee6c620?w=600&q=80'
where replace(replace(lower(trim(title)), '—', '-'), '–', '-') = 'ti-84 plus calculator';

update public.listings
set image_url = 'https://images.unsplash.com/photo-1619603364904-c0498317e145?w=600&q=80'
where replace(replace(lower(trim(title)), '—', '-'), '–', '-') = 'vintage college hoodie';

update public.listings
set image_url = 'https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?w=600&q=80'
where replace(replace(lower(trim(title)), '—', '-'), '–', '-') = 'umbrella (compact)';

update public.listings
set image_url = 'https://images.unsplash.com/photo-1567016432779-094069958ea5?w=600&q=80'
where replace(replace(lower(trim(title)), '—', '-'), '–', '-') = 'floor cushion';

update public.listings
set image_url = 'https://images.unsplash.com/photo-1629429408209-1f912961dbd8?w=600&q=80'
where replace(replace(lower(trim(title)), '—', '-'), '–', '-') = 'ring light (small)';

update public.listings
set image_url = 'https://images.unsplash.com/photo-1603487742131-4160ec999306?w=600&q=80'
where replace(replace(lower(trim(title)), '—', '-'), '–', '-') = 'sandals - sz 8';

update public.listings
set image_url = 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&q=80'
where replace(replace(lower(trim(title)), '—', '-'), '–', '-') = 'slides - adidas';

update public.listings
set image_url = 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=600&q=80'
where replace(replace(lower(trim(title)), '—', '-'), '–', '-') = 'running shoes sz 9';

update public.listings
set image_url = 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&q=80'
where replace(replace(lower(trim(title)), '—', '-'), '–', '-') = 'windbreaker';
