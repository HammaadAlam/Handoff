/**
 * Search landing — compact white search page with quick chips,
 * browse-category image grid, and trending rail.
 */
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SearchCategoryCard } from '@/components/search/SearchCategoryCard';
import { SearchChip } from '@/components/search/SearchChip';
import { SearchSectionHeader } from '@/components/search/SearchSectionHeader';
import { SearchTrendingCard } from '@/components/search/SearchTrendingCard';
import {
  DEFAULT_PEER_AVATAR_URI,
  POPULAR_LISTINGS,
  RECOMMENDED_LISTINGS,
  type ListingItem,
} from '@/data/mockData';
import { navigateToItemDetail } from '@/navigation/navigateItemDetail';
import type { SearchStackNavigation } from '@/navigation/types';
import { fetchRecommendedListings } from '@/services/listings';
import { colors, fonts, spacing } from '@/styles/theme';

const SEARCH_CHIPS = [
  'macbook pro',
  'calculator',
  'LSU tickets',
  'mini fridge',
  'couch',
] as const;

const BROWSE_CATEGORIES = [
  {
    id: 'tickets',
    icon: 'ticket-outline' as const,
    imageUrl:
      'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=900&q=80',
    query: 'Events',
    subtitle: 'Game tickets, events and more',
    title: 'Tickets',
  },
  {
    id: 'tech',
    icon: 'laptop-outline' as const,
    imageUrl:
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=900&q=80',
    query: 'tech',
    subtitle: 'Laptops, phones, accessories',
    title: 'Tech',
  },
  {
    id: 'furniture',
    icon: 'bed-outline' as const,
    imageUrl:
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=900&q=80',
    query: 'Furniture',
    subtitle: 'Couches, desks, chairs & more',
    title: 'Furniture',
  },
  {
    id: 'clothes',
    icon: 'shirt-outline' as const,
    imageUrl:
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=900&q=80',
    query: 'Clothes',
    subtitle: 'Shirts, shoes, hoodies & more',
    title: 'Clothes',
  },
  {
    id: 'textbooks',
    icon: 'book-outline' as const,
    imageUrl:
      'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=900&q=80',
    query: 'textbook',
    subtitle: 'Buy and sell textbooks',
    title: 'Textbooks',
  },
  {
    id: 'dorm',
    icon: 'cube-outline' as const,
    imageUrl:
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=900&q=80',
    query: 'dorm essentials',
    subtitle: 'Everything for your dorm room',
    title: 'Dorm Essentials',
  },
] as const;

const TRENDING_FALLBACKS: ListingItem[] = [
  {
    id: 'search-macbook-pro',
    imageUrl:
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=900&q=80',
    postedAgo: '2h ago',
    price: '$850',
    rating: 4.9,
    title: 'MacBook Pro M2',
  },
  {
    id: 'search-ti84',
    imageUrl:
      'https://images.unsplash.com/photo-1564981797816-1043664bf78d?w=900&q=80',
    postedAgo: '3h ago',
    price: '$65',
    rating: 4.8,
    title: 'TI-84 Plus CE',
  },
  {
    id: 'search-fridge',
    imageUrl:
      'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=900&q=80',
    postedAgo: '5h ago',
    price: '$45',
    rating: 4.7,
    title: 'Mini Fridge',
  },
  {
    id: 'search-couch',
    imageUrl:
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=900&q=80',
    postedAgo: '1d ago',
    price: '$120',
    rating: 4.6,
    title: 'Gray Couch',
  },
];

const TRENDING_MATCHERS = [
  ['macbook', 'laptop'],
  ['ti-84', 'calculator'],
  ['mini fridge', 'fridge'],
  ['couch', 'sofa', 'chair', 'furniture'],
] as const;

