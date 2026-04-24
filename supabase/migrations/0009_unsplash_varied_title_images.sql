-- 0009_unsplash_varied_title_images.sql
-- Assign varied Unsplash images per listing title/brand so similar items
-- do not all share the same photo. Free/public Unsplash image URLs only.
-- Run after 0008. Safe to rerun.

with keyed as (
  select
    id,
    lower(coalesce(title, '')) as t,
    lower(coalesce(brand, '')) as b,
    abs((('x' || substr(md5(id::text), 1, 8))::bit(32)::int)) % 3 as bucket
  from public.listings
)
update public.listings l
set image_url = case
  -- Nike shoes: 3-way variation
  when k.b like '%nike%' and k.t similar to '%(shoe|sneaker|slides|sandals)%' then
    case k.bucket
      when 0 then 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80'
      when 1 then 'https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?w=600&q=80'
      else 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=600&q=80'
    end

  -- Adidas shoes: 3-way variation
  when k.b like '%adidas%' and k.t similar to '%(shoe|sneaker|slides|sandals)%' then
    case k.bucket
      when 0 then 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&q=80'
      when 1 then 'https://images.unsplash.com/photo-1518002171953-a080ee817e1f?w=600&q=80'
      else 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&q=80'
    end

  -- Generic shoes
  when k.t similar to '%(shoe|sneaker|slides|sandals)%' then
    case k.bucket
      when 0 then 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80'
      when 1 then 'https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?w=600&q=80'
      else 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&q=80'
    end

  -- Hoodies / outerwear
  when k.t similar to '%(hoodie|fleece|windbreaker|jacket|coat)%' then
    case k.bucket
      when 0 then 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&q=80'
      when 1 then 'https://images.unsplash.com/photo-1619603364904-c0498317e145?w=600&q=80'
      else 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&q=80'
    end

  -- Tees/shirts
  when k.t similar to '%(shirt|tee)%' then
    case k.bucket
      when 0 then 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80'
      when 1 then 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&q=80'
      else 'https://images.unsplash.com/photo-1503342394128-c104d54dba01?w=600&q=80'
    end

  -- Desk/table
  when k.t similar to '%(desk|table|drawer)%' then
    case k.bucket
      when 0 then 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80'
      when 1 then 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=600&q=80'
      else 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=600&q=80'
    end

  -- Chair/stool
  when k.t similar to '%(chair|stool|seat)%' then
    case k.bucket
      when 0 then 'https://images.unsplash.com/photo-1503602642458-232111445657?w=600&q=80'
      when 1 then 'https://images.unsplash.com/photo-1519947486511-46149fa0a254?w=600&q=80'
      else 'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=600&q=80'
    end

  -- MacBook/laptop
  when k.t similar to '%(macbook|laptop)%' then
    case k.bucket
      when 0 then 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&q=80'
      when 1 then 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&q=80'
      else 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&q=80'
    end

  -- Phones
  when k.t similar to '%(phone|iphone|android)%' then
    case k.bucket
      when 0 then 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&q=80'
      when 1 then 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=600&q=80'
      else 'https://images.unsplash.com/photo-1589492477829-5e65395b66cc?w=600&q=80'
    end

  -- Events/tickets
  when k.t similar to '%(ticket|concert|show|screening|pass|wristband)%' then
    case k.bucket
      when 0 then 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&q=80'
      when 1 then 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=600&q=80'
      else 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=600&q=80'
    end

  else l.image_url
end
from keyed k
where l.id = k.id
  and k.t <> '';

