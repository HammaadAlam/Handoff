/**
 * Navigation types — tabs nested under root stack for listing → chat → meetup flows.
 */
import type {
  BottomTabNavigationProp,
  BottomTabScreenProps,
} from '@react-navigation/bottom-tabs';
import type { CompositeNavigationProp, NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

/** Search tab is its own stack (landing, query, results, filters). */
export type SearchStackParamList = {
  SearchHome: undefined;
  SearchQuery: { initialQuery?: string } | undefined;
  CategoryResults: { query: string };
  Filters: undefined;
};

/** Create Listing tab: entry → camera or manual form → optional pickup → success */
export type CreateListingStackParamList = {
  CreateEntry: undefined;
  CameraCapture: undefined;
  ListingDetails: {
    mode: 'quick' | 'manual';
    /** Set after Quick List capture */
    capturedImageUri?: string;
  };
  PickupLocation: undefined;
  ListingSuccess: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Search: NavigatorScreenParams<SearchStackParamList>;
  CreateListing: NavigatorScreenParams<CreateListingStackParamList>;
  Inbox: undefined;
  Profile: undefined;
};

export type MainTabProps<T extends keyof MainTabParamList> =
  BottomTabScreenProps<MainTabParamList, T>;

/** Full listing → opens from Home / Search grids */
export type ItemDetailParams = {
  listingId: string;
  title: string;
  price: string;
  imageUrl: string;
  seller?: string;
  /** Shown in chat header when messaging from this listing */
  sellerAvatarUrl?: string;
  categoryLabel?: string;
  condition?: string;
  description?: string;
  meetupLocation?: string;
  galleryUrls?: string[];
};

/** Chat / offer thread tied to a listing */
export type ConversationParams = {
  listingId: string;
  title: string;
  price: string;
  imageUrl: string;
  seller: string;
  /** Counterparty profile photo in thread header */
  avatarUrl?: string;
  entry: 'message' | 'offer';
};

export type MeetupDetailsParams = {
  role: 'buyer' | 'seller';
  title: string;
  price: string;
  imageUrl: string;
  location?: string;
  timeLabel?: string;
};

export type RootStackParamList = {
  Main: NavigatorScreenParams<MainTabParamList> | undefined;
  ItemDetail: ItemDetailParams;
  Conversation: ConversationParams;
  MeetupDetails: MeetupDetailsParams;
  Favorites: undefined;
  Cart: undefined;
  ProfileSettings: undefined;
};

export type RootStackNav = NativeStackNavigationProp<RootStackParamList>;

/** Use on tab screens (e.g. Home) to reach stack routes like ItemDetail */
export type HomeTabNavigation = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Home'>,
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

/** @deprecated Prefer navigateToItemDetail + Search stack types inside search screens */
export type SearchTabNavigation = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Search'>,
  NativeStackNavigationProp<RootStackParamList>
>;

export type SearchStackNavigation = NativeStackNavigationProp<SearchStackParamList>;

export type CreateListingStackNavigation =
  NativeStackNavigationProp<CreateListingStackParamList>;
