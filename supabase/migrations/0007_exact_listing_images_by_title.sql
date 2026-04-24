-- 0007_exact_listing_images_by_title.sql
-- More accurate title -> Unsplash image mapping for common seeded/demo titles.
-- Run after 0006. Safe to rerun.

update public.listings
set image_url = case lower(title)
  when 'nike dri-fit shorts' then 'https://images.unsplash.com/photo-1518459031867-a89b944bffe4?w=600&q=80'
  when 'vintage college hoodie' then 'https://images.unsplash.com/photo-1619603364904-c0498317e145?w=600&q=80'
  when 'levi 511 jeans' then 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&q=80'
  when 'patagonia fleece — m' then 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&q=80'
  when 'running shoes sz 9' then 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80'
  when 'winter coat — l' then 'https://images.unsplash.com/photo-1548883354-94bcfe321cbb?w=600&q=80'
  when 'beanie + gloves set' then 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&q=80'
  when 'formal dress shirt — 15.5' then 'https://images.unsplash.com/photo-1603252109303-2751441dd157?w=600&q=80'
  when 'leggings (black)' then 'https://images.unsplash.com/photo-1506629905607-45b6de84f048?w=600&q=80'
  when 'sandals — sz 8' then 'https://images.unsplash.com/photo-1603487742131-4160ec999306?w=600&q=80'
  when 'baseball cap' then 'https://images.unsplash.com/photo-1521369909029-2afed882baee?w=600&q=80'
  when 'sweatpants — grey' then 'https://images.unsplash.com/photo-1617952236317-4ed3d3e2e25a?w=600&q=80'
  when 'windbreaker' then 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&q=80'
  when 'slides — adidas' then 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&q=80'
  when 'crew socks 6-pack' then 'https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?w=600&q=80'
  when 'ikea desk — white' then 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80'
  when 'rolling desk chair' then 'https://images.unsplash.com/photo-1503602642458-232111445657?w=600&q=80'
  when 'bookshelf 4-tier' then 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=600&q=80'
  when 'nightstand wood' then 'https://images.unsplash.com/photo-1595515106864-f1e32d80a1f1?w=600&q=80'
  when 'folding table' then 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=600&q=80'
  when 'full-length mirror' then 'https://images.unsplash.com/photo-1618220179428-22790b461013?w=600&q=80'
  when 'shoe rack' then 'https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=600&q=80'
  when 'tv stand' then 'https://images.unsplash.com/photo-1616627456010-9d4f3f0fd2a4?w=600&q=80'
  when 'desk lamp led' then 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&q=80'
  when 'football student ticket' then 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600&q=80'
  when 'spring concert ga' then 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&q=80'
  when 'ti-84 plus calculator' then 'https://images.unsplash.com/photo-1587145820266-a5951ee6c620?w=600&q=80'
  else image_url
end
where title is not null
  and title <> '';

