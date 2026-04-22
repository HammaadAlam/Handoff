/**
 * Home feed — tickets strip, category chips, recommended grid.
 */
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CategoryChip } from '@/components/marketplace/CategoryChip';
import { ProductCard } from '@/components/marketplace/ProductCard';
import { RemoteImage } from '@/components/RemoteImage';
import {
  DEFAULT_PEER_AVATAR_URI,
  filterEventsForHomeCategory,
  filterListingsForHomeCategory,
  HOME_CATEGORIES,
  LSU_FOOTBALL_TICKETS,
  RECOMMENDED_LISTINGS,
  type HomeCategory,
  type ListingItem,
  type TicketListing,
} from '@/data/mockData';
import { PROFILE_DEMO_HANDLE, getSeedProfileByHandle } from '@/data/seedCatalog';
import { fetchRecommendedListings } from '@/services/listings';
import { navigateToFavorites } from '@/navigation/navigateFavorites';
import { navigateToItemDetail } from '@/navigation/navigateItemDetail';
import type { HomeTabNavigation } from '@/navigation/types';
import { fonts, colors, radii, spacing, typography } from '@/styles/theme';

function openTicket(navigation: HomeTabNavigation, t: TicketListing) {
  const fallbackSellerId = getSeedProfileByHandle(PROFILE_DEMO_HANDLE)?.id;
  navigateToItemDetail(navigation, {
    listingId: t.id,
    title: t.title,
    price: t.price,
    imageUrl: t.imageUrl,
    seller: 'TigerTickets (demo)',
    sellerProfileId: t.sellerId ?? fallbackSellerId,
    sellerAvatarUrl: DEFAULT_PEER_AVATAR_URI,
    categoryLabel: 'Tickets',
    condition: 'Mobile entry',
    description: `${t.subtitle}\n${t.venue}\nSample LSU football ticket listing.`,
  });
}

function isTicketListing(item: ListingItem): item is TicketListing {
  return (
    typeof (item as TicketListing).subtitle === 'string' &&
    typeof (item as TicketListing).venue === 'string'
  );
}

