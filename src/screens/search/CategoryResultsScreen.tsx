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
import { useViewerProfileId } from '@/hooks/useViewerProfileId';
import { navigateToItemDetail } from '@/navigation/navigateItemDetail';
import type { ListingItem } from '@/data/mockData';
import type { SearchStackParamList } from '@/navigation/types';
import { fetchRecommendedListings } from '@/services/listings';
import { fonts, colors, spacing, typography } from '@/styles/theme';
import { applySearchFilters, DEFAULT_FILTERS } from './searchFilterUtils';
import { listingMatchesSearchQuery } from './searchQueryMatcher';

function toTitleCase(value: string) {
  return value
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function CategoryResultsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<SearchStackParamList>>();
  const viewerProfileId = useViewerProfileId();
  const { width } = useWindowDimensions();
  const gridInset = spacing.md;
  const gridGutter = spacing.sm;
  const gridInnerWidth = width - gridInset * 2;
  const gridColWidth = (gridInnerWidth - gridGutter) / 2;
  const route = useRoute<RouteProp<SearchStackParamList, 'CategoryResults'>>();
  const { query, filters = DEFAULT_FILTERS } = route.params;
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
      const source = listings
        .filter((item) => (viewerProfileId ? item.sellerId !== viewerProfileId : true))
        .filter((item) => {
        return listingMatchesSearchQuery(item, query);
      });
      return applySearchFilters(source, filters);
    },
    [query, filters, listings, viewerProfileId],
  );

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
      <Text style={styles.title}>{toTitleCase(query)}</Text>

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
