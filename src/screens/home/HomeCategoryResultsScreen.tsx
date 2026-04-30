import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ProductCard } from '@/components/marketplace/ProductCard';
import { DEFAULT_PEER_AVATAR_URI, type ListingItem } from '@/data/mockData';
import { useViewerProfileId } from '@/hooks/useViewerProfileId';
import { navigateToItemDetail } from '@/navigation/navigateItemDetail';
import type { HomeStackParamList } from '@/navigation/types';
import { fetchRecommendedListings } from '@/services/listings';
import { fonts, colors, spacing, typography } from '@/styles/theme';
import { applySearchFilters, DEFAULT_FILTERS } from '@/screens/search/searchFilterUtils';

const HOME_TECH_KEYWORDS = [
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

function isTechListing(item: ListingItem) {
  const haystack = [item.title, item.brand, item.description]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return HOME_TECH_KEYWORDS.some((keyword) => haystack.includes(keyword));
}

function filterHomeListings(
  listings: ListingItem[],
  category: 'For You' | 'Clothes' | 'Furniture' | 'Tech' | 'Events',
) {
  if (category === 'For You') return listings;
  if (category === 'Tech') return listings.filter(isTechListing);
  return listings.filter((item) => item.category === category);
}

function toTitleCase(value: string) {
  return value
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function HomeCategoryResultsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  const viewerProfileId = useViewerProfileId();
  const { width } = useWindowDimensions();
  const gridInset = spacing.md;
  const gridGutter = spacing.sm;
  const gridInnerWidth = width - gridInset * 2;
  const gridColWidth = (gridInnerWidth - gridGutter) / 2;
  const route = useRoute<RouteProp<HomeStackParamList, 'CategoryResults'>>();
  const {
    query,
    filters = DEFAULT_FILTERS,
    homeCategory,
    homeSection,
    title,
    sectionListingIds = [],
  } = route.params;
  const [listings, setListings] = useState<ListingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const items = await fetchRecommendedListings();
        if (!cancelled) setListings(items);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const data = useMemo(() => {
    let source: ListingItem[];
    const discoverable = viewerProfileId
      ? listings.filter((item) => item.sellerId !== viewerProfileId)
      : listings;
    if (homeCategory && homeSection) {
      const filtered = filterHomeListings(discoverable, homeCategory);
      const hotListings = filtered.slice(0, 8);

      if (homeSection === 'hot') {
        source = filtered;
      } else if (homeSection === 'saved') {
        const hotIds = new Set(hotListings.map((item) => item.id));
        let pool = filtered.filter((item) => !hotIds.has(item.id));
        if (pool.length < 4) {
          pool = discoverable.filter((item) => !hotIds.has(item.id));
        }
        if (pool.length === 0) {
          pool = filtered.slice(0, 8);
        }
        source = pool;
      } else if (homeSection === 'recent') {
        const hotIds = new Set(hotListings.map((item) => item.id));
        const freshPool = filtered.filter((item) => !hotIds.has(item.id));
        source = freshPool.length >= 8 ? freshPool : filtered;
      } else {
        const hotIds = new Set(hotListings.map((item) => item.id));
        const freshPool = filtered.filter((item) => !hotIds.has(item.id));
        const recently = (freshPool.length >= 8 ? freshPool : filtered).slice(0, 8);
        const usedIds = new Set([
          ...hotListings.map((item) => item.id),
          ...recently.map((item) => item.id),
        ]);
        const remaining = filtered.filter((item) => !usedIds.has(item.id));
        source = remaining.length >= 4 ? remaining : [...filtered].reverse();
      }
    } else {
      const normalizedQuery = query.trim().toLowerCase();
      source = discoverable.filter((item) => {
        if (!normalizedQuery) return true;
        const haystack = [item.title, item.brand, item.category, item.description, item.sellerHandle]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return haystack.includes(normalizedQuery);
      });
    }
    const scoped =
      sectionListingIds.length > 0
        ? source.filter((item) => sectionListingIds.includes(item.id))
        : source;
    return applySearchFilters(scoped, filters);
  }, [filters, listings, query, homeCategory, homeSection, sectionListingIds, viewerProfileId]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.top}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </Pressable>
        <Pressable
          onPress={() =>
            navigation.navigate('Filters', {
              query,
              filters,
              targetRouteKey: route.key,
            })
          }
          hitSlop={12}
          style={styles.filterBtn}
        >
          <Ionicons name="filter-outline" size={24} color={colors.textPrimary} />
        </Pressable>
      </View>
      <Text style={styles.title}>{title ?? toTitleCase(query)}</Text>

      <FlatList
        style={styles.listFlex}
        data={data}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={[styles.row, { gap: gridGutter }]}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          loading ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : (
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyTitle}>No items match this filter</Text>
              <Text style={styles.emptyBody}>
                Try removing a filter or broadening your search terms.
              </Text>
            </View>
          )
        }
        renderItem={({ item }) => (
          <View style={{ width: gridColWidth, minWidth: 0 }}>
            <ProductCard
              item={item}
              onPress={() =>
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
                })
              }
            />
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  listFlex: { flex: 1 },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xs,
  },
  filterBtn: { padding: 4 },
  title: {
    fontSize: 28,
    fontFamily: fonts.extraBold,
    color: colors.textPrimary,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  list: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  emptyWrap: {
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
  },
  emptyTitle: {
    ...typography.body,
    fontFamily: fonts.bold,
    fontSize: 17,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  emptyBody: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 280,
  },
  loadingWrap: {
    paddingTop: spacing.xl,
    alignItems: 'center',
  },
});
