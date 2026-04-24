-- 0005_align_listing_images_by_title.sql
-- One-time data cleanup: align existing listing images with title keywords.
-- Safe to re-run (idempotent): each run re-applies deterministic mappings.

update public.listings
set image_url = case
  -- Clothes
  when lower(title) similar to '%(windbreaker|jacket|coat|fleece|hoodie)%'
    then 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&q=80'
  when lower(title) similar to '%(shoe|sneaker|slides|sandals)%'
    then 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80'
  when lower(title) similar to '%(shorts|jeans|sweatpants|leggings)%'
    then 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&q=80'
  when lower(title) similar to '%(shirt|cap|beanie|gloves|socks)%'
    then 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80'

  -- Furniture / dorm essentials
  when lower(title) similar to '%(desk|chair|bookshelf|nightstand|table|drawer)%'
    then 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=80'
  when lower(title) similar to '%(lamp|fan|mirror|rack|bins|hamper)%'
    then 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&q=80'

  -- Events / sports
  when lower(title) similar to '%(ticket|concert|show|screening|pass|wristband)%'
    then 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&q=80'
  when lower(title) similar to '%(football|basketball|esports|5k|jersey)%'
    then 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600&q=80'

  -- Tech / school gear
  when lower(title) similar to '%(calculator|iclicker|usb-c|hub|hdmi)%'
    then 'https://images.unsplash.com/photo-1587145820266-a5951ee6c620?w=600&q=80'
  when lower(title) similar to '%(fridge|microwave|printer)%'
    then 'https://images.unsplash.com/photo-1586201375761-83865001e31b?w=600&q=80'
  when lower(title) similar to '%(backpack|umbrella|cord|whiteboard|mattress)%'
    then 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80'

  else image_url
end
where title is not null
  and title <> '';

