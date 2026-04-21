-- seed_features.sql — fake data for the feature tables added in 0002_features.sql.
-- Idempotent: deterministic UUIDs + ON CONFLICT DO NOTHING.
-- Run AFTER supabase/schema.sql, migrations/0002_features.sql, and supabase/seed.sql.
--
-- Profile aliases (see src/data/seedCatalog.ts):
--   p1 fahdhkhattak  a0000000-0000-4000-8000-000000000001
--   p2 mia_campus    …0002
--   p3 jake_thrift   …0003
--   p4 sophia_sells  …0004
--   p5 nate_nexus    …0005
--   p6 olivia_outlet …0006
--   p7 ethan_exchange…0007
--   p8 zara_zone     …0008
--   p9 lucas_list    …0009
--   pA emma_extra    …000a

-- Enable a safe upsert target for extra listing photos.
create unique index if not exists listing_images_listing_url_key
  on public.listing_images (listing_id, url);

------------------------------------------------------------------
-- Extra listing photos (cover image stays on public.listings.image_url)
------------------------------------------------------------------
insert into public.listing_images (listing_id, url, position) values
  -- TI-84 (p1)
  ('c0000000-0000-4000-8000-0000000000b5', 'https://picsum.photos/seed/ti84-side/1200/900', 1),
  ('c0000000-0000-4000-8000-0000000000b5', 'https://picsum.photos/seed/ti84-back/1200/900', 2),
  -- Vintage hoodie (p2)
  ('c0000000-0000-4000-8000-0000000000b6', 'https://picsum.photos/seed/hoodie-front/1200/900', 1),
  ('c0000000-0000-4000-8000-0000000000b6', 'https://picsum.photos/seed/hoodie-tag/1200/900', 2),
  -- Microwave (p5)
  ('c0000000-0000-4000-8000-0000000000b9', 'https://picsum.photos/seed/microwave-inside/1200/900', 1),
  -- Chem 101 Lab Kit (p7)
  ('c0000000-0000-4000-8000-0000000000c5', 'https://picsum.photos/seed/chem-kit-open/1200/900', 1),
  ('c0000000-0000-4000-8000-0000000000c5', 'https://picsum.photos/seed/chem-kit-labels/1200/900', 2),
  -- Greek formal +1 (p8)
  ('c0000000-0000-4000-8000-0000000000bc', 'https://picsum.photos/seed/greek-venue/1200/900', 1)
on conflict (listing_id, url) do nothing;

