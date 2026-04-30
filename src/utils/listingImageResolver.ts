/**
 * Listing Image Resolver — shared utilities.
 */
type ListingImageInput = {
  id?: string | null;
  title: string;
  brand?: string | null;
  model?: string | null;
  category?: string | null;
  fallbackUrl?: string | null;
};

type ImageRule = {
  titleKeywords?: string[];
  brandKeywords?: string[];
  categoryKeywords?: string[];
  images: string[];
};

const DEFAULT_FALLBACK =
  'https://images.unsplash.com/photo-1514996937319-344454492b37?w=600&q=80';

const EXACT_TITLE_IMAGES: Record<string, string> = {
  'vintage college hoodie':
    'https://images.unsplash.com/photo-1619603364904-c0498317e145?w=600&q=80',
  'winter coat - l':
    'https://images.unsplash.com/photo-1548883354-94bcfe321cbb?w=600&q=80',
  'umbrella (compact)':
    'https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?w=600&q=80',
  'floor cushion':
    'https://images.unsplash.com/photo-1567016432779-094069958ea5?w=600&q=80',
  'ring light (small)':
    'https://images.unsplash.com/photo-1629429408209-1f912961dbd8?w=600&q=80',
  'sandals - sz 8':
    'https://images.unsplash.com/photo-1603487742131-4160ec999306?w=600&q=80',
  'slides - adidas':
    'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&q=80',
  'running shoes sz 9':
    'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=600&q=80',
  windbreaker:
    'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&q=80',
};

const RULES: ImageRule[] = [
  {
    titleKeywords: ['umbrella'],
    images: [
      'https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?w=600&q=80',
      'https://images.unsplash.com/photo-1527004013197-933c4bb611b3?w=600&q=80',
      'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=600&q=80',
    ],
  },
  {
    titleKeywords: ['floor cushion', 'seat cushion', 'throw pillow'],
    images: [
      'https://images.unsplash.com/photo-1567016432779-094069958ea5?w=600&q=80',
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&q=80',
      'https://images.unsplash.com/photo-1567016432779-094069958ea5?w=600&q=80',
    ],
  },
  {
    titleKeywords: ['ring light'],
    // Only lighting gear — avoid generic tech photos (e.g. mouse) used elsewhere in seed pools.
    images: [
      'https://images.unsplash.com/photo-1629429408209-1f912961dbd8?w=600&q=80',
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&q=80',
      'https://images.unsplash.com/photo-1629429408209-1f912961dbd8?w=600&q=80',
    ],
  },

  // Specific shoe types before generic shoe buckets.
  {
    titleKeywords: ['sandals'],
    images: [
      'https://images.unsplash.com/photo-1603487742131-4160ec999306?w=600&q=80',
      'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=600&q=80',
      'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&q=80',
    ],
  },
  {
    titleKeywords: ['slides'],
    images: [
      'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&q=80',
      'https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?w=600&q=80',
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&q=80',
    ],
  },

  // Brand-specific shoes (only true footwear titles — avoid matching unrelated Nike items)
  {
    titleKeywords: ['shoe', 'sneaker', 'running shoes'],
    brandKeywords: ['nike'],
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80',
      'https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?w=600&q=80',
      'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=600&q=80',
    ],
  },
  {
    titleKeywords: ['shoe', 'sneaker', 'running shoes'],
    brandKeywords: ['adidas'],
    images: [
      'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&q=80',
      'https://images.unsplash.com/photo-1518002171953-a080ee817e1f?w=600&q=80',
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&q=80',
    ],
  },

  // Clothes
  {
    titleKeywords: ['hoodie', 'fleece', 'windbreaker', 'jacket', 'coat'],
    images: [
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&q=80',
      'https://images.unsplash.com/photo-1619603364904-c0498317e145?w=600&q=80',
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&q=80',
    ],
  },
  {
    titleKeywords: ['shirt', 'tee', 't-shirt'],
    images: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80',
      'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&q=80',
      'https://images.unsplash.com/photo-1503342394128-c104d54dba01?w=600&q=80',
    ],
  },
  {
    titleKeywords: ['jeans', 'leggings', 'shorts', 'sweatpants'],
    images: [
      'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&q=80',
      'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&q=80',
      'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&q=80',
    ],
  },
  {
    titleKeywords: ['cap', 'beanie', 'socks'],
    images: [
      'https://images.unsplash.com/photo-1521369909029-2afed882baee?w=600&q=80',
      'https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?w=600&q=80',
      'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&q=80',
    ],
  },

  // Furniture
  {
    titleKeywords: ['desk', 'table', 'drawer'],
    images: [
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80',
      'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=600&q=80',
      'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=600&q=80',
    ],
  },
  {
    titleKeywords: ['chair', 'stool'],
    images: [
      'https://images.unsplash.com/photo-1503602642458-232111445657?w=600&q=80',
      'https://images.unsplash.com/photo-1519947486511-46149fa0a254?w=600&q=80',
      'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=600&q=80',
    ],
  },
  {
    titleKeywords: ['bookshelf', 'book', 'textbook'],
    images: [
      'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=600&q=80',
      'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&q=80',
      'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=600&q=80',
    ],
  },
  {
    titleKeywords: ['lamp', 'mirror', 'rack', 'hamper', 'bins'],
    images: [
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&q=80',
      'https://images.unsplash.com/photo-1618220179428-22790b461013?w=600&q=80',
      'https://images.unsplash.com/photo-1595428776513-d54e20fe486c?w=600&q=80',
    ],
  },

  // Tech / accessories
  {
    titleKeywords: ['macbook', 'laptop'],
    images: [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&q=80',
      'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&q=80',
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&q=80',
    ],
  },
  {
    titleKeywords: ['phone', 'iphone', 'android'],
    images: [
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&q=80',
      'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=600&q=80',
      'https://images.unsplash.com/photo-1589492477829-5e65395b66cc?w=600&q=80',
    ],
  },
  {
    titleKeywords: ['calculator', 'iclicker', 'usb-c', 'hub', 'hdmi', 'cable'],
    images: [
      'https://images.unsplash.com/photo-1587145820266-a5951ee6c620?w=600&q=80',
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&q=80',
      'https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=600&q=80',
    ],
  },

  // Events / sport
  {
    titleKeywords: ['ticket', 'concert', 'show', 'screening', 'pass', 'wristband'],
    images: [
      'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&q=80',
      'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=600&q=80',
      'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=600&q=80',
    ],
  },
  {
    titleKeywords: ['football', 'basketball', 'esports', 'jersey', '5k'],
    images: [
      'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600&q=80',
      'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600&q=80',
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&q=80',
    ],
  },

  // Category fallbacks
  {
    categoryKeywords: ['clothes'],
    images: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80',
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&q=80',
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80',
    ],
  },
  {
    categoryKeywords: ['furniture'],
    images: [
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=80',
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80',
      'https://images.unsplash.com/photo-1503602642458-232111445657?w=600&q=80',
    ],
  },
  {
    categoryKeywords: ['events'],
    images: [
      'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&q=80',
      'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=600&q=80',
      'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600&q=80',
    ],
  },
];

