/**
 * Category / text search results — grid + open filters.
 */
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
import { DEFAULT_PEER_AVATAR_URI } from '@/data/mockData';
import { navigateToItemDetail } from '@/navigation/navigateItemDetail';
import type { ListingItem } from '@/data/mockData';
import type { SearchFilters, SearchStackParamList } from '@/navigation/types';
import { fetchRecommendedListings } from '@/services/listings';
import { fonts, colors, spacing, typography } from '@/styles/theme';

const DEFAULT_FILTERS: SearchFilters = {
  sort: 'best',
  priceMax: 2000,
  condition: null,
  sellerType: 'Any',
  mileage: 'Any',
};

function listingPriceValue(item: ListingItem): number {
  const n = Number(item.price.replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) ? n : 0;
}

function normalizeCondition(v?: ListingItem['condition']): SearchFilters['condition'] {
  if (!v) return null;
  if (v === 'New') return 'New';
  if (v === 'Like New') return 'Like New';
  return 'Used';
}

function matchesDistance(item: ListingItem, mileage: SearchFilters['mileage']): boolean {
  if (mileage === 'Any') return true;
  const loc = (item.location ?? '').toLowerCase();
  const onCampus =
    /campus|lsu|student union|hall|quad|dorm|union/.test(loc);
  if (mileage === 'On campus') return onCampus;
  if (mileage === 'Within 5 mi') return onCampus || /highland|greek|north|west|south|east/.test(loc);
  return true;
}

function matchesSellerType(item: ListingItem, sellerType: SearchFilters['sellerType']): boolean {
  if (sellerType === 'Any') return true;
  const isCampusShop = item.trust === 'premium';
  return sellerType === 'Campus shop' ? isCampusShop : !isCampusShop;
}

export function CategoryResultsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<SearchStackParamList>>();
  const { width } = useWindowDimensions();
  const gridInset = spacing.md;
  const gridGutter = spacing.sm;
  const gridInnerWidth = width - gridInset * 2;
  const gridColWidth = (gridInnerWidth - gridGutter) / 2;
  const { params } = useRoute<RouteProp<SearchStackParamList, 'CategoryResults'>>();
  const { query, filters = DEFAULT_FILTERS } = params;
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

  const data = useMemo(
    () => {
      const normalizedQuery = query.trim().toLowerCase();
      const source = listings.filter((item) => {
        if (!normalizedQuery) return true;
        const haystack = [
          item.title,
          item.brand,
          item.category,
          item.description,
          item.sellerHandle,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return haystack.includes(normalizedQuery);
      });
      const filtered = source
        .filter((item) => listingPriceValue(item) <= filters.priceMax)
        .filter((item) =>
          filters.condition ? normalizeCondition(item.condition) === filters.condition : true,
        )
        .filter((item) => matchesSellerType(item, filters.sellerType))
        .filter((item) => matchesDistance(item, filters.mileage));

      if (filters.sort === 'low') {
        return [...filtered].sort((a, b) => listingPriceValue(a) - listingPriceValue(b));
      }
      if (filters.sort === 'high') {
        return [...filtered].sort((a, b) => listingPriceValue(b) - listingPriceValue(a));
      }
      return filtered;
    },
    [query, filters, listings],
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.top}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </Pressable>
        <Pressable
          onPress={() => navigation.navigate('Filters', { query, filters })}
          hitSlop={12}
          style={styles.filterBtn}
        >
          <Ionicons name="filter-outline" size={24} color={colors.textPrimary} />
        </Pressable>
      </View>
      <Text style={styles.title}>{query}</Text>

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
  safe: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  listFlex: {
    flex: 1,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xs,
  },
  filterBtn: {
    padding: 4,
  },
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
