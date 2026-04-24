/**
 * Pick-list values for create listing — category, condition, size, brand.
 */

export const LISTING_CATEGORIES = [
  'Clothes',
  'Electronics',
  'Furniture',
  'Books',
  'Sports',
  'Tickets & Events',
  'Other',
] as const;

export const LISTING_CONDITIONS = [
  'New',
  'Like New',
  'Good',
  'Fair',
  'For Parts',
] as const;

export const LISTING_SIZES = [
  'XS',
  'S',
  'M',
  'L',
  'XL',
  'XXL',
  'One Size',
  'N/A',
] as const;

export const LISTING_BRANDS = [
  'No Brand / Unbranded',
  'Independent / Handmade',
  'Local Business',
  'Campus Organization',
  'Generic / Unbranded',
  'Other',
] as const;

const CLOTHES_BRANDS = [
  'Nike',
  'Adidas',
  'Lululemon',
  'Zara',
  'H&M',
  'Uniqlo',
  'Levi\'s',
  'Thrifted / Vintage',
  'No Brand / Unbranded',
  'Independent / Handmade',
  'Other',
] as const;

const CLOTHES_TYPES = [
  'T-Shirt',
  'Hoodie / Sweatshirt',
  'Jacket / Coat',
  'Jeans / Pants',
  'Dress / Skirt',
  'Shoes',
  'Bag',
  'Accessories',
  'Uniform / Campus Gear',
  'Other',
] as const;

const ELECTRONICS_BRANDS = [
  'Apple',
  'Samsung',
  'Google',
  'Microsoft',
  'Dell',
  'HP',
  'Lenovo',
  'Sony',
  'Nintendo',
  'Anker',
  'No Brand / Unbranded',
  'Other',
] as const;

const ELECTRONICS_TYPES = [
  'Phone',
  'Laptop',
  'Tablet',
  'Desktop',
  'Monitor',
  'Gaming Console',
  'Headphones / Audio',
  'Camera',
  'Calculator',
  'Accessory',
  'Other',
] as const;

const FURNITURE_BRANDS = [
  'IKEA',
  'West Elm',
  'Ashley',
  'Wayfair',
  'Target',
  'Walmart',
  'Amazon Basics',
  'No Brand / Unbranded',
  'Handmade / Custom',
  'Other',
] as const;

const FURNITURE_TYPES = [
  'Desk',
  'Chair',
  'Bed Frame',
  'Mattress',
  'Dresser',
  'Bookshelf',
  'Nightstand',
  'Sofa / Futon',
  'Table',
  'Storage Unit',
  'Other',
] as const;

const BOOK_PUBLISHERS = [
  'Pearson',
  'McGraw Hill',
  'Cengage',
  'Wiley',
  'Oxford',
  'Cambridge',
  'Penguin Random House',
  'No Publisher / Self-Published',
  'Other',
] as const;

const BOOK_TYPES = [
  'Textbook',
  'Workbook',
  'Novel',
  'Reference',
  'Study Guide',
  'Prep Book',
  'Manga / Comics',
  'Other',
] as const;

const SPORTS_BRANDS = [
  'Nike',
  'Adidas',
  'Under Armour',
  'Puma',
  'Wilson',
  'Spalding',
  'Titleist',
  'Yeti',
  'No Brand / Unbranded',
  'Other',
] as const;

const SPORTS_TYPES = [
  'Apparel',
  'Shoes',
  'Gym Equipment',
  'Ball Sports Gear',
  'Racket Sports Gear',
  'Cycling Gear',
  'Outdoor / Camping',
  'Fitness Tracker',
  'Other',
] as const;

const EVENT_ORGS = [
  'Live Nation',
  'AXS',
  'Ticketmaster',
  'University / Campus Org',
  'Student Club',
  'Independent Organizer',
  'Venue Box Office',
  'Other',
] as const;

const EVENT_TYPES = [
  'Concert',
  'Festival',
  'Sports Game',
  'Conference',
  'Workshop',
  'Theater / Comedy',
  'Campus Event',
  'Party / Social',
  'Other',
] as const;

const OTHER_BRANDS = [
  'No Brand / Unbranded',
  'Independent / Handmade',
  'Local Business',
  'Campus Organization',
  'Other',
] as const;

const OTHER_TYPES = [
  'Collectible',
  'Art',
  'Beauty / Personal Care',
  'Kitchen / Home Goods',
  'Office Supplies',
  'Pet Supplies',
  'Automotive Accessory',
  'Other',
] as const;

const LISTING_STORAGES = [
  '32GB',
  '64GB',
  '128GB',
  '256GB',
  '512GB',
  '1TB',
  'N/A',
] as const;

const LISTING_COLORS = [
  'Black',
  'White',
  'Silver',
  'Gray',
  'Blue',
  'Red',
  'Green',
  'Multicolor',
  'Other',
] as const;

export type ListingAttributeKey = 'brand' | 'model' | 'storage' | 'color';

export type ListingAttributeConfig = {
  key: ListingAttributeKey;
  label: string;
  options: readonly string[];
};

const CATEGORY_ATTRIBUTES: Record<ListingCategory, readonly ListingAttributeConfig[]> = {
  Clothes: [
    { key: 'brand', label: 'Brand', options: CLOTHES_BRANDS },
    { key: 'model', label: 'Type', options: CLOTHES_TYPES },
    { key: 'color', label: 'Color', options: LISTING_COLORS },
  ],
  Electronics: [
    { key: 'brand', label: 'Brand', options: ELECTRONICS_BRANDS },
    { key: 'model', label: 'Type', options: ELECTRONICS_TYPES },
    { key: 'storage', label: 'Storage', options: LISTING_STORAGES },
    { key: 'color', label: 'Color', options: LISTING_COLORS },
  ],
  Furniture: [
    { key: 'brand', label: 'Brand', options: FURNITURE_BRANDS },
    { key: 'model', label: 'Type', options: FURNITURE_TYPES },
    { key: 'color', label: 'Color', options: LISTING_COLORS },
  ],
  Books: [
    { key: 'brand', label: 'Publisher', options: BOOK_PUBLISHERS },
    { key: 'model', label: 'Type', options: BOOK_TYPES },
  ],
  Sports: [
    { key: 'brand', label: 'Brand', options: SPORTS_BRANDS },
    { key: 'model', label: 'Type', options: SPORTS_TYPES },
    { key: 'color', label: 'Color', options: LISTING_COLORS },
  ],
  'Tickets & Events': [
    { key: 'brand', label: 'Organizer', options: EVENT_ORGS },
    { key: 'model', label: 'Event Type', options: EVENT_TYPES },
  ],
  Other: [
    { key: 'brand', label: 'Brand', options: OTHER_BRANDS },
    { key: 'model', label: 'Type', options: OTHER_TYPES },
    { key: 'color', label: 'Color', options: LISTING_COLORS },
  ],
};

export function getListingAttributesForCategory(
  category: string,
): readonly ListingAttributeConfig[] {
  if (!category || !(category in CATEGORY_ATTRIBUTES)) {
    return [];
  }
  return CATEGORY_ATTRIBUTES[category as ListingCategory];
}

export type ListingCategory = (typeof LISTING_CATEGORIES)[number];
export type ListingCondition = (typeof LISTING_CONDITIONS)[number];
export type ListingSize = (typeof LISTING_SIZES)[number];
export type ListingBrand = (typeof LISTING_BRANDS)[number];
