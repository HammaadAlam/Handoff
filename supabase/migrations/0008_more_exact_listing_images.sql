-- 0008_more_exact_listing_images.sql
-- Additional exact-title Unsplash mappings for remaining seeded/demo titles.
-- Run after 0007. Safe to rerun.

update public.listings
set image_url = case lower(title)
  when 'chem 101 lab kit' then 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=600&q=80'
  when 'iclicker (gen 2)' then 'https://images.unsplash.com/photo-1587145820266-a5951ee6c620?w=600&q=80'
  when 'mini fridge — 3.1 cu ft' then 'https://images.unsplash.com/photo-1586201375761-83865001e31b?w=600&q=80'
  when 'microwave — dorm size' then 'https://images.unsplash.com/photo-1586201375761-83865001e31b?w=600&q=80'
  when 'whiteboard + markers' then 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&q=80'
  when 'backpack — jansport' then 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80'
  when 'umbrella (compact)' then 'https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?w=600&q=80'
  when 'extension cord 6-outlet' then 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&q=80'
  when 'hdmi cable 6ft' then 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&q=80'
  when 'usb-c hub' then 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&q=80'
  when 'ring light (small)' then 'https://images.unsplash.com/photo-1629429408209-1f912961dbd8?w=600&q=80'
  when 'printer ink (hp)' then 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=600&q=80'
  when 'foam mattress topper — twin xl' then 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&q=80'
  when 'laundry hamper' then 'https://images.unsplash.com/photo-1595428776513-d54e20fe486c?w=600&q=80'
  when 'storage cubes' then 'https://images.unsplash.com/photo-1582582429416-5f45f6c2c18b?w=600&q=80'
  when 'floor cushion' then 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=600&q=80'
  when 'clip fan' then 'https://images.unsplash.com/photo-1545259741-2ea3ebf61fa3?w=600&q=80'
  when 'under-bed bins (2)' then 'https://images.unsplash.com/photo-1595428776513-d54e20fe486c?w=600&q=80'
  when 'cork board + pins' then 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=600&q=80'
  when 'desk drawer unit' then 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80'
  when 'basketball upper bowl' then 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600&q=80'
  when 'comedy show — 2 seats' then 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=600&q=80'
  when 'homecoming wristband' then 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&q=80'
  when 'rivalry game parking pass' then 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600&q=80'
  when 'theater dept. play' then 'https://images.unsplash.com/photo-1503095396549-807759245b35?w=600&q=80'
  when 'greek formal +1' then 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=600&q=80'
  when 'intramural jersey' then 'https://images.unsplash.com/photo-1511886929837-354d827aae26?w=600&q=80'
  when 'outdoor movie blanket spot' then 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=600&q=80'
  when 'lecture extra credit ticket' then 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=600&q=80'
  when 'band showcase' then 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=600&q=80'
  when 'charity 5k bib' then 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600&q=80'
  when 'esports lan pass' then 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&q=80'
  when 'film club screening' then 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&q=80'
  else image_url
end
where title is not null
  and title <> '';

