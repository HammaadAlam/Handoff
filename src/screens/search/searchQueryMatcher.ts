import type { ListingItem } from '@/data/mockData';

const QUERY_KEYWORD_MAP: Record<string, string[]> = {
  tech: [
    'tech',
    'laptop',
    'macbook',
    'notebook',
    'iphone',
    'android',
    'phone',
    'tablet',
    'ipad',
    'airpods',
    'earbuds',
    'headphones',
    'monitor',
    'keyboard',
    'mouse',
    'charger',
    'usb',
    'camera',
    'speaker',
    'ring light',
    'calculator',
  ],
  textbook: ['textbook', 'textbooks', 'course book', 'study guide', 'workbook'],
  textbooks: ['textbook', 'textbooks', 'course book', 'study guide', 'workbook'],
  tickets: ['ticket', 'tickets', 'event', 'concert', 'game', 'pass'],
  events: ['ticket', 'tickets', 'event', 'concert', 'game', 'pass'],
  'dorm essentials': [
    'dorm',
    'bedding',
    'pillow',
    'blanket',
    'desk',
    'chair',
    'lamp',
    'storage',
    'shelf',
    'mini fridge',
    'microwave',
    'kettle',
    'kitchen',
  ],
  furniture: [
    'furniture',
    'desk',
    'chair',
    'table',
    'sofa',
    'couch',
    'bed',
    'bookshelf',
    'dresser',
    'nightstand',
    'lamp',
  ],
  clothes: [
    'clothes',
    'clothing',
    'shirt',
    'hoodie',
    'jacket',
    'jeans',
    'pants',
    'shorts',
    'shoes',
    'sneakers',
    'dress',
    'hat',
  ],
};

const TECH_KEYWORDS = QUERY_KEYWORD_MAP.tech ?? [];
const CLOTHES_KEYWORDS = QUERY_KEYWORD_MAP.clothes ?? [];
const FURNITURE_KEYWORDS = QUERY_KEYWORD_MAP.furniture ?? [];
const EVENT_KEYWORDS = QUERY_KEYWORD_MAP.events ?? [];
const TEXTBOOK_KEYWORDS = QUERY_KEYWORD_MAP.textbook ?? [];

function listingHaystack(item: ListingItem): string {
  return [item.title, item.brand, item.category, item.description, item.sellerHandle]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

export function listingMatchesSearchQuery(
  item: ListingItem,
  rawQuery: string,
): boolean {
  const normalizedQuery = rawQuery.trim().toLowerCase();
  if (!normalizedQuery) return true;

  const haystack = listingHaystack(item);
  const itemCategory = (item.category ?? '').trim().toLowerCase();

  const hasAny = (keywords: string[]) => keywords.some((kw) => haystack.includes(kw));

  // Category-card queries should prefer explicit listing category first.
  if (normalizedQuery === 'clothes') {
    if (itemCategory === 'clothes') return true;
    // Guard against tech items leaking into clothes.
    return hasAny(CLOTHES_KEYWORDS) && !hasAny(TECH_KEYWORDS);
  }
  if (normalizedQuery === 'furniture') {
    if (itemCategory === 'furniture') return true;
    return hasAny(FURNITURE_KEYWORDS);
  }
  if (normalizedQuery === 'events' || normalizedQuery === 'tickets') {
    // Tickets category should be strict event inventory only.
    return itemCategory === 'events';
  }
  if (normalizedQuery === 'textbook' || normalizedQuery === 'textbooks') {
    // Avoid false positives like "matebook".
    return hasAny(TEXTBOOK_KEYWORDS) || /\btextbooks?\b/.test(haystack);
  }

  if (haystack.includes(normalizedQuery)) return true;

  const keywords = QUERY_KEYWORD_MAP[normalizedQuery];
  if (keywords?.some((kw) => haystack.includes(kw))) return true;

  const tokens = normalizedQuery.split(/\s+/).filter(Boolean);
  return tokens.length > 1 && tokens.every((t) => haystack.includes(t));
}