export function HomeScreen() {
  const navigation = useNavigation<HomeTabNavigation>();
  const { width } = useWindowDimensions();
  /** Two columns: screen inset + clear gutter between cards (not squeezed center gap) */
  const gridInset = spacing.md;
  const gridGutter = spacing.sm;
  const gridInnerWidth = width - gridInset * 2;
  const recommendedColWidth = (gridInnerWidth - gridGutter) / 2;
  const [activeCat, setActiveCat] = useState<HomeCategory>(HOME_CATEGORIES[0]);
  const [recommended, setRecommended] =
    useState<ListingItem[]>(RECOMMENDED_LISTINGS);
  const [refreshing, setRefreshing] = useState(false);
  const showTicketStrip = activeCat === 'For You';
  const visibleRecommended = useMemo(
    () => filterListingsForHomeCategory(recommended, activeCat),
    [recommended, activeCat]
  );
  const visibleTickets = useMemo(
    () => filterEventsForHomeCategory(LSU_FOOTBALL_TICKETS, activeCat),
    [activeCat]
  );
  const verticalFeed = useMemo<ListingItem[]>(
    () =>
      activeCat === 'Events'
        ? [...visibleTickets, ...visibleRecommended]
        : visibleRecommended,
    [activeCat, visibleTickets, visibleRecommended]
  );

  const gridSectionTitle =
    activeCat === 'For You'
      ? 'Recommended for you'
      : `${activeCat} on campus`;

  const loadRecommended = useCallback(async () => {
    const items = await fetchRecommendedListings();
    setRecommended(items);
  }, []);

  useEffect(() => {
    void loadRecommended();
  }, [loadRecommended]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadRecommended();
    } finally {
      setRefreshing(false);
    }
  }, [loadRecommended]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.brandBar}>
        <View style={styles.brandSide} />
        <Text style={styles.brandTitle}>HandOff</Text>
        <View style={styles.brandSide}>
          <Pressable
            accessibilityLabel="Favorites"
            hitSlop={12}
            style={styles.iconBtn}
            onPress={() => navigateToFavorites(navigation)}
          >
            <Ionicons name="heart-outline" size={24} color={colors.textPrimary} />
          </Pressable>
        </View>
      </View>
      <View style={styles.topBar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipsScroll}
          contentContainerStyle={styles.chips}
        >
          {HOME_CATEGORIES.map((c) => (
            <CategoryChip
              key={c}
              label={c}
              active={activeCat === c}
              onPress={() => setActiveCat(c)}
            />
          ))}
        </ScrollView>
      </View>

      <FlatList
        style={styles.list}
        data={verticalFeed}
        keyExtractor={(item) => item.id}
        numColumns={2}
        ListHeaderComponent={
          <View style={styles.headerBlock}>
            {showTicketStrip && visibleTickets.length > 0 ? (
              <View style={styles.ticketSection}>
                <Text style={styles.ticketSectionTitle}>LSU Tickets</Text>
                <Text style={styles.ticketSectionSub}>
                  Sample campus sales — tap a game
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.ticketScroll}
                >
                  {visibleTickets.map((t) => (
                    <Pressable
                      key={t.id}
                      style={styles.ticketCard}
                      onPress={() => openTicket(navigation, t)}
                    >
                      <RemoteImage uri={t.imageUrl} style={styles.ticketImg} />
                      <Text style={styles.ticketTitle} numberOfLines={2}>
                        {t.title}
                      </Text>
                      <Text style={styles.ticketMeta} numberOfLines={1}>
                        {t.subtitle}
                      </Text>
                      <Text style={styles.ticketVenue} numberOfLines={1}>
                        {t.venue}
                      </Text>
                      <Text style={styles.ticketPrice}>{t.price}</Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            ) : null}
            <Text style={styles.sectionTitle}>{gridSectionTitle}</Text>
            {verticalFeed.length === 0 ? (
              <Text style={styles.emptyCopy}>
                No {activeCat.toLowerCase()} listings yet. Try another category.
              </Text>
            ) : null}
          </View>
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        columnWrapperStyle={[styles.row, { gap: gridGutter }]}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={{ width: recommendedColWidth, minWidth: 0 }}>
            <ProductCard
              item={item}
              onPress={() =>
                isTicketListing(item)
                  ? openTicket(navigation, item)
                  : navigateToItemDetail(navigation, {
                      listingId: item.id,
                      title: item.title,
                      price: item.price,
                      imageUrl: item.imageUrl,
                      seller: item.sellerHandle,
                      sellerProfileId: item.sellerId,
                      sellerAvatarUrl:
                        item.sellerAvatarUrl ?? DEFAULT_PEER_AVATAR_URI,
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
    backgroundColor: colors.background,
  },
  list: {
    flex: 1,
  },
  brandBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
  },
  brandSide: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  brandTitle: {
    fontFamily: fonts.extraBold,
    fontSize: 24,
    letterSpacing: -0.5,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    gap: 8,
  },
  chipsScroll: {
    flex: 1,
  },
  iconBtn: {
    padding: 4,
  },
  chips: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: spacing.sm,
    paddingVertical: 2,
  },
  headerBlock: {
    marginBottom: 0,
  },
  ticketSection: {
    backgroundColor: colors.surface,
    marginBottom: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  ticketSectionTitle: {
    ...typography.header,
    fontSize: 17,
    color: colors.textPrimary,
    paddingHorizontal: spacing.xs,
  },
  ticketSectionSub: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 4,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.xs,
  },
  ticketScroll: {
    paddingRight: spacing.sm,
    gap: 12,
  },
  ticketCard: {
    width: 160,
    backgroundColor: colors.chipBg,
    borderRadius: radii.card,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  ticketImg: {
    width: '100%',
    height: 88,
    borderRadius: 10,
    marginBottom: 8,
    backgroundColor: colors.border,
  },
  ticketTitle: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.textPrimary,
  },
  ticketMeta: {
    ...typography.caption,
    marginTop: 4,
    color: colors.textSecondary,
  },
  ticketVenue: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  ticketPrice: {
    fontFamily: fonts.extraBold,
    fontSize: 16,
    color: colors.primary,
    marginTop: 8,
  },
  sectionTitle: {
    ...typography.header,
    fontSize: 18,
    color: colors.textPrimary,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  emptyCopy: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  listContent: {
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
});
