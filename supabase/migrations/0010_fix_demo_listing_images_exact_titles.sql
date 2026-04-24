-- 0010_fix_demo_listing_images_exact_titles.sql
-- Corrects a few seeded titles whose image_url was wrong or overwritten by
-- generic keyword/variation logic. Safe to rerun.

update public.listings
set image_url = 'https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?w=600&q=80'
where replace(replace(lower(trim(title)), '—', '-'), '–', '-') = 'umbrella (compact)';

update public.listings
set image_url = 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=600&q=80'
where replace(replace(lower(trim(title)), '—', '-'), '–', '-') = 'floor cushion';

update public.listings
set image_url = 'https://images.unsplash.com/photo-1629429408209-1f912961dbd8?w=600&q=80'
where replace(replace(lower(trim(title)), '—', '-'), '–', '-') = 'ring light (small)';

update public.listings
set image_url = 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&q=80'
where replace(replace(lower(trim(title)), '—', '-'), '–', '-') = 'slides - adidas';