/** Lowercase + fold common unicode punctuation so titles match EXACT keys and rules. */
export function normalizeListingMatchText(v: string | null | undefined): string {
  let s = (v ?? '')
    .normalize('NFKC')
    .toLowerCase()
    .trim();
  s = s.replace(/[\u2018\u2019\u0060]/g, "'");
  s = s.replace(/[\u201c\u201d]/g, '"');
  s = s.replace(/\u2013|\u2014|\u2212/g, '-');
  s = s.replace(/\uff08/g, '(').replace(/\uff09/g, ')');
  s = s.replace(/[\u00a0\u2000-\u200d\u202f\u205f\u3000\ufeff]/g, ' ');
  s = s.replace(/\s+/g, ' ');
  return s;
}

function stableHash(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function pickStable(images: string[], key: string): string {
  if (images.length === 0) return DEFAULT_FALLBACK;
  return images[stableHash(key) % images.length];
}

function includesAny(haystack: string, needles: string[]): boolean {
  return needles.some((n) => haystack.includes(n));
}

function matchesRule(
  rule: ImageRule,
  normalized: { title: string; brand: string; category: string },
): boolean {
  if (rule.titleKeywords && !includesAny(normalized.title, rule.titleKeywords)) {
    return false;
  }
  if (rule.brandKeywords && !includesAny(normalized.brand, rule.brandKeywords)) {
    return false;
  }
  if (rule.categoryKeywords && !includesAny(normalized.category, rule.categoryKeywords)) {
    return false;
  }
  return true;
}

export function resolveListingImage(input: ListingImageInput): string {
  const normalized = {
    title: normalizeListingMatchText(input.title),
    brand: normalizeListingMatchText(input.brand),
    category: normalizeListingMatchText(input.category),
  };
  const stableKey = [
    normalizeListingMatchText(input.id),
    normalized.title,
    normalized.brand,
    normalizeListingMatchText(input.model),
  ]
    .filter(Boolean)
    .join('|');

  const exact = EXACT_TITLE_IMAGES[normalized.title];
  if (exact) return exact;

  const matched = RULES.find((rule) => matchesRule(rule, normalized));
  if (matched) {
    return pickStable(matched.images, stableKey);
  }
  return input.fallbackUrl ?? DEFAULT_FALLBACK;
}

