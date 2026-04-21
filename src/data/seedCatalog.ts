/**
 * Canonical marketplace demo data — 10 seller profiles + 220 listings.
 * UUIDs match supabase/seed.sql (run `npm run db:emit-seed` to regenerate SQL).
 * Listing images: Unsplash URLs chosen for casual / dorm / desk context (not white-seamless catalog).
 */

export const PROFILE_DEMO_HANDLE = 'fahdhkhattak';

export type SeedCategory = 'For You' | 'Clothes' | 'Furniture' | 'Events';

export type SeedProfile = {
  id: string;
  handle: string;
  displayName: string;
  avatarUrl: string;
  bio: string;
  campus: string;
  primaryMeetupSpot: string;
  ratingAvg: number;
  reviewCount: number;
  itemsSold: number;
  followersCount: number;
  isVerifiedEdu: boolean;
};

export type SeedListing = {
  id: string;
  sellerId: string;
  title: string;
  price: string;
  imageUrl: string;
  category: SeedCategory;
  condition: 'New' | 'Like New' | 'Good' | 'Fair';
  description: string;
  brand?: string;
  size?: string;
  locationLabel: string;
  postedAgo: string;
  status: 'active' | 'sold';
};

function profileUuid(n: number): string {
  return `a0000000-0000-4000-8000-${n.toString(16).padStart(12, '0')}`;
}

function listingUuid(n: number): string {
  return `c0000000-0000-4000-8000-${n.toString(16).padStart(12, '0')}`;
}

/** Casual / peer-marketplace style (desk, dorm, indoor, imperfect framing) */
const UGC_IMAGES: string[] = [
  'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=600&q=80',
  'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&q=80',
  'https://images.unsplash.com/photo-1522199710521-72d69614c702?w=600&q=80',
  'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&q=80',
  'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&q=80',
  'https://images.unsplash.com/photo-1517336714731-b4896fd6eb2d?w=600&q=80',
  'https://images.unsplash.com/photo-1541807084-5c52b2b3ad0f?w=600&q=80',
  'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&q=80',
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80',
  'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&q=80',
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80',
  'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=600&q=80',
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80',
  'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&q=80',
  'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&q=80',
  'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80',
  'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=80',
  'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&q=80',
  'https://images.unsplash.com/photo-1595428776513-d54e20fe486c?w=600&q=80',
  'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80',
  'https://images.unsplash.com/photo-1567538096639-e914c58b9e55?w=600&q=80',
  'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&q=80',
  'https://images.unsplash.com/photo-1582582621959-48d27397dc69?w=600&q=80',
  'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&q=80',
  'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=600&q=80',
  'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&q=80',
  'https://images.unsplash.com/photo-1586201375761-83865001e31b?w=600&q=80',
  'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=600&q=80',
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
  'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=600&q=80',
  'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=600&q=80',
  'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=600&q=80',
  'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=600&q=80',
  'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&q=80',
  'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&q=80',
  'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&q=80',
  'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&q=80',
  'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80',
  'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=600&q=80',
  'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600&q=80',
  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&q=80',
  'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=600&q=80',
  'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&q=80',
  'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&q=80',
  'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&q=80',
  'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&q=80',
];

const CONDITIONS: Array<SeedListing['condition']> = [
  'New',
  'Like New',
  'Good',
  'Fair',
  'Good',
  'Like New',
];

const CATS: SeedCategory[] = ['For You', 'Clothes', 'Furniture', 'Events'];