function haystackForListing(item: ListingItem) {
  return [item.title, item.brand, item.description, item.category]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

function findListingMatch(
  items: ListingItem[],
  keywords: readonly string[],
  usedIds: Set<string>,
) {
  return items.find((item) => {
    if (usedIds.has(item.id)) {
      return false;
    }

    const haystack = haystackForListing(item);
    return keywords.some((keyword) => haystack.includes(keyword));
  });
}

function withFallbackDetail(item: ListingItem, fallback: ListingItem): ListingItem {
  return {
    ...fallback,
    ...item,
    postedAgo: item.postedAgo ?? fallback.postedAgo,
    price: item.price ?? fallback.price,
    rating: item.rating ?? fallback.rating,
    sellerAvatarUrl: item.sellerAvatarUrl ?? fallback.sellerAvatarUrl,
    sellerHandle: item.sellerHandle ?? fallback.sellerHandle,
  };
}

export function SearchHomeScreen() {
  const navigation = useNavigation<SearchStackNavigation>();
  const { width } = useWindowDimensions();
  const [recommended, setRecommended] =
    useState<ListingItem[]>(RECOMMENDED_LISTINGS);

  const horizontalPadding = 16;
  const gridGap = 12;
  const categoryCardWidth = (width - horizontalPadding * 2 - gridGap) / 2;
  const categoryCardHeight = categoryCardWidth * 0.62;
  const trendingCardWidth = 108;

  const loadListings = useCallback(async () => {
    const items = await fetchRecommendedListings();
    setRecommended(items);
  }, []);

  useEffect(() => {
    void loadListings();
  }, [loadListings]);

  const openListing = useCallback(
    (item: ListingItem) => {
      navigateToItemDetail(navigation, {
        listingId: item.id,
        title: item.title,
        price: item.price,
        imageUrl: item.imageUrl,
        seller: item.sellerHandle,
        sellerProfileId: item.sellerId,
        sellerAvatarUrl: item.sellerAvatarUrl ?? DEFAULT_PEER_AVATAR_URI,
        description: item.description,
        condition: item.condition,
        categoryLabel: item.category,
        meetupLocation: item.location,
      });
    },
    [navigation],
  );

  const trendingItems = useMemo(() => {
    const mergedListings = [
      ...recommended,
      ...POPULAR_LISTINGS.filter(
        (item) => !recommended.some((candidate) => candidate.id === item.id),
      ),
    ];

    const usedIds = new Set<string>();

    return TRENDING_MATCHERS.map((keywords, index) => {
      const fallback = TRENDING_FALLBACKS[index];
      const match = findListingMatch(mergedListings, keywords, usedIds);

      if (!match) {
        return fallback;
      }

      usedIds.add(match.id);
      return withFallbackDetail(match, fallback);
    });
  }, [recommended]);

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerBlock}>
          <Text style={styles.title}>Search</Text>

          <View style={styles.searchRow}>
            <Pressable
              accessibilityLabel="Open search"
              accessibilityRole="button"
              onPress={() => navigation.navigate('SearchQuery', {})}
              style={styles.searchField}
            >
              <Ionicons color={colors.textMuted} name="search-outline" size={18} />
              <Text numberOfLines={1} style={styles.searchPlaceholder}>
                Search laptops, textbooks, tickets...
              </Text>
            </Pressable>

            <Pressable
              accessibilityLabel="Location"
              hitSlop={10}
              onPress={() =>
                Alert.alert('Location', 'Nearby listings filter is coming soon.')
              }
              style={styles.actionButton}
            >
              <Ionicons color={colors.primary} name="location-outline" size={20} />
            </Pressable>

            <Pressable
              accessibilityLabel="Notifications"
              hitSlop={10}
              onPress={() =>
                Alert.alert('Notifications', 'Search alerts are coming soon.')
              }
              style={styles.actionButton}
            >
              <View>
                <Ionicons
                  color={colors.primary}
                  name="notifications-outline"
                  size={20}
                />
                <View style={styles.notifyDot} />
              </View>
            </Pressable>
          </View>
        </View>

        <ScrollView
          horizontal
          contentContainerStyle={styles.chipsContent}
          showsHorizontalScrollIndicator={false}
          style={styles.chipsRail}
        >
          {SEARCH_CHIPS.map((chip) => (
            <SearchChip
              key={chip}
              label={chip}
              onPress={() => navigation.navigate('CategoryResults', { query: chip })}
            />
          ))}
        </ScrollView>

        <View style={styles.browseSection}>
          <SearchSectionHeader
            onPressAction={() => navigation.navigate('SearchQuery', {})}
            title="Browse Categories"
          />

          <View style={styles.categoryRow}>
            {BROWSE_CATEGORIES.slice(0, 2).map((category) => (
              <View
                key={category.id}
                style={{ width: categoryCardWidth, height: categoryCardHeight }}
              >
                <SearchCategoryCard
                  icon={category.icon}
                  imageUrl={category.imageUrl}
                  onPress={() =>
                    navigation.navigate('CategoryResults', { query: category.query })
                  }
                  subtitle={category.subtitle}
                  title={category.title}
                />
              </View>
            ))}
          </View>

          <View style={styles.categoryRow}>
            {BROWSE_CATEGORIES.slice(2, 4).map((category) => (
              <View
                key={category.id}
                style={{ width: categoryCardWidth, height: categoryCardHeight }}
              >
                <SearchCategoryCard
                  icon={category.icon}
                  imageUrl={category.imageUrl}
                  onPress={() =>
                    navigation.navigate('CategoryResults', { query: category.query })
                  }
                  subtitle={category.subtitle}
                  title={category.title}
                />
              </View>
            ))}
          </View>

          <View style={styles.categoryRowLast}>
            {BROWSE_CATEGORIES.slice(4, 6).map((category) => (
              <View
                key={category.id}
                style={{ width: categoryCardWidth, height: categoryCardHeight }}
              >
                <SearchCategoryCard
                  icon={category.icon}
                  imageUrl={category.imageUrl}
                  onPress={() =>
                    navigation.navigate('CategoryResults', { query: category.query })
                  }
                  subtitle={category.subtitle}
                  title={category.title}
                />
              </View>
            ))}
          </View>
        </View>

        <View style={styles.trendingSection}>
          <SearchSectionHeader
            onPressAction={() =>
              navigation.navigate('CategoryResults', { query: 'popular' })
            }
            title="Trending on Campus"
          />

          <ScrollView
            horizontal
            contentContainerStyle={styles.trendingContent}
            showsHorizontalScrollIndicator={false}
            style={styles.trendingRail}
          >
            {trendingItems.map((item) => (
              <View key={item.id} style={{ width: trendingCardWidth }}>
                <SearchTrendingCard item={item} onPress={() => openListing(item)} />
              </View>
            ))}
          </ScrollView>
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
  content: {
    paddingTop: 6,
    paddingBottom: spacing.xxl,
  },
  headerBlock: {
    paddingHorizontal: spacing.md,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 20,
    lineHeight: 25,
    color: colors.textPrimary,
    marginBottom: 12,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchField: {
    flex: 1,
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 22,
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#ECE7F8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  searchPlaceholder: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 12,
    lineHeight: 16,
    color: colors.textMuted,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F1FF',
  },
  notifyDot: {
    position: 'absolute',
    top: -1,
    right: -1,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.error,
    borderWidth: 1.5,
    borderColor: colors.surface,
  },
  chipsRail: {
    marginLeft: 0,
    marginRight: -spacing.md,
    marginTop: 12,
    marginBottom: 16,
  },
  chipsContent: {
    paddingLeft: spacing.md,
    paddingRight: spacing.md,
    gap: 8,
  },
  browseSection: {
    paddingHorizontal: spacing.md,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  categoryRowLast: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  trendingSection: {
    marginTop: 24,
    paddingHorizontal: spacing.md,
  },
  trendingContent: {
    paddingLeft: spacing.md,
    paddingRight: 0,
    gap: 12,
  },
  trendingRail: {
    marginHorizontal: -spacing.md,
  },
});
