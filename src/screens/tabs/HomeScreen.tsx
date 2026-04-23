/**
 * Home landing — premium marketplace layout with featured hero, category pills,
 * hot listings rail, and nearby ticket rail.
 */
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CategoryPill } from '@/components/home/CategoryPill';
import { HeroCard } from '@/components/home/HeroCard';
import { TicketCard } from '@/components/home/TicketCard';
import { ProductCard } from '@/components/marketplace/ProductCard';
import { SearchPopularCard } from '@/components/marketplace/SearchPopularCard';
import {
  DEFAULT_PEER_AVATAR_URI,
  filterListingsForHomeCategory,
  type HomeCategory,
  type ListingItem,
  type TicketListing,
} from '@/data/mockData';
import { navigateToItemDetail } from '@/navigation/navigateItemDetail';
import type { HomeTabNavigation } from '@/navigation/types';
import { fetchRecommendedListings } from '@/services/listings';
import { colors, fonts, spacing } from '@/styles/theme';

const HOME_CATEGORIES = [
  'For You',
  'Clothes',
  'Furniture',
  'Tech',
  'Events',
] as const;

type HomeCategoryPill = (typeof HOME_CATEGORIES)[number];

const CAMPUS_OPTIONS = [
  'LSU Campus',
  'Southern University',
  'Tulane',
  'UL Lafayette',
  'UNO',
  'Loyola',
  'Grambling',
] as const;
type CampusOption = (typeof CAMPUS_OPTIONS)[number];

const BANNER_ROTATE_MS = 8_000;
const RECENT_LISTING_LIMIT = 8;
const TECH_KEYWORDS = [
  'airpod',
  'apple',
  'camera',
  'calculator',
  'clicker',
  'headphone',
  'ipad',
  'iphone',
  'laptop',
  'macbook',
  'printer',
  'ring light',
  'speaker',
  'tech',
  'usb',
  'watch',
] as const;

type HomeHeroBanner = {
  attendeesLabel: string;
  buttonBackgroundColor?: string;
  buttonLabel: string;
  buttonTextColor?: string;
  gradientColors: readonly [string, string];
  id: string;
  imageUrl: string;
  onPress: () => void;
  subtitle: string;
  title: string;
};

function listingToTicketCard(item: ListingItem): TicketListing {
  return {
    id: item.id,
    title: item.title,
    price: item.price,
    imageUrl: item.imageUrl,
    subtitle: item.postedAgo ? `Available · ${item.postedAgo}` : 'Available now',
    venue: item.location ?? 'Campus meetup',
    category: 'Events',
    condition: item.condition ?? 'Good',
    sellerId: item.sellerId,
    sellerHandle: item.sellerHandle,
    sellerAvatarUrl: item.sellerAvatarUrl,
    description: item.description,
  };
}

function openTicket(navigation: HomeTabNavigation, ticket: TicketListing) {
  navigateToItemDetail(navigation, {
    listingId: ticket.id,
    title: ticket.title,
    price: ticket.price,
    imageUrl: ticket.imageUrl,
    seller: ticket.sellerHandle ?? 'Campus seller',
    sellerProfileId: ticket.sellerId,
    sellerAvatarUrl: ticket.sellerAvatarUrl ?? DEFAULT_PEER_AVATAR_URI,
    categoryLabel: 'Tickets',
    condition: 'Mobile entry',
    description: ticket.description,
    meetupLocation: ticket.venue,
  });
}

function openListing(navigation: HomeTabNavigation, item: ListingItem) {
  navigateToItemDetail(navigation, {
    listingId: item.id,
    title: item.title,
    price: item.price,
    imageUrl: item.imageUrl,
    seller: item.sellerHandle ?? 'Campus seller',
    sellerProfileId: item.sellerId,
    sellerAvatarUrl: item.sellerAvatarUrl ?? DEFAULT_PEER_AVATAR_URI,
    description: item.description,
    condition: item.condition,
    brand: item.brand,
    model: item.model,
    storage: item.storage,
    color: item.color,
    lowestOffer: item.lowestOffer,
    categoryLabel: item.category,
    meetupLocation: item.location,
  });
}