------------------------------------------------------------------
-- Favorites (users saving other sellers' items)
------------------------------------------------------------------
insert into public.favorites (user_id, listing_id) values
  ('a0000000-0000-4000-8000-000000000002', 'c0000000-0000-4000-8000-0000000000bf'),
  ('a0000000-0000-4000-8000-000000000002', 'c0000000-0000-4000-8000-0000000000b7'),
  ('a0000000-0000-4000-8000-000000000003', 'c0000000-0000-4000-8000-0000000000b6'),
  ('a0000000-0000-4000-8000-000000000003', 'c0000000-0000-4000-8000-0000000000c2'),
  ('a0000000-0000-4000-8000-000000000004', 'c0000000-0000-4000-8000-0000000000b9'),
  ('a0000000-0000-4000-8000-000000000004', 'c0000000-0000-4000-8000-0000000000b1'),
  ('a0000000-0000-4000-8000-000000000005', 'c0000000-0000-4000-8000-0000000000bc'),
  ('a0000000-0000-4000-8000-000000000005', 'c0000000-0000-4000-8000-0000000000bd'),
  ('a0000000-0000-4000-8000-000000000006', 'c0000000-0000-4000-8000-0000000000b5'),
  ('a0000000-0000-4000-8000-000000000006', 'c0000000-0000-4000-8000-0000000000c0'),
  ('a0000000-0000-4000-8000-000000000007', 'c0000000-0000-4000-8000-0000000000ba'),
  ('a0000000-0000-4000-8000-000000000007', 'c0000000-0000-4000-8000-0000000000be'),
  ('a0000000-0000-4000-8000-000000000008', 'c0000000-0000-4000-8000-0000000000ad'),
  ('a0000000-0000-4000-8000-000000000008', 'c0000000-0000-4000-8000-0000000000ae'),
  ('a0000000-0000-4000-8000-000000000009', 'c0000000-0000-4000-8000-0000000000af'),
  ('a0000000-0000-4000-8000-000000000009', 'c0000000-0000-4000-8000-0000000000c5'),
  ('a0000000-0000-4000-8000-00000000000a', 'c0000000-0000-4000-8000-0000000000b2'),
  ('a0000000-0000-4000-8000-00000000000a', 'c0000000-0000-4000-8000-0000000000b3'),
  ('a0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-0000000000b0')
on conflict do nothing;

------------------------------------------------------------------
-- Follows (social graph)
------------------------------------------------------------------
insert into public.follows (follower_id, following_id) values
  ('a0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000002'),
  ('a0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000003'),
  ('a0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000005'),
  ('a0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000001'),
  ('a0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000004'),
  ('a0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000001'),
  ('a0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000007'),
  ('a0000000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000008'),
  ('a0000000-0000-4000-8000-000000000005', 'a0000000-0000-4000-8000-000000000001'),
  ('a0000000-0000-4000-8000-000000000005', 'a0000000-0000-4000-8000-000000000002'),
  ('a0000000-0000-4000-8000-000000000006', 'a0000000-0000-4000-8000-000000000001'),
  ('a0000000-0000-4000-8000-000000000007', 'a0000000-0000-4000-8000-000000000001'),
  ('a0000000-0000-4000-8000-000000000007', 'a0000000-0000-4000-8000-000000000008'),
  ('a0000000-0000-4000-8000-000000000008', 'a0000000-0000-4000-8000-000000000004'),
  ('a0000000-0000-4000-8000-000000000009', 'a0000000-0000-4000-8000-00000000000a'),
  ('a0000000-0000-4000-8000-00000000000a', 'a0000000-0000-4000-8000-000000000001')
on conflict do nothing;

------------------------------------------------------------------
-- Conversations (5 threads) + Messages
------------------------------------------------------------------
-- C1: p2 buyer, p1 seller, listing TI-84. Accepted offer + confirmed meetup.
insert into public.conversations (id, listing_id, buyer_id, seller_id, last_message_at, created_at) values
  ('d0000000-0000-4000-8000-000000000001',
   'c0000000-0000-4000-8000-0000000000b5',
   'a0000000-0000-4000-8000-000000000002',
   'a0000000-0000-4000-8000-000000000001',
   now() - interval '1 hour',
   now() - interval '3 days')
on conflict (id) do nothing;

-- C2: p3 buyer, p2 seller, Vintage hoodie. Pending offer.
insert into public.conversations (id, listing_id, buyer_id, seller_id, last_message_at, created_at) values
  ('d0000000-0000-4000-8000-000000000002',
   'c0000000-0000-4000-8000-0000000000b6',
   'a0000000-0000-4000-8000-000000000003',
   'a0000000-0000-4000-8000-000000000002',
   now() - interval '6 hours',
   now() - interval '2 days')
on conflict (id) do nothing;

-- C3: p4 buyer, p5 seller, Microwave. Declined offer.
insert into public.conversations (id, listing_id, buyer_id, seller_id, last_message_at, created_at) values
  ('d0000000-0000-4000-8000-000000000003',
   'c0000000-0000-4000-8000-0000000000b9',
   'a0000000-0000-4000-8000-000000000004',
   'a0000000-0000-4000-8000-000000000005',
   now() - interval '1 day',
   now() - interval '4 days')
on conflict (id) do nothing;

-- C4: p7 buyer, p6 seller, Winter coat. Chatting only.
insert into public.conversations (id, listing_id, buyer_id, seller_id, last_message_at, created_at) values
  ('d0000000-0000-4000-8000-000000000004',
   'c0000000-0000-4000-8000-0000000000ba',
   'a0000000-0000-4000-8000-000000000007',
   'a0000000-0000-4000-8000-000000000006',
   now() - interval '2 hours',
   now() - interval '1 day')
on conflict (id) do nothing;

-- C5: p9 buyer, p4 seller, Slides. Proposed meetup.
insert into public.conversations (id, listing_id, buyer_id, seller_id, last_message_at, created_at) values
  ('d0000000-0000-4000-8000-000000000005',
   'c0000000-0000-4000-8000-0000000000c2',
   'a0000000-0000-4000-8000-000000000009',
   'a0000000-0000-4000-8000-000000000004',
   now() - interval '30 minutes',
   now() - interval '12 hours')
on conflict (id) do nothing;

-- Messages (read_at null = unread; created_at ordered per thread)
insert into public.messages (id, conversation_id, sender_id, body, created_at, read_at) values
  -- C1
  ('e0000000-0000-4000-8000-000000000101', 'd0000000-0000-4000-8000-000000000001',
   'a0000000-0000-4000-8000-000000000002', 'Hey! Is the TI-84 still available?', now() - interval '3 days', now() - interval '3 days'),
  ('e0000000-0000-4000-8000-000000000102', 'd0000000-0000-4000-8000-000000000001',
   'a0000000-0000-4000-8000-000000000001', 'Yep, still up. Comes with the cover and batteries.', now() - interval '3 days' + interval '10 minutes', now() - interval '3 days' + interval '12 minutes'),
  ('e0000000-0000-4000-8000-000000000103', 'd0000000-0000-4000-8000-000000000001',
   'a0000000-0000-4000-8000-000000000002', 'Would you take $150?', now() - interval '2 days', now() - interval '2 days'),
  ('e0000000-0000-4000-8000-000000000104', 'd0000000-0000-4000-8000-000000000001',
   'a0000000-0000-4000-8000-000000000001', 'Deal. I can meet at the Memorial Union lobby tomorrow 3pm.', now() - interval '1 day', now() - interval '1 day'),
  ('e0000000-0000-4000-8000-000000000105', 'd0000000-0000-4000-8000-000000000001',
   'a0000000-0000-4000-8000-000000000002', 'Perfect, see you then!', now() - interval '1 hour', null),

  -- C2
  ('e0000000-0000-4000-8000-000000000201', 'd0000000-0000-4000-8000-000000000002',
   'a0000000-0000-4000-8000-000000000003', 'Is the hoodie true to size? I usually wear M.', now() - interval '2 days', now() - interval '2 days'),
  ('e0000000-0000-4000-8000-000000000202', 'd0000000-0000-4000-8000-000000000002',
   'a0000000-0000-4000-8000-000000000002', 'Runs a little big IMO. M should be perfect.', now() - interval '2 days' + interval '30 minutes', now() - interval '2 days' + interval '1 hour'),
  ('e0000000-0000-4000-8000-000000000203', 'd0000000-0000-4000-8000-000000000002',
   'a0000000-0000-4000-8000-000000000003', 'Cool — putting in an offer for $180.', now() - interval '6 hours', null),

  -- C3
  ('e0000000-0000-4000-8000-000000000301', 'd0000000-0000-4000-8000-000000000003',
   'a0000000-0000-4000-8000-000000000004', 'Does the microwave still work well?', now() - interval '4 days', now() - interval '4 days'),
  ('e0000000-0000-4000-8000-000000000302', 'd0000000-0000-4000-8000-000000000003',
   'a0000000-0000-4000-8000-000000000005', 'Yeah works great, used it for a year.', now() - interval '4 days' + interval '20 minutes', now() - interval '4 days' + interval '1 hour'),
  ('e0000000-0000-4000-8000-000000000303', 'd0000000-0000-4000-8000-000000000003',
   'a0000000-0000-4000-8000-000000000004', 'Can you do $12?', now() - interval '2 days', now() - interval '2 days'),
  ('e0000000-0000-4000-8000-000000000304', 'd0000000-0000-4000-8000-000000000003',
   'a0000000-0000-4000-8000-000000000005', 'Sorry, lowest I can do is $15.', now() - interval '1 day', now() - interval '1 day'),

  -- C4
  ('e0000000-0000-4000-8000-000000000401', 'd0000000-0000-4000-8000-000000000004',
   'a0000000-0000-4000-8000-000000000007', 'Hey, is the coat real down filling?', now() - interval '1 day', now() - interval '1 day'),
  ('e0000000-0000-4000-8000-000000000402', 'd0000000-0000-4000-8000-000000000004',
   'a0000000-0000-4000-8000-000000000006', 'It is synthetic but warm. I wore it all last winter.', now() - interval '20 hours', now() - interval '18 hours'),
  ('e0000000-0000-4000-8000-000000000403', 'd0000000-0000-4000-8000-000000000004',
   'a0000000-0000-4000-8000-000000000007', 'Gotcha, thanks. Let me think on it.', now() - interval '2 hours', null),

  -- C5
  ('e0000000-0000-4000-8000-000000000501', 'd0000000-0000-4000-8000-000000000005',
   'a0000000-0000-4000-8000-000000000009', 'Are these size 10?', now() - interval '12 hours', now() - interval '12 hours'),
  ('e0000000-0000-4000-8000-000000000502', 'd0000000-0000-4000-8000-000000000005',
   'a0000000-0000-4000-8000-000000000004', 'Yes! Barely worn. Can meet at the library steps.', now() - interval '11 hours', now() - interval '11 hours'),
  ('e0000000-0000-4000-8000-000000000503', 'd0000000-0000-4000-8000-000000000005',
   'a0000000-0000-4000-8000-000000000009', 'Proposed a meetup time — let me know.', now() - interval '30 minutes', null)
on conflict (id) do nothing;

------------------------------------------------------------------
-- Offers
------------------------------------------------------------------
insert into public.offers (id, conversation_id, buyer_id, amount_cents, status, created_at) values
  -- Accepted (C1)
  ('f0000000-0000-4000-8000-000000000001',
   'd0000000-0000-4000-8000-000000000001',
   'a0000000-0000-4000-8000-000000000002',
   15000, 'accepted', now() - interval '2 days'),
  -- Pending (C2)
  ('f0000000-0000-4000-8000-000000000002',
   'd0000000-0000-4000-8000-000000000002',
   'a0000000-0000-4000-8000-000000000003',
   18000, 'pending', now() - interval '6 hours'),
  -- Declined (C3)
  ('f0000000-0000-4000-8000-000000000003',
   'd0000000-0000-4000-8000-000000000003',
   'a0000000-0000-4000-8000-000000000004',
   1200, 'declined', now() - interval '2 days')
on conflict (id) do nothing;

------------------------------------------------------------------
-- Meetups
------------------------------------------------------------------
insert into public.meetups (id, conversation_id, location_label, lat, lng, scheduled_at, status, created_at) values
  -- Confirmed (C1)
  ('11111111-1111-4111-8111-000000000001',
   'd0000000-0000-4000-8000-000000000001',
   'Memorial Union lobby', 33.4242, -111.9281,
   now() + interval '1 day', 'confirmed', now() - interval '1 day'),
  -- Proposed (C5)
  ('11111111-1111-4111-8111-000000000002',
   'd0000000-0000-4000-8000-000000000005',
   'Library steps', 33.4176, -111.9336,
   now() + interval '2 days', 'proposed', now() - interval '30 minutes')
on conflict (id) do nothing;

------------------------------------------------------------------
-- Reviews
------------------------------------------------------------------
insert into public.reviews (id, subject_id, author_id, rating, body, created_at) values
  ('22222222-2222-4222-8222-000000000001',
   'a0000000-0000-4000-8000-000000000001',
   'a0000000-0000-4000-8000-000000000002',
   5, 'Smooth pickup, highly recommend.', now() - interval '20 days'),
  ('22222222-2222-4222-8222-000000000002',
   'a0000000-0000-4000-8000-000000000001',
   'a0000000-0000-4000-8000-000000000003',
   5, 'Great seller. Responsive and fair price.', now() - interval '18 days'),
  ('22222222-2222-4222-8222-000000000003',
   'a0000000-0000-4000-8000-000000000006',
   'a0000000-0000-4000-8000-000000000007',
   4, 'Nice coat, a bit smaller than listed but seller was honest.', now() - interval '15 days'),
  ('22222222-2222-4222-8222-000000000004',
   'a0000000-0000-4000-8000-000000000005',
   'a0000000-0000-4000-8000-000000000004',
   3, 'Microwave worked but needed a clean.', now() - interval '12 days'),
  ('22222222-2222-4222-8222-000000000005',
   'a0000000-0000-4000-8000-000000000004',
   'a0000000-0000-4000-8000-000000000009',
   5, 'Slides in great shape, met at the library as planned.', now() - interval '10 days'),
  ('22222222-2222-4222-8222-000000000006',
   'a0000000-0000-4000-8000-000000000002',
   'a0000000-0000-4000-8000-000000000006',
   5, 'Hoodie was exactly as pictured.', now() - interval '9 days'),
  ('22222222-2222-4222-8222-000000000007',
   'a0000000-0000-4000-8000-000000000003',
   'a0000000-0000-4000-8000-000000000008',
   4, 'Bookshelf was heavy to move solo, otherwise perfect.', now() - interval '8 days'),
  ('22222222-2222-4222-8222-000000000008',
   'a0000000-0000-4000-8000-000000000008',
   'a0000000-0000-4000-8000-00000000000a',
   5, 'Windbreaker is great, thanks Zara!', now() - interval '7 days'),
  ('22222222-2222-4222-8222-000000000009',
   'a0000000-0000-4000-8000-000000000007',
   'a0000000-0000-4000-8000-000000000005',
   5, 'USB-C hub worked right away.', now() - interval '6 days'),
  ('22222222-2222-4222-8222-000000000010',
   'a0000000-0000-4000-8000-000000000009',
   'a0000000-0000-4000-8000-000000000001',
   4, 'Cork board arrived with a pin missing, otherwise good.', now() - interval '5 days'),
  ('22222222-2222-4222-8222-000000000011',
   'a0000000-0000-4000-8000-00000000000a',
   'a0000000-0000-4000-8000-000000000002',
   5, 'Sandals in great condition!', now() - interval '4 days'),
  ('22222222-2222-4222-8222-000000000012',
   'a0000000-0000-4000-8000-000000000004',
   'a0000000-0000-4000-8000-000000000006',
   5, 'Leggings fit perfectly, thanks!', now() - interval '2 days')
on conflict (id) do nothing;

------------------------------------------------------------------
-- Keep profiles.rating_avg / review_count / followers_count in sync with the
-- new rows (safe to re-run).
------------------------------------------------------------------
update public.profiles p set
  rating_avg = coalesce(r.avg_rating, p.rating_avg),
  review_count = coalesce(r.cnt, 0)
from (
  select subject_id,
         round(avg(rating)::numeric, 1) as avg_rating,
         count(*)::int as cnt
  from public.reviews group by subject_id
) r
where r.subject_id = p.id;

update public.profiles p set
  followers_count = coalesce(f.cnt, 0)
from (
  select following_id, count(*)::int as cnt
  from public.follows group by following_id
) f
where f.following_id = p.id;
