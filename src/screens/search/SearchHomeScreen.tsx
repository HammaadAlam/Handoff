/**
 * Search landing — gradient header, search + chips, category grid card, popular items grid.
 */
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { SearchPopularCard } from '@/components/marketplace/SearchPopularCard';
import {
  DEFAULT_PEER_AVATAR_URI,
  POPULAR_LISTINGS,
  SEARCH_CHIP_SUGGESTIONS,
  SEARCH_GRID_CATEGORIES,
} from '@/data/mockData';
import { navigateToItemDetail } from '@/navigation/navigateItemDetail';
import type { SearchStackParamList } from '@/navigation/types';
import { fonts, colors, radii, shadows, spacing, typography } from '@/styles/theme';

const HEADER_CURVE = 28;
const CATEGORY_OVERLAP = 18;
/** Extra lavender below chips (gradient is taller; category overlap compensates so the white card stays put). */
const HERO_PURPLE_EXTRA = 56;
/** Pulls the white category card up—less gap under the search chips. */
const CATEGORY_NUDGE_UP = 12;

export function SearchHomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<SearchStackParamList>>();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  /** Same grid rhythm as Home “Recommended For You” */
  const gridInset = spacing.md;
  const gridGutter = spacing.sm;
  const gridInnerWidth = width - gridInset * 2;
  const popularColWidth = (gridInnerWidth - gridGutter) / 2;

  const openListing = (item: (typeof POPULAR_LISTINGS)[0]) => {
    navigateToItemDetail(navigation, {
      listingId: item.id,
      title: item.title,
      price: item.price,
      imageUrl: item.imageUrl,
      sellerAvatarUrl: DEFAULT_PEER_AVATAR_URI,
    });
  };

  const rows = [
    SEARCH_GRID_CATEGORIES.slice(0, 5),
    SEARCH_GRID_CATEGORIES.slice(5, 10),
  ];

  return (
    <View style={styles.root}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollBottom}
      >
        <LinearGradient
          colors={[colors.gradientStart, colors.gradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.heroGradient,
            { borderBottomLeftRadius: HEADER_CURVE, borderBottomRightRadius: HEADER_CURVE },
          ]}
        >
          <SafeAreaView edges={['top']} style={styles.heroSafe}>
            <View style={styles.heroSearchInset}>
              <View style={styles.searchTools}>
                <Pressable
                  onPress={() => navigation.navigate('SearchQuery', {})}
                  style={styles.searchPill}
                  accessibilityRole="button"
                  accessibilityLabel="Open search"
                >
                  <Ionicons name="search-outline" size={20} color={colors.textMuted} />
                  <Text style={styles.searchPlaceholder}>Search laptops, textbooks…</Text>
                </Pressable>
                <Pressable
                  style={styles.roundTool}
                  hitSlop={10}
                  onPress={() =>
                    Alert.alert('Location', 'Nearby listings filter is coming soon.')
                  }
                  accessibilityLabel="Location"
                >
                  <Ionicons name="location-outline" size={22} color={colors.textInverse} />
                </Pressable>
                <Pressable
                  style={styles.roundTool}
                  hitSlop={10}
                  onPress={() =>
                    Alert.alert('Notifications', 'Search alerts are coming soon.')
                  }
                  accessibilityLabel="Notifications"
                >
                  <View>
                    <Ionicons name="notifications-outline" size={22} color={colors.textInverse} />
                    <View style={styles.notifyDot} />
                  </View>
                </Pressable>
              </View>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.chipsScrollView}
              contentContainerStyle={[
                styles.chipsScroll,
                {
                  paddingLeft: spacing.md + insets.left,
                  paddingRight: spacing.md + insets.right + spacing.sm,
                },
              ]}
            >
              {SEARCH_CHIP_SUGGESTIONS.map((chip) => (
                <Pressable
                  key={chip}
                  style={styles.chip}
                  onPress={() =>
                    navigation.navigate('CategoryResults', {
                      query: chip,
                    })
                  }
                >
                  <Ionicons name="search-outline" size={14} color={colors.textInverse} />
                  <Text style={styles.chipText}>{chip}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </SafeAreaView>
        </LinearGradient>

        <View
          style={[
            styles.categoryOverlap,
            {
              marginTop: -(
                CATEGORY_OVERLAP +
                HERO_PURPLE_EXTRA +
                CATEGORY_NUDGE_UP
              ),
            },
          ]}
        >
          <View style={[styles.categoryCard, shadows.soft]}>
            {rows.map((row, ri) => (
              <View key={`row-${ri}`} style={styles.catRow}>
                {row.map((cat) => (
                  <Pressable
                    key={cat.id}
                    style={styles.catCell}
                    onPress={() =>
                      navigation.navigate('CategoryResults', { query: cat.label })
                    }
                  >
                    <View style={styles.catIconCircle}>
                      <Ionicons
                        name={cat.icon as keyof typeof Ionicons.glyphMap}
                        size={22}
                        color={colors.primary}
                      />
                    </View>
                    <Text style={styles.catLabel} numberOfLines={1}>
                      {cat.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            ))}
          </View>
        </View>

        <View style={styles.popularSection}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>Popular Items</Text>
            <Pressable
              hitSlop={8}
              onPress={() =>
                navigation.navigate('CategoryResults', { query: 'Popular' })
              }
            >
              <Text style={styles.seeAll}>See All</Text>
            </Pressable>
          </View>

          <View style={styles.popularGrid}>
            {POPULAR_LISTINGS.map((item) => (
              <View key={item.id} style={{ width: popularColWidth }}>
                <SearchPopularCard item={item} onPress={() => openListing(item)} />
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollBottom: {
    paddingBottom: spacing.xxl,
  },
  heroGradient: {
    width: '100%',
    alignSelf: 'stretch',
    overflow: 'hidden',
    paddingBottom: spacing.lg + CATEGORY_OVERLAP + HERO_PURPLE_EXTRA,
  },
  heroSafe: {
    width: '100%',
  },
  /** Inset search row only — chip row stays full-bleed on the lavender header */
  heroSearchInset: {
    paddingHorizontal: spacing.md,
  },
  chipsScrollView: {
    width: '100%',
    flexGrow: 0,
  },
  searchTools: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  searchPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    ...shadows.soft,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: 15,
    color: colors.textMuted,
  },
  roundTool: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
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
    borderColor: colors.gradientEnd,
  },
  chipsScroll: {
    gap: spacing.sm,
    paddingBottom: spacing.xs,
    alignItems: 'center',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  chipText: {
    ...typography.caption,
    fontFamily: fonts.medium,
    color: colors.textInverse,
    fontSize: 13,
    textTransform: 'lowercase',
  },
  categoryOverlap: {
    paddingHorizontal: spacing.md,
    zIndex: 2,
  },
  categoryCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  catRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  catCell: {
    flex: 1,
    alignItems: 'center',
    minWidth: 0,
    paddingHorizontal: 2,
  },
  catIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.bannerTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  catLabel: {
    ...typography.caption,
    fontSize: 10,
    fontFamily: fonts.semiBold,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  popularSection: {
    paddingHorizontal: spacing.md,
    marginTop: spacing.lg,
  },
  sectionHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.header,
    fontSize: 18,
    fontFamily: fonts.bold,
    color: colors.textPrimary,
  },
  seeAll: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.primary,
  },
  popularGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
});
