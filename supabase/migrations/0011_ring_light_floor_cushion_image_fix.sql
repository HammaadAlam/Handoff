-- 0011_ring_light_floor_cushion_image_fix.sql
-- Ring light rule previously mixed in a generic tech (mouse) URL via pickStable;
-- floor cushion used living-room / desk shots. Align DB with resolver-safe URLs.

update public.listings
set image_url = 'https://images.unsplash.com/photo-1629429408209-1f912961dbd8?w=600&q=80'
where replace(replace(lower(trim(title)), '—', '-'), '–', '-') = 'ring light (small)';

update public.listings
set image_url = 'https://images.unsplash.com/photo-1567016432779-094069958ea5?w=600&q=80'
where replace(replace(lower(trim(title)), '—', '-'), '–', '-') = 'floor cushion';
