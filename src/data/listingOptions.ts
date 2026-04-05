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
  'Nike',
  'Adidas',
  'Apple',
  'Samsung',
  'Generic / Unbranded',
  'LSU / Campus',
  'Other',
] as const;

export type ListingCategory = (typeof LISTING_CATEGORIES)[number];
export type ListingCondition = (typeof LISTING_CONDITIONS)[number];
export type ListingSize = (typeof LISTING_SIZES)[number];
export type ListingBrand = (typeof LISTING_BRANDS)[number];