const TITLE_ROTATIONS: Record<SeedCategory, string[]> = {
  'For You': [
    'TI-84 Plus Calculator',
    'Chem 101 Lab Kit',
    'iClicker (Gen 2)',
    'Mini fridge — 3.1 cu ft',
    'Microwave — dorm size',
    'Desk lamp LED',
    'Whiteboard + markers',
    'Backpack — JanSport',
    'Umbrella (compact)',
    'Extension cord 6-outlet',
    'HDMI cable 6ft',
    'USB-C hub',
    'Ring light (small)',
    'Printer ink (HP)',
    'Foam mattress topper — Twin XL',
  ],
  Clothes: [
    'Nike Dri-FIT shorts',
    'Vintage college hoodie',
    'Levi 511 jeans',
    'Patagonia fleece — M',
    'Running shoes sz 9',
    'Winter coat — L',
    'Beanie + gloves set',
    'Formal dress shirt — 15.5',
    'Leggings (black)',
    'Sandals — sz 8',
    'Baseball cap',
    'Sweatpants — grey',
    'Windbreaker',
    'Slides — Adidas',
    'Crew socks 6-pack',
  ],
  Furniture: [
    'IKEA desk — white',
    'Rolling desk chair',
    'Bookshelf 4-tier',
    'Nightstand wood',
    'Folding table',
    'Storage cubes',
    'Laundry hamper',
    'Full-length mirror',
    'Shoe rack',
    'TV stand',
    'Floor cushion',
    'Clip fan',
    'Under-bed bins (2)',
    'Cork board + pins',
    'Desk drawer unit',
  ],
  Events: [
    'Football student ticket',
    'Basketball upper bowl',
    'Spring concert GA',
    'Comedy show — 2 seats',
    'Homecoming wristband',
    'Rivalry game parking pass',
    'Theater dept. play',
    'Greek formal +1',
    'Intramural jersey',
    'Outdoor movie blanket spot',
    'Lecture extra credit ticket',
    'Band showcase',
    'Charity 5K bib',
    'Esports LAN pass',
    'Film club screening',
  ],
};

const BRANDS = [
  '—',
  'IKEA',
  'Nike',
  'Target',
  'Amazon',
  'Apple',
  'HP',
  'Samsung',
  'Adidas',
  'Patagonia',
];

const SPOTS = [
  'Student Union steps',
  'Library café',
  'Engineering quad',
  'Dorm mailroom',
  'Rec center lobby',
  'North campus lot',
];

const AGO = ['2h ago', '5h ago', '1d ago', '2d ago', '3d ago', '1w ago'];

