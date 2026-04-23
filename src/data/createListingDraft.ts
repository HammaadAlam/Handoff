export type MeetupMethod = 'meet' | 'ship';

export type CreateListingDraft = {
  acceptOffers: boolean;
  brand: string;
  category: string;
  color: string;
  condition: string;
  description: string;
  imageUri: string;
  /** Lowest acceptable offer ($); empty string means no floor set */
  lowestOffer: string;
  meetupLocation: string;
  meetupMethod: MeetupMethod;
  model: string;
  price: string;
  storage: string;
  title: string;
};

export const SAMPLE_LISTING_PHOTOS = [
  'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=900&q=80',
  'https://images.unsplash.com/photo-1541807084-5c52b2b3ad0f?w=900&q=80',
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=900&q=80',
] as const;

export const DEFAULT_CREATE_LISTING_DRAFT: CreateListingDraft = {
  acceptOffers: true,
  brand: '',
  category: '',
  color: '',
  condition: '',
  description: '',
  imageUri: '',
  lowestOffer: '',
  meetupLocation: '',
  meetupMethod: 'meet',
  model: '',
  price: '',
  storage: '',
  title: '',
};

export function mergeCreateListingDraft(
  draft?: Partial<CreateListingDraft>,
): CreateListingDraft {
  return {
    ...DEFAULT_CREATE_LISTING_DRAFT,
    ...draft,
  };
}