function isTechListing(item: ListingItem) {
  const haystack = [item.title, item.brand, item.description]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return TECH_KEYWORDS.some((keyword) => haystack.includes(keyword));
}

function filterHomeListings(
  listings: ListingItem[],
  category: HomeCategoryPill,
) {
  if (category === 'For You') return listings;
  if (category === 'Tech') return listings.filter(isTechListing);
  return filterListingsForHomeCategory(listings, category as HomeCategory);
}

function searchQueryForCategory(category: HomeCategoryPill) {
  if (category === 'For You') return 'popular';
  if (category === 'Tech') return 'calculator';
  return category;
}

export function HomeScreen() {
  const navigation = useNavigation<HomeTabNavigation>();
  const { width } = useWindowDimensions();
  const [activeCategory, setActiveCategory] = useState<HomeCategoryPill>('For You');
  const [bannerGroupIndex, setBannerGroupIndex] = useState(0);
  const [recommended, setRecommended] = useState<ListingItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [campus, setCampus] = useState<CampusOption>('LSU Campus');
  const [visibleCount, setVisibleCount] = useState(24);

  const openCampusPicker = useCallback(() => {
    Alert.alert(
      'Choose campus',
      undefined,
      [
        ...CAMPUS_OPTIONS.map((opt) => ({
          text: opt,
          onPress: () => setCampus(opt),
        })),
        { text: 'Cancel', style: 'cancel' as const },
      ],
      { cancelable: true },
    );
  }, []);

  const railGap = 12;
  const contentWidth = width - 32;
  const productCardWidth = Math.min(
    162,
    Math.max(152, Math.floor((contentWidth - railGap) / 2.18)),
  );
  const ticketCardWidth = Math.min(
    236,
    Math.max(224, Math.floor(contentWidth * 0.63)),
  );
  const recentCardWidth = Math.floor((contentWidth - railGap) / 2);

  const loadRecommended = useCallback(async () => {
    const items = await fetchRecommendedListings();
    setRecommended(items);
  }, []);

  useEffect(() => {
    void loadRecommended();
  }, [loadRecommended]);

  useFocusEffect(
    useCallback(() => {
      void loadRecommended();
    }, [loadRecommended]),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadRecommended();
    } finally {
      setRefreshing(false);
    }
  }, [loadRecommended]);

  const heroAvatars = useMemo(() => {
    const sellerAvatars = recommended
      .map((item) => item.sellerAvatarUrl)
      .filter((uri): uri is string => Boolean(uri));
    return (sellerAvatars.length > 0
      ? sellerAvatars
      : [DEFAULT_PEER_AVATAR_URI, DEFAULT_PEER_AVATAR_URI, DEFAULT_PEER_AVATAR_URI]
    ).slice(0, 3);
  }, [recommended]);

  const hotListings = useMemo(
    () => filterHomeListings(recommended, activeCategory).slice(0, 8),
    [activeCategory, recommended],
  );

  const nearbyTickets = useMemo(
    () => {
      const eventListings = recommended
        .filter((item) => item.category === 'Events')
        .map(listingToTicketCard);
      if (activeCategory === 'Events') {
        return eventListings;
      }

      return eventListings.slice(0, 8);
    },
    [activeCategory, recommended],
  );

  const recentlyListed = useMemo(() => {
    const filtered = filterHomeListings(recommended, activeCategory);
    const hotIds = new Set(hotListings.map((item) => item.id));
    const freshPool = filtered.filter((item) => !hotIds.has(item.id));
    const source = freshPool.length >= RECENT_LISTING_LIMIT ? freshPool : filtered;
    return source.slice(0, RECENT_LISTING_LIMIT);
  }, [activeCategory, hotListings, recommended]);

  const moreCampusFinds = useMemo(() => {
    const filtered = filterHomeListings(recommended, activeCategory);
    const usedIds = new Set([
      ...hotListings.map((item) => item.id),
      ...recentlyListed.map((item) => item.id),
    ]);
    const remaining = filtered.filter((item) => !usedIds.has(item.id));
    const source = remaining.length >= 4 ? remaining : [...filtered].reverse();
    return source.slice(0, Math.max(6, visibleCount));
  }, [activeCategory, hotListings, recentlyListed, recommended, visibleCount]);

  useEffect(() => {
    setVisibleCount(24);
  }, [activeCategory, campus]);

  const rotatingHeroBanners = useMemo<HomeHeroBanner[]>(
    () => [
      {
        id: 'game-day-essentials',
        title: '🏈 Game Day Essentials',
        subtitle: 'Gear up for the big game',
        buttonLabel: 'Shop Game Day',
        buttonTextColor: '#1E5A21',
        gradientColors: ['rgba(19, 63, 20, 0.82)', 'rgba(43, 111, 24, 0.7)'],
        imageUrl:
          'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=1400&q=80',
        attendeesLabel: '15+ interested',
        onPress: () => navigation.navigate('CategoryResults', { query: 'Events' }),
      },
      {
        id: 'finals-week-mode',
        title: '📚 Finals Week Mode',
        subtitle: 'Study gear to lock in and crush finals',
        buttonLabel: 'Study Essentials',
        buttonTextColor: '#1E4F93',
        gradientColors: ['rgba(15, 26, 44, 0.82)', 'rgba(53, 69, 100, 0.72)'],
        imageUrl:
          'https://images.unsplash.com/photo-1513258496099-48168024aec0?w=1400&q=80',
        attendeesLabel: '20+ preparing',
        onPress: () => navigation.navigate('CategoryResults', { query: 'textbook' }),
      },
      {
        id: 'campus-parties',
        title: '🎉 Party Attire',
        subtitle: 'Fits for every campus party',
        buttonLabel: 'Shop Attire',
        buttonTextColor: '#5D35C8',
        gradientColors: ['rgba(49, 28, 86, 0.82)', 'rgba(129, 66, 188, 0.72)'],
        imageUrl:
          'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1400&q=80',
        attendeesLabel: '8+ browsing',
        onPress: () => navigation.navigate('CategoryResults', { query: 'Clothes' }),
      },
      {
        id: 'dorm-upgrade',
        title: '🛏️ Dorm Upgrade',
        subtitle: 'Make your space look next-level',
        buttonLabel: 'Shop Room Decor',
        buttonTextColor: '#9B3427',
        gradientColors: ['rgba(88, 34, 22, 0.82)', 'rgba(171, 84, 54, 0.72)'],
        imageUrl:
          'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1400&q=80',
        attendeesLabel: '10+ upgrading',
        onPress: () =>
          navigation.navigate('CategoryResults', { query: 'dorm essentials' }),
      },
      {
        id: 'move-out-deals',
        title: '🏷️ Move-Out Deals',
        subtitle: "Great deals before they're gone",
        buttonLabel: 'Shop Deals',
        buttonTextColor: '#0D6A66',
        gradientColors: ['rgba(8, 68, 71, 0.82)', 'rgba(18, 107, 108, 0.72)'],
        imageUrl:
          'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1400&q=80',
        attendeesLabel: '18+ interested',
        onPress: () => navigation.navigate('CategoryResults', { query: 'Furniture' }),
      },
      {
        id: 'tailgate-ready',
        title: '🍖 Tailgate Ready',
        subtitle: 'Everything you need for tailgate szn',
        buttonLabel: 'Shop Tailgate',
        buttonTextColor: '#C95A10',
        gradientColors: ['rgba(102, 47, 11, 0.82)', 'rgba(185, 90, 17, 0.72)'],
        imageUrl:
          'https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=1400&q=80',
        attendeesLabel: '7+ going',
        onPress: () => navigation.navigate('CategoryResults', { query: 'Events' }),
      },
    ],
    [navigation],
  );

  useEffect(() => {
    if (rotatingHeroBanners.length <= 1) {
      return;
    }

    const intervalId = setInterval(() => {
      setBannerGroupIndex((current) => (current + 1) % rotatingHeroBanners.length);
    }, BANNER_ROTATE_MS);

    return () => clearInterval(intervalId);
  }, [rotatingHeroBanners.length]);

  const primaryBanner =
    rotatingHeroBanners[bannerGroupIndex % rotatingHeroBanners.length];
  const secondaryBanner =
    rotatingHeroBanners[(bannerGroupIndex + 1) % rotatingHeroBanners.length];
  const tertiaryBanner =
    rotatingHeroBanners[(bannerGroupIndex + 2) % rotatingHeroBanners.length];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={160}
        onScroll={(e) => {
          const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
          const distanceFromBottom =
            contentSize.height - (contentOffset.y + layoutMeasurement.height);
          if (distanceFromBottom < 400) {
            setVisibleCount((current) => Math.min(current + 12, 240));
          }
        }}
      >
        <View style={styles.headerRow}>
          <View style={styles.headerIconButton} />

          <Text style={styles.brandTitle}>HandOff</Text>

          <Pressable
            accessibilityLabel="Open favorites"
            hitSlop={12}
            onPress={() => navigation.navigate('Favorites')}
            style={styles.headerIconButton}
          >
            <Ionicons
              name="heart-outline"
              size={24}
              color={colors.textPrimary}
            />
          </Pressable>
        </View>

        <Pressable
          onPress={openCampusPicker}
          style={styles.locationRow}
          accessibilityLabel="Change campus"
        >
          <Ionicons name="location-outline" size={18} color={colors.primaryLight} />
          <Text style={styles.locationText}>{campus}</Text>
          <Ionicons name="chevron-down" size={16} color={colors.primaryLight} />
        </Pressable>

        <View style={styles.heroWrap}>
          <HeroCard
            attendeesLabel={primaryBanner.attendeesLabel}
            avatarUrls={heroAvatars}
            buttonBackgroundColor={primaryBanner.buttonBackgroundColor}
            buttonLabel={primaryBanner.buttonLabel}
            buttonTextColor={primaryBanner.buttonTextColor}
            gradientColors={primaryBanner.gradientColors}
            imageUrl={primaryBanner.imageUrl}
            onPress={primaryBanner.onPress}
            subtitle={primaryBanner.subtitle}
            title={primaryBanner.title}
          />
        </View>

        <View style={styles.pillRow}>
          {HOME_CATEGORIES.map((category, index) => (
            <View
              key={category}
              style={[
                styles.pillCell,
                index === HOME_CATEGORIES.length - 1 && styles.pillCellLast,
              ]}
            >
              <CategoryPill
                active={activeCategory === category}
                label={category}
                onPress={() => setActiveCategory(category)}
                style={styles.pillFit}
                textStyle={styles.pillFitText}
              />
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🔥 Hot on Campus</Text>
            <Pressable
              hitSlop={8}
              onPress={() =>
                navigation.navigate('CategoryResults', {
                  query: searchQueryForCategory(activeCategory),
                })
              }
            >
              <Text style={styles.seeAllText}>See all</Text>
            </Pressable>
          </View>

          <ScrollView
            horizontal
            contentContainerStyle={styles.railContent}
            decelerationRate="fast"
            showsHorizontalScrollIndicator={false}
            snapToInterval={productCardWidth + railGap}
            snapToAlignment="start"
            style={styles.fullBleedScroll}
          >
            {hotListings.map((item) => (
              <ProductCard
                key={item.id}
                item={item}
                onPress={() => openListing(navigation, item)}
                variant="rail"
                width={productCardWidth}
              />
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>💾 Saved by Others</Text>
            <Pressable hitSlop={8} onPress={() => setActiveCategory('Events')}>
              <Text style={styles.seeAllText}>See all</Text>
            </Pressable>
          </View>

          <ScrollView
            horizontal
            contentContainerStyle={styles.railContent}
            decelerationRate="fast"
            showsHorizontalScrollIndicator={false}
            snapToInterval={ticketCardWidth + railGap}
            snapToAlignment="start"
            style={styles.fullBleedScroll}
          >
            {nearbyTickets.map((ticket) => (
              <View key={ticket.id} style={styles.ticketWrap}>
                <TicketCard
                  onPress={() => openTicket(navigation, ticket)}
                  ticket={ticket}
                  width={ticketCardWidth}
                />
              </View>
            ))}
          </ScrollView>
        </View>

        <View style={styles.bannerSection}>
          <View style={styles.inlineHeroWrap}>
            <HeroCard
              attendeesLabel={secondaryBanner.attendeesLabel}
              avatarUrls={heroAvatars}
              buttonBackgroundColor={secondaryBanner.buttonBackgroundColor}
              buttonLabel={secondaryBanner.buttonLabel}
              buttonTextColor={secondaryBanner.buttonTextColor}
              gradientColors={secondaryBanner.gradientColors}
              imageUrl={secondaryBanner.imageUrl}
              onPress={secondaryBanner.onPress}
              subtitle={secondaryBanner.subtitle}
              title={secondaryBanner.title}
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🆕 Recently Listed</Text>
            <Pressable
              hitSlop={8}
              onPress={() =>
                navigation.navigate('CategoryResults', {
                  query: searchQueryForCategory(activeCategory),
                })
              }
            >
              <Text style={styles.seeAllText}>See all</Text>
            </Pressable>
          </View>

          <View style={styles.recentGrid}>
            {recentlyListed.map((item) => (
              <View key={item.id} style={{ width: recentCardWidth }}>
                <SearchPopularCard
                  item={item}
                  onPress={() => openListing(navigation, item)}
                />
              </View>
            ))}
          </View>
        </View>

        <View style={styles.bannerSection}>
          <View style={styles.inlineHeroWrap}>
            <HeroCard
              attendeesLabel={tertiaryBanner.attendeesLabel}
              avatarUrls={heroAvatars}
              buttonBackgroundColor={tertiaryBanner.buttonBackgroundColor}
              buttonLabel={tertiaryBanner.buttonLabel}
              buttonTextColor={tertiaryBanner.buttonTextColor}
              gradientColors={tertiaryBanner.gradientColors}
              imageUrl={tertiaryBanner.imageUrl}
              onPress={tertiaryBanner.onPress}
              subtitle={tertiaryBanner.subtitle}
              title={tertiaryBanner.title}
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🎒 More Campus Finds</Text>
            <Pressable
              hitSlop={8}
              onPress={() =>
                navigation.navigate('CategoryResults', {
                  query: searchQueryForCategory(activeCategory),
                })
              }
            >
              <Text style={styles.seeAllText}>See all</Text>
            </Pressable>
          </View>

          <View style={styles.recentGrid}>
            {moreCampusFinds.map((item) => (
              <View key={item.id} style={{ width: recentCardWidth }}>
                <SearchPopularCard
                  item={item}
                  onPress={() => openListing(navigation, item)}
                />
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: spacing.xxl,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
  },
  headerIconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.extraBold,
    fontSize: 27,
    letterSpacing: -0.8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 4,
  },
  locationText: {
    color: colors.primaryLight,
    fontFamily: fonts.semiBold,
    fontSize: 13,
    marginHorizontal: 4,
  },
  pillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  pillCell: {
    flex: 1,
    marginRight: 8,
  },
  pillCellLast: {
    marginRight: 0,
  },
  pillFit: {
    width: '100%',
    marginRight: 0,
    paddingHorizontal: 8,
    paddingVertical: 10,
  },
  pillFitText: {
    fontSize: 12,
  },
  fullBleedScroll: {
    marginHorizontal: -16,
  },
  heroWrap: {
    marginTop: 8,
    marginHorizontal: -16,
  },
  inlineHeroWrap: {
    marginHorizontal: -16,
  },
  section: {
    marginTop: 24,
  },
  bannerSection: {
    marginTop: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    fontSize: 17,
    letterSpacing: -0.3,
  },
  seeAllText: {
    color: colors.primaryLight,
    fontFamily: fonts.semiBold,
    fontSize: 15,
  },
  railContent: {
    paddingLeft: 16,
    paddingRight: 0,
  },
  recentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  ticketWrap: {
    marginRight: 12,
  },
});