export const SEED_PROFILES: SeedProfile[] = [
  {
    id: profileUuid(1),
    handle: 'fahdhkhattak',
    displayName: 'Fahd Khattak',
    avatarUrl:
      'https://images.unsplash.com/photo-1633332755192-727a05c4013f?w=200&q=80',
    bio: 'Clearing closet + dorm stuff. Bundle deals DM me.',
    campus: 'Main campus',
    primaryMeetupSpot: 'Student Union north entrance',
    ratingAvg: 4.9,
    reviewCount: 42,
    itemsSold: 18,
    followersCount: 67,
    isVerifiedEdu: true,
  },
  {
    id: profileUuid(2),
    handle: 'mia_campus',
    displayName: 'Mia Chen',
    avatarUrl:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80',
    bio: 'Psych major. Mostly clothes and textbooks.',
    campus: 'Main campus',
    primaryMeetupSpot: 'Library café',
    ratingAvg: 4.8,
    reviewCount: 31,
    itemsSold: 24,
    followersCount: 54,
    isVerifiedEdu: true,
  },
  {
    id: profileUuid(3),
    handle: 'jake_thrift',
    displayName: 'Jake Morrison',
    avatarUrl:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
    bio: 'Engineering. Tech, furniture, bike parts.',
    campus: 'North campus',
    primaryMeetupSpot: 'Engineering building atrium',
    ratingAvg: 4.7,
    reviewCount: 58,
    itemsSold: 36,
    followersCount: 102,
    isVerifiedEdu: true,
  },
  {
    id: profileUuid(4),
    handle: 'sophia_sells',
    displayName: 'Sophia Reyes',
    avatarUrl:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80',
    bio: 'Design student. Pickup afternoons.',
    campus: 'Arts quad',
    primaryMeetupSpot: 'Fine arts lobby',
    ratingAvg: 5.0,
    reviewCount: 19,
    itemsSold: 12,
    followersCount: 41,
    isVerifiedEdu: true,
  },
  {
    id: profileUuid(5),
    handle: 'nate_nexus',
    displayName: 'Nate Williams',
    avatarUrl:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80',
    bio: 'Selling what I upgraded. Cash or Venmo.',
    campus: 'Main campus',
    primaryMeetupSpot: 'Rec center entrance',
    ratingAvg: 4.6,
    reviewCount: 27,
    itemsSold: 21,
    followersCount: 38,
    isVerifiedEdu: false,
  },
  {
    id: profileUuid(6),
    handle: 'olivia_outlet',
    displayName: 'Olivia Park',
    avatarUrl:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80',
    bio: 'Business school. Events + formal wear.',
    campus: 'South campus',
    primaryMeetupSpot: 'Business school courtyard',
    ratingAvg: 4.9,
    reviewCount: 33,
    itemsSold: 29,
    followersCount: 76,
    isVerifiedEdu: true,
  },
  {
    id: profileUuid(7),
    handle: 'ethan_exchange',
    displayName: 'Ethan Brooks',
    avatarUrl:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80',
    bio: 'Grad student downsizing. Furniture heavy.',
    campus: 'Grad housing',
    primaryMeetupSpot: 'Grad apartments circle',
    ratingAvg: 4.8,
    reviewCount: 44,
    itemsSold: 31,
    followersCount: 63,
    isVerifiedEdu: true,
  },
  {
    id: profileUuid(8),
    handle: 'zara_zone',
    displayName: 'Zara Ahmed',
    avatarUrl:
      'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=200&q=80',
    bio: 'Bio pre-med. Lab gear + textbooks.',
    campus: 'Main campus',
    primaryMeetupSpot: 'Science hall benches',
    ratingAvg: 4.7,
    reviewCount: 22,
    itemsSold: 15,
    followersCount: 49,
    isVerifiedEdu: true,
  },
  {
    id: profileUuid(9),
    handle: 'lucas_list',
    displayName: 'Lucas Nguyen',
    avatarUrl:
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80',
    bio: 'CS major. Monitors, keyboards, chairs.',
    campus: 'North campus',
    primaryMeetupSpot: 'CS lab hallway',
    ratingAvg: 4.9,
    reviewCount: 61,
    itemsSold: 44,
    followersCount: 118,
    isVerifiedEdu: true,
  },
  {
    id: profileUuid(10),
    handle: 'emma_extra',
    displayName: 'Emma Sullivan',
    avatarUrl:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80',
    bio: 'Dorm essentials + tickets. Fast replies.',
    campus: 'East dorms',
    primaryMeetupSpot: 'East dorm desk',
    ratingAvg: 4.8,
    reviewCount: 35,
    itemsSold: 26,
    followersCount: 71,
    isVerifiedEdu: true,
  },
];

function buildListings(): SeedListing[] {
  const listings: SeedListing[] = [];
  const nProfiles = SEED_PROFILES.length;

  for (let i = 0; i < 220; i++) {
    const idx = i + 1;
    const seller = SEED_PROFILES[i % nProfiles];
    const cat = CATS[i % CATS.length];
    const pool = TITLE_ROTATIONS[cat];
    const title = pool[i % pool.length];
    const priceN = 8 + ((i * 17) % 240);
    const price = `$${priceN}`;
    const imageUrl = UGC_IMAGES[i % UGC_IMAGES.length];
    const condition = CONDITIONS[i % CONDITIONS.length];
    const brand = BRANDS[i % BRANDS.length];
    const size =
      cat === 'Clothes' ? ['S', 'M', 'L', 'XL', '8', '9', '10', '32x30'][i % 8] : undefined;
    const status: 'active' | 'sold' = idx % 17 === 0 ? 'sold' : 'active';

    listings.push({
      id: listingUuid(idx),
      sellerId: seller.id,
      title,
      price,
      imageUrl,
      category: cat,
      condition,
      description: `Campus pickup. ${condition} condition. Message for bundle pricing.`,
      brand: brand === '—' ? undefined : brand,
      size,
      locationLabel: SPOTS[i % SPOTS.length],
      postedAgo: AGO[i % AGO.length],
      status,
    });
  }

  return listings;
}

export const SEED_LISTINGS: SeedListing[] = buildListings();

export function getSeedProfileByHandle(handle: string): SeedProfile | undefined {
  return SEED_PROFILES.find((p) => p.handle === handle);
}

export function getSeedProfileById(id: string): SeedProfile | undefined {
  return SEED_PROFILES.find((p) => p.id === id);
}
