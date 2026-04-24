-- 0006_expand_listing_image_keyword_mapping.sql
-- Expands title->image mapping coverage with more specific keywords.
-- Run after 0005 to improve Clothes/Furniture/Tech accuracy.

update public.listings
set image_url = case
  -- Clothes: more specific first
  when lower(title) similar to '%(hoodie|fleece|windbreaker|jacket|coat)%'
    then 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&q=80'
  when lower(title) similar to '%(socks)%'
    then 'https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?w=600&q=80'
  when lower(title) similar to '%(cap|beanie)%'
    then 'https://images.unsplash.com/photo-1521369909029-2afed882baee?w=600&q=80'
  when lower(title) similar to '%(shirt|tee)%'
    then 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80'
  when lower(title) similar to '%(shoe|sneaker|slides|sandals)%'
    then 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80'
  when lower(title) similar to '%(shorts|jeans|sweatpants|leggings)%'
    then 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&q=80'

  -- Furniture / dorm
  when lower(title) similar to '%(desk|table|drawer)%'
    then 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80'
  when lower(title) similar to '%(chair|stool|seat)%'
    then 'https://images.unsplash.com/photo-1503602642458-232111445657?w=600&q=80'
  when lower(title) similar to '%(bookshelf|book|textbook)%'
    then 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=600&q=80'
  when lower(title) similar to '%(lamp)%'
    then 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&q=80'
  when lower(title) similar to '%(mirror)%'
    then 'https://images.unsplash.com/photo-1618220179428-22790b461013?w=600&q=80'
  when lower(title) similar to '%(rack|hamper|bins)%'
    then 'https://images.unsplash.com/photo-1595428776513-d54e20fe486c?w=600&q=80'

  -- Events / sports
  when lower(title) similar to '%(ticket|concert|show|screening|pass|wristband)%'
    then 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&q=80'
  when lower(title) similar to '%(football|basketball|esports|5k|jersey)%'
    then 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600&q=80'

  -- Tech / essentials
  when lower(title) similar to '%(calculator|iclicker)%'
    then 'https://images.unsplash.com/photo-1587145820266-a5951ee6c620?w=600&q=80'
  when lower(title) similar to '%(usb-c|hub|hdmi|cable)%'
    then 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&q=80'
  when lower(title) similar to '%(laptop|macbook)%'
    then 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&q=80'
  when lower(title) similar to '%(phone|iphone|android)%'
    then 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&q=80'
  when lower(title) similar to '%(fridge|microwave|printer)%'
    then 'https://images.unsplash.com/photo-1586201375761-83865001e31b?w=600&q=80'
  when lower(title) similar to '%(backpack)%'
    then 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80'
  when lower(title) similar to '%(umbrella)%'
    then 'https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?w=600&q=80'
  when lower(title) similar to '%(whiteboard)%'
    then 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&q=80'
  when lower(title) similar to '%(mattress)%'
    then 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&q=80'

  else image_url
end
where title is not null
  and title <> '';

