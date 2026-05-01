/**
 * Navigation types — tabs nested under root stack for listing → chat → meetup flows.
 */
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { CompositeNavigationProp, NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { CreateEventDraft } from '@/data/createEventDraft';
import type { CreateListingDraft } from '@/data/createListingDraft';

/** Search tab is its own stack (landing, query, results, filters). */
export type SearchFilters = {
  sort: 'best' | 'low' | 'high';
  priceMin: number;
  priceMax: number;
  condition: 'New' | 'Like New' | 'Used' | null;
  sellerType: 'Any' | 'Individual' | 'Campus shop';
  mileage: 'Any' | 'On campus' | 'Within 5 mi' | 'Within 15 mi';
  /** Optional multi-select categories. Empty means "all categories". */
  categories?: string[];
};

export type SearchStackParamList = {
  SearchHome: undefined;
  SearchQuery: { initialQuery?: string } | undefined;
  CategoryResults: { query: string; filters?: SearchFilters };
  Filters:
    | {
        query: string;
        filters?: SearchFilters;
        /** Update this route's params and pop back instead of pushing results. */
        targetRouteKey?: string;
      }
    | undefined;
};

export type HomeStackParamList = {
  HomeLanding: undefined;
  CategoryResults: {
    query: string;
    filters?: SearchFilters;
    homeCategory?: 'For You' | 'Clothes' | 'Furniture' | 'Tech' | 'Events';
    homeSection?: 'hot' | 'saved' | 'recent' | 'more';
    /** Explicit title to display for Home "See all" routes. */
    title?: string;
    /** Exact listing ids from Home section rail/grid to keep See all scoped. */
    sectionListingIds?: string[];
  };
  Filters:
    | {
        query: string;
        filters?: SearchFilters;
        targetRouteKey?: string;
      }
    | undefined;
};

/** Create Listing tab: entry → photos → review/edit → price → meetup → preview → success */
export type CreateListingStackParamList = {
  CreateEntry: undefined;
  CameraCapture: { mode?: 'quick' | 'manual' } | undefined;
  ListingDetails: {
    mode?: 'quick' | 'manual';
    capturedImageUri?: string;
    draft?: Partial<CreateListingDraft>;
  } | undefined;
  SetPrice: { draft?: Partial<CreateListingDraft> } | undefined;
  PickupLocation: { draft?: Partial<CreateListingDraft> } | undefined;
  ListingPreview: { draft?: Partial<CreateListingDraft> } | undefined;
  ListingSuccess: { draft?: Partial<CreateListingDraft> } | undefined;
};

export type MainTabParamList = {
  Home: NavigatorScreenParams<HomeStackParamList> | undefined;
  Search: NavigatorScreenParams<SearchStackParamList>;
  CreateListing: NavigatorScreenParams<CreateListingStackParamList>;
  Inbox: undefined;
  Profile: undefined;
};

/** Full listing → opens from Home / Search grids */
export type ItemDetailParams = {
  listingId: string;
  title: string;
  price: string;
  imageUrl: string;
  seller?: string;
  /** Canonical seller profile id (profiles.id). */
  sellerProfileId?: string;
  /** Shown in chat header when messaging from this listing */
  sellerAvatarUrl?: string;
  categoryLabel?: string;
  condition?: string;
  brand?: string;
  model?: string;
  storage?: string;
  color?: string;
  /** Seller's lowest acceptable offer in dollars (optional). */
  lowestOffer?: number;
  description?: string;
  meetupLocation?: string;
  galleryUrls?: string[];
};

/** Chat / offer thread tied to a listing */
export type ConversationParams = {
  listingId?: string;
  title?: string;
  price?: string;
  imageUrl?: string;
  seller: string;
  /** Canonical counterparty profile id (profiles.id). */
  peerUserId?: string;
  /** Optional fallback display name for profile header. */
  peerDisplayName?: string;
  /** Counterparty profile photo in thread header */
  avatarUrl?: string;
  entry: 'message' | 'offer';
  /** Buyer's chosen offer amount (e.g. "$15.00"); only when entry === 'offer' */
  offerAmount?: string;
  /** Supabase conversation id — present when opened from Inbox or a known thread */
  conversationId?: string;
  /** Open thread as direct profile chat (no listing header). */
  directMessage?: boolean;
};

type MeetupDetailsParams = {
  role: 'buyer' | 'seller';
  title: string;
  price: string;
  imageUrl: string;
  location?: string;
  timeLabel?: string;
  /**
   * Persisted conversation id. When present, Confirm/Suggest write to the
   * `meetups` table; absent (local-only thread) falls back to optimistic UI.
   */
  conversationId?: string;
  /** Counterparty profile info — when present, shown as a tappable chip */
  peerUserId?: string;
  peerHandle?: string;
  peerName?: string;
  peerAvatarUrl?: string;
};

/** Read-only view of another seller's profile */
type UserProfileParams = {
  userId: string;
  displayName?: string;
  avatarUrl?: string;
  handle?: string;
};

export type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  SignUp: undefined;
  PersonalizationAbout: undefined;
  PersonalizationInterests: undefined;
  Main: NavigatorScreenParams<MainTabParamList> | undefined;
  EventsCalendar: undefined;
  EventCreateDetails: { draft?: Partial<CreateEventDraft> } | undefined;
  EventCreatePreview: { draft?: Partial<CreateEventDraft> } | undefined;
  EventCreateSuccess: { eventId?: string } | undefined;
  ItemDetail: ItemDetailParams;
  Conversation: ConversationParams;
  MeetupDetails: MeetupDetailsParams;
  Favorites: undefined;
  ProfileSettings: undefined;
  UserProfile: UserProfileParams;
};

export type RootStackNav = NativeStackNavigationProp<RootStackParamList>;

/** Use on tab screens (e.g. Home) to reach stack routes like ItemDetail */
export type HomeTabNavigation = CompositeNavigationProp<
  NativeStackNavigationProp<HomeStackParamList, 'HomeLanding'>,
  NativeStackNavigationProp<RootStackParamList>
>;

/** Inbox tab → Conversation on root stack */
export type InboxTabNavigation = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Inbox'>,
  NativeStackNavigationProp<RootStackParamList>
>;

/** Profile tab → ItemDetail on root stack */
export type ProfileTabNavigation = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Profile'>,
  NativeStackNavigationProp<RootStackParamList>
>;

export type SearchStackNavigation = NativeStackNavigationProp<SearchStackParamList>;
