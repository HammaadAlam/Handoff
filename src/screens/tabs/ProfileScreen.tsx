/**
 * Profile / store — top actions, identity row, tabs, carousels, grid, floating sort/filter.
 * Layout inspired by marketplace store pages; colors use Handoff theme tokens.
 */
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ManageSectionsModal,
  loadProfileTabPreferences,
} from '@/components/profile/ManageSectionsModal';
import {
  DEFAULT_SHOP_LAYOUT,
  PROFILE_TABS,
  type ProfileTab,
  type ShopSectionLayout,
} from '@/constants/profileTabs';
import { RemoteImage } from '@/components/RemoteImage';
import { useMarketplace } from '@/context/MarketplaceContext';
import {
  DEFAULT_PEER_AVATAR_URI,
  PLACEHOLDER_IMAGE_URI,
  PROFILE_BEST_SELLERS,
  PROFILE_FEATURED_LISTINGS,
  PROFILE_MY_ITEMS,
  type ListingItem,
} from '@/data/mockData';
import { navigateToItemDetail } from '@/navigation/navigateItemDetail';
import type { ProfileTabNavigation } from '@/navigation/types';
import {
  fonts,
  colors,
  listingCardTypography,
  listingPriceDisplay,
  radii,
  shadows,
  spacing,
  typography,
} from '@/styles/theme';

const CAROUSEL_CARD_W = Math.min(152, Dimensions.get('window').width * 0.42);

/** Two-column grid inside scroll (`paddingHorizontal: md`) — avoids bleeding past edges */
const PROFILE_GRID_INNER_W = Dimensions.get('window').width - spacing.md * 2;
const PROFILE_GRID_GAP = spacing.sm;
const PROFILE_GRID_CELL_W = (PROFILE_GRID_INNER_W - PROFILE_GRID_GAP) / 2;

/** Demo seller average; maps prior “98% positive” story to a /5 score */
const PROFILE_SELLER_RATING = 4.9;

/** Matches `profileIconWell` ×2 + gap so the title stays optically centered (balanced header). */
const PROFILE_HEADER_ACTIONS_W = 38 + 10 + 38;

function SellerRatingStat() {
  const r = PROFILE_SELLER_RATING;
  return (
    <View
      style={styles.statRatingRow}
      accessibilityRole="text"
      accessibilityLabel={`${r.toFixed(1)} out of 5 stars`}
    >
      <View style={styles.statStars}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Ionicons
            key={i}
            name={r >= i ? 'star' : r >= i - 0.5 ? 'star-half' : 'star-outline'}
            size={14}
            color={colors.ratingStar}
          />
        ))}
      </View>
      <Text style={styles.statRatingScore} numberOfLines={1}>
        {`${r.toFixed(1)}/5`}
      </Text>
    </View>
  );
}

function StoreCarouselCard({
  item,
  onPress,
}: {
  item: ListingItem;
  onPress: () => void;
}) {
  const { isFavorite, toggleFavorite } = useMarketplace();
  const fav = isFavorite(item.id);

  return (
    <Pressable style={styles.carouselCard} onPress={onPress}>
      <View style={styles.carouselImgWrap}>
        <RemoteImage uri={item.imageUrl} style={styles.carouselImg} />
        <Pressable
          style={styles.carouselHeart}
          onPress={() => toggleFavorite(item)}
          hitSlop={8}
        >
          <Ionicons
            name={fav ? 'heart' : 'heart-outline'}
            size={18}
            color={fav ? colors.error : colors.textPrimary}
          />
        </Pressable>
      </View>
      <Text style={styles.carouselTitle} numberOfLines={4} ellipsizeMode="tail">
        {item.title}
      </Text>
      <Text style={styles.carouselPrice}>{item.price}</Text>
    </Pressable>
  );
}

function GridCard({
  item,
  onPress,
}: {
  item: ListingItem;
  onPress: () => void;
}) {
  const { isFavorite, toggleFavorite } = useMarketplace();
  const fav = isFavorite(item.id);

  return (
    <Pressable style={styles.gridCard} onPress={onPress}>
      <View style={styles.gridImgWrap}>
        <RemoteImage uri={item.imageUrl} style={styles.gridImg} />
        <Pressable
          style={styles.gridHeart}
          onPress={() => toggleFavorite(item)}
        >
          <Ionicons
            name={fav ? 'heart' : 'heart-outline'}
            size={18}
            color={fav ? colors.error : colors.textPrimary}
          />
        </Pressable>
      </View>
    </Pressable>
  );
}

export function ProfileScreen() {
  const navigation = useNavigation<ProfileTabNavigation>();
  const insets = useSafeAreaInsets();
  const [manageSectionsOpen, setManageSectionsOpen] = useState(false);
  const [profilePhotoReady, setProfilePhotoReady] = useState(false);
  const [tabBarOrder, setTabBarOrder] = useState<ProfileTab[]>([...PROFILE_TABS]);
  const [shopSectionLayout, setShopSectionLayout] =
    useState<ShopSectionLayout>(DEFAULT_SHOP_LAYOUT);
  const [prefsLoaded, setPrefsLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState<ProfileTab>('Shop');

  useEffect(() => {
    let cancelled = false;
    loadProfileTabPreferences().then(({ tabOrder, shopLayout }) => {
      if (cancelled) return;
      setTabBarOrder(tabOrder);
      setShopSectionLayout(shopLayout);
      setPrefsLoaded(true);
      setActiveTab((current) =>
        tabOrder.includes(current) ? current : tabOrder[0] ?? 'Shop',
      );
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!prefsLoaded) return;
    if (!tabBarOrder.includes(activeTab)) {
      setActiveTab(tabBarOrder[0] ?? 'Shop');
    }
  }, [tabBarOrder, activeTab, prefsLoaded]);

  const openListing = (item: ListingItem) => {
    navigateToItemDetail(navigation, {
      listingId: item.id,
      title: item.title,
      price: item.price,
      imageUrl: item.imageUrl,
      seller: 'fahdhkhattak',
      sellerAvatarUrl: DEFAULT_PEER_AVATAR_URI,
    });
  };

  const shareProfile = async () => {
    try {
      await Share.share({
        message:
          'Check out fahdhkhattak on Handoff — campus marketplace.\nhttps://handoff.app/u/fahdhkhattak',
      });
    } catch {
      Alert.alert('Share', 'Could not open the share sheet.');
    }
  };

  const showShopChrome = activeTab === 'Shop' || activeTab === 'Sale';

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ManageSectionsModal
        visible={manageSectionsOpen}
        onClose={() => setManageSectionsOpen(false)}
        tabOrder={tabBarOrder}
        shopLayout={shopSectionLayout}
        featuredCount={PROFILE_FEATURED_LISTINGS.length}
        saleListingCount={PROFILE_BEST_SELLERS.length}
        onApply={({ tabOrder, shopLayout }) => {
          setTabBarOrder(tabOrder);
          setShopSectionLayout(shopLayout);
          setActiveTab((t) => (tabOrder.includes(t) ? t : tabOrder[0] ?? 'Shop'));
        }}
      />

      {/* Profile header — white bar + tinted middle (identity + meeting strip) + tabs */}
      <View style={[styles.profileHeader, { paddingTop: insets.top }]}>
        <View style={styles.profileTopRow}>
          <View style={styles.profileHeaderSide} />
          <View style={styles.profileTitleColumn}>
            <Text style={styles.profileTitle}>Profile</Text>
          </View>
          <View style={styles.profileTopActions}>
            <Pressable
              style={styles.profileIconWell}
              onPress={shareProfile}
              accessibilityLabel="Share profile"
            >
              <Ionicons name="share-outline" size={20} color={colors.textPrimary} />
            </Pressable>
            <Pressable
              style={styles.profileIconWell}
              onPress={() => navigation.navigate('ProfileSettings')}
              accessibilityLabel="Settings"
            >
              <Ionicons name="settings-outline" size={20} color={colors.textPrimary} />
            </Pressable>
          </View>
        </View>

        <View style={styles.profileMiddleBand}>
          <View style={styles.identityOuter}>
            <View style={styles.identity}>
              <Pressable
                onPress={() => {
                  if (!profilePhotoReady) setProfilePhotoReady(true);
                  else Alert.alert('Profile photo', 'Replace photo (demo).');
                }}
                style={styles.avatarPress}
              >
                {profilePhotoReady ? (
                  <RemoteImage uri={DEFAULT_PEER_AVATAR_URI} style={styles.avatar} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <RemoteImage
                      uri={PLACEHOLDER_IMAGE_URI}
                      style={styles.avatarPhImage}
                      contentFit="cover"
                    />
                    <View style={styles.avatarPhOverlay}>
                      <Ionicons name="camera" size={22} color={colors.primary} />
                    </View>
                  </View>
                )}
              </Pressable>
              <View style={styles.identityText}>
                <Text style={styles.displayName}>fahdhkhattak</Text>
                <View style={styles.statsStack}>
                  <View style={[styles.statRow, styles.statRowDivider]}>
                    <SellerRatingStat />
                  </View>
                  <View style={[styles.statRow, styles.statRowDivider]}>
                    <Text style={styles.statMutedLine} numberOfLines={1}>
                      67 followers
                    </Text>
                  </View>
                  <View style={styles.statRow}>
                    <Text style={styles.statMutedLine} numberOfLines={1}>
                      18 items sold
                    </Text>
                  </View>
                </View>
              </View>
              <Pressable
                style={styles.heartWell}
                hitSlop={10}
                onPress={() => Alert.alert('Saved', 'Pinning your shop is coming soon.')}
                accessibilityLabel="Favorite shop"
              >
                <Ionicons name="heart-outline" size={22} color={colors.primary} />
              </Pressable>
            </View>
          </View>

          <Pressable
            style={styles.headerStatusStrip}
            onPress={() => Alert.alert('Events', 'Campus events are coming soon.')}
          >
            <View style={styles.headerStatusLeft}>
              <Ionicons name="pulse" size={15} color={colors.success} />
              <Text style={styles.headerStatusLabel}>Meeting times</Text>
            </View>
            <Text style={styles.headerStatusLink}>See events</Text>
          </Pressable>
        </View>

        <View style={[styles.tabRow, styles.tabRowOnLight]}>
          {tabBarOrder.map((t) => {
            const on = activeTab === t;
            return (
              <Pressable key={t} style={styles.tab} onPress={() => setActiveTab(t)}>
                <Text style={[styles.tabLabel, on && styles.tabLabelOn]}>{t}</Text>
                {on ? <View style={styles.tabUnderline} /> : null}
              </Pressable>
            );
          })}
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: showShopChrome ? 88 + insets.bottom : spacing.xxl },
        ]}
      >
        {(activeTab === 'Shop' || activeTab === 'Sale') && (
          <>
            {activeTab === 'Shop' && (
              <View style={styles.searchRow}>
                <Pressable
                  style={styles.searchPill}
                  onPress={() => setManageSectionsOpen(true)}
                >
                  <Ionicons name="menu-outline" size={18} color={colors.textPrimary} />
                  <Text style={styles.searchPillText}>Categories</Text>
                </Pressable>
                <Pressable
                  style={[styles.searchPill, styles.searchPillGrow]}
                  onPress={() => Alert.alert('Search', 'Search your listings is coming soon.')}
                >
                  <Ionicons name="search-outline" size={18} color={colors.textMuted} />
                  <Text style={styles.searchPillMuted} numberOfLines={1}>
                    Search all items
                  </Text>
                </Pressable>
              </View>
            )}

            {activeTab === 'Shop' && shopSectionLayout.topPicks && (
              <>
                <View style={styles.sectionHead}>
                  <Text style={styles.sectionTitle}>Top picks</Text>
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.carouselRail}
                  contentContainerStyle={styles.carouselContent}
                >
                  {PROFILE_FEATURED_LISTINGS.map((item) => (
                    <StoreCarouselCard
                      key={item.id}
                      item={item}
                      onPress={() => openListing(item)}
                    />
                  ))}
                </ScrollView>
              </>
            )}

            {(activeTab === 'Sale' ||
              (activeTab === 'Shop' && shopSectionLayout.newlyListed)) && (
              <>
                <View style={styles.sectionHead}>
                  <View style={styles.sectionTitleBlock}>
                    <Text style={styles.sectionTitle} numberOfLines={2}>
                      {activeTab === 'Sale' ? 'On sale' : 'Newly listed'}
                    </Text>
                  </View>
                  {activeTab === 'Sale' ? (
                    <Pressable
                      hitSlop={8}
                      style={styles.sectionHeadAction}
                      onPress={() => setActiveTab('Shop')}
                    >
                      <Text style={styles.seeAll}>See all</Text>
                    </Pressable>
                  ) : (
                    <Pressable
                      hitSlop={8}
                      style={styles.sectionHeadAction}
                      onPress={() => setManageSectionsOpen(true)}
                    >
                      <Text style={styles.seeAll}>Edit sections</Text>
                    </Pressable>
                  )}
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.carouselRail}
                  contentContainerStyle={styles.carouselContent}
                >
                  {PROFILE_BEST_SELLERS.map((item) => (
                    <StoreCarouselCard
                      key={item.id}
                      item={item}
                      onPress={() => openListing(item)}
                    />
                  ))}
                </ScrollView>
              </>
            )}

            {(activeTab === 'Sale' ||
              (activeTab === 'Shop' && shopSectionLayout.allItems)) && (
              <>
                <View style={styles.sectionHead}>
                  <Text style={styles.sectionTitle}>All items</Text>
                </View>
                <View style={styles.grid}>
                  {(activeTab === 'Sale'
                    ? PROFILE_MY_ITEMS.slice(0, 2)
                    : PROFILE_MY_ITEMS
                  ).map((item) => (
                    <View key={item.id} style={styles.gridCell}>
                      <GridCard item={item} onPress={() => openListing(item)} />
                      <Text
                        style={styles.gridCaption}
                        numberOfLines={4}
                        ellipsizeMode="tail"
                      >
                        {item.title}
                      </Text>
                      <Text style={styles.gridPrice}>{item.price}</Text>
                    </View>
                  ))}
                </View>
              </>
            )}

            {activeTab === 'Shop' &&
              !shopSectionLayout.topPicks &&
              !shopSectionLayout.newlyListed &&
              !shopSectionLayout.allItems && (
                <Text style={styles.shopEmptySections}>
                  Turn on sections in Manage sections to show your storefront blocks.
                </Text>
              )}
          </>
        )}

        {activeTab === 'About' && (
          <View style={styles.about}>
            <Text style={styles.aboutBio}>
              Sellin clothes for a livin&apos; — DM for bundles. Campus pickup most days.
            </Text>
            <View style={styles.aboutStats}>
              <Text style={styles.aboutLine}>Items sold: 18</Text>
              <Text style={styles.aboutLine}>Member since 2024</Text>
            </View>
            <View style={styles.aboutActions}>
              <Pressable
                style={styles.btnOutline}
                onPress={() => setManageSectionsOpen(true)}
              >
                <Text style={styles.btnOutlineText}>Edit sections</Text>
              </Pressable>
              <Pressable style={styles.btnPrimary} onPress={shareProfile}>
                <Text style={styles.btnPrimaryText}>Share shop</Text>
              </Pressable>
            </View>
          </View>
        )}

        {activeTab === 'Feedback' && (
          <View style={styles.feedback}>
            <Text style={styles.feedbackTitle}>Buyer reviews</Text>
            <Text style={styles.feedbackPlaceholder}>
              Reviews from campus buyers will appear here.
            </Text>
          </View>
        )}
      </ScrollView>

      {showShopChrome ? (
        <View
          style={[
            styles.floatBar,
            { bottom: spacing.sm + insets.bottom },
            shadows.soft,
          ]}
        >
          <Pressable
            style={styles.floatHalf}
            onPress={() => Alert.alert('Sort', 'Sorting listings is coming soon.')}
          >
            <Ionicons name="swap-vertical" size={18} color={colors.textPrimary} />
            <Text style={styles.floatText}>Sort</Text>
          </Pressable>
          <View style={styles.floatDivider} />
          <Pressable
            style={styles.floatHalf}
            onPress={() => navigation.navigate('Search', { screen: 'Filters' })}
          >
            <Ionicons name="options-outline" size={18} color={colors.textPrimary} />
            <Text style={styles.floatText}>Filter</Text>
          </Pressable>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  profileHeader: {
    backgroundColor: colors.surface,
  },
  profileMiddleBand: {
    backgroundColor: colors.bannerTint,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  profileTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    minHeight: 44,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  profileHeaderSide: {
    width: PROFILE_HEADER_ACTIONS_W,
  },
  profileTitleColumn: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
  },
  profileTitle: {
    fontFamily: fonts.bold,
    fontSize: 17,
    color: colors.textPrimary,
    letterSpacing: -0.2,
    textAlign: 'center',
    ...(Platform.OS === 'android' ? { includeFontPadding: false } : {}),
  },
  profileTopActions: {
    width: PROFILE_HEADER_ACTIONS_W,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 10,
  },
  profileIconWell: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.bannerTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  identityOuter: {
    paddingTop: 2,
    paddingBottom: 2,
  },
  identity: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.md,
    gap: 10,
  },
  avatarPress: {},
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.chipBg,
  },
  avatarPlaceholder: {
    width: 76,
    height: 76,
    borderRadius: 38,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.primaryLight,
    borderStyle: 'dashed',
    backgroundColor: colors.bannerTint,
  },
  avatarPhImage: {
    width: '100%',
    height: '100%',
    opacity: 0.45,
  },
  avatarPhOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.85)',
  },
  identityText: {
    flex: 1,
    minWidth: 0,
  },
  displayName: {
    fontFamily: fonts.bold,
    fontSize: 17,
    letterSpacing: -0.35,
    color: colors.textPrimary,
    marginBottom: 2,
    lineHeight: 22,
  },
  statsStack: {
    alignSelf: 'stretch',
    paddingBottom: 0,
  },
  statRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minWidth: 0,
    flexWrap: 'nowrap',
  },
  statStars: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    flexShrink: 0,
  },
  statRatingScore: {
    fontSize: 12,
    fontFamily: fonts.medium,
    color: colors.textSecondary,
    flexShrink: 0,
    lineHeight: 17,
  },
  statRow: {
    paddingVertical: 2,
  },
  statRowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  statMutedLine: {
    fontSize: 12,
    fontFamily: fonts.medium,
    color: colors.textSecondary,
    lineHeight: 17,
    ...(Platform.OS === 'android' ? { includeFontPadding: false } : {}),
  },
  heartWell: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginLeft: 'auto',
    flexShrink: 0,
  },
  headerStatusStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primaryDark,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: spacing.md,
    marginHorizontal: spacing.md,
    marginTop: 2,
    marginBottom: spacing.sm,
  },
  headerStatusLeft: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginRight: spacing.sm,
  },
  headerStatusLabel: {
    flexShrink: 1,
    fontFamily: fonts.semiBold,
    fontSize: 13,
    lineHeight: 17,
    color: colors.textInverse,
    ...(Platform.OS === 'android' ? { includeFontPadding: false } : {}),
  },
  headerStatusLink: {
    flexShrink: 0,
    fontSize: 13,
    fontFamily: fonts.semiBold,
    lineHeight: 17,
    color: colors.textInverse,
    textDecorationLine: 'underline',
    ...(Platform.OS === 'android' ? { includeFontPadding: false } : {}),
    paddingVertical: 1,
  },
  tabRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'space-evenly',
    paddingHorizontal: spacing.xs,
  },
  tabRowOnLight: {
    backgroundColor: colors.surface,
  },
  tab: {
    flexGrow: 0,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingVertical: 12,
    paddingHorizontal: 8,
    minHeight: 44,
  },
  tabLabel: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: colors.textMuted,
    textAlign: 'center',
    ...(Platform.OS === 'android' ? { includeFontPadding: false } : {}),
  },
  tabLabelOn: {
    color: colors.textPrimary,
    fontFamily: fonts.semiBold,
  },
  tabUnderline: {
    position: 'absolute',
    bottom: 0,
    height: 3,
    width: '72%',
    maxWidth: 72,
    minWidth: 40,
    borderRadius: 2,
    backgroundColor: colors.primary,
    alignSelf: 'center',
  },
  scroll: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  searchRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  searchPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: radii.pill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: colors.chipBg,
  },
  searchPillGrow: {
    flex: 1,
    minWidth: 0,
  },
  searchPillText: {
    fontSize: 13,
    fontFamily: fonts.semiBold,
    color: colors.textPrimary,
  },
  searchPillMuted: {
    fontSize: 13,
    color: colors.textMuted,
    flex: 1,
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  sectionTitleBlock: {
    flex: 1,
    minWidth: 0,
  },
  sectionHeadAction: {
    flexShrink: 0,
  },
  sectionTitle: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  shopEmptySections: {
    ...typography.body,
    fontSize: 15,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  seeAll: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: colors.primary,
  },
  carouselRail: {
    marginHorizontal: -spacing.md,
  },
  carouselContent: {
    gap: spacing.sm,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.md,
  },
  carouselCard: {
    width: CAROUSEL_CARD_W,
  },
  carouselImgWrap: {
    position: 'relative',
    borderRadius: radii.card,
    overflow: 'hidden',
    aspectRatio: 1,
    backgroundColor: colors.chipBg,
  },
  carouselImg: {
    width: '100%',
    height: '100%',
  },
  carouselHeart: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.overlayOnImage,
    alignItems: 'center',
    justifyContent: 'center',
  },
  carouselTitle: {
    ...listingCardTypography.title,
    marginTop: 8,
    width: '100%',
  },
  carouselPrice: {
    ...listingPriceDisplay,
    marginTop: 6,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: PROFILE_GRID_GAP,
    marginBottom: spacing.lg,
  },
  gridCell: {
    width: PROFILE_GRID_CELL_W,
    minWidth: 0,
  },
  gridCard: {},
  gridImgWrap: {
    position: 'relative',
    borderRadius: radii.card,
    overflow: 'hidden',
    aspectRatio: 1,
    backgroundColor: colors.chipBg,
  },
  gridImg: {
    width: '100%',
    height: '100%',
  },
  gridHeart: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.overlayOnImage,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridCaption: {
    ...listingCardTypography.title,
    marginTop: 8,
    width: '100%',
    flexShrink: 1,
  },
  gridPrice: {
    ...listingPriceDisplay,
    marginTop: 6,
  },
  about: {
    paddingVertical: spacing.sm,
  },
  aboutBio: {
    ...typography.body,
    lineHeight: 22,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  aboutStats: {
    marginBottom: spacing.lg,
    gap: 6,
  },
  aboutLine: {
    ...typography.body,
    color: colors.textSecondary,
  },
  aboutActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  btnOutline: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: radii.button,
    paddingVertical: 12,
    alignItems: 'center',
  },
  btnOutlineText: {
    fontFamily: fonts.bold,
    color: colors.primary,
  },
  btnPrimary: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: radii.button,
    paddingVertical: 12,
    alignItems: 'center',
  },
  btnPrimaryText: {
    fontFamily: fonts.bold,
    color: colors.textInverse,
  },
  feedback: {
    paddingVertical: spacing.md,
  },
  feedbackTitle: {
    fontFamily: fonts.bold,
    fontSize: 16,
    marginBottom: spacing.sm,
    color: colors.textPrimary,
  },
  feedbackPlaceholder: {
    ...typography.body,
    color: colors.textMuted,
  },
  floatBar: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.pill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  floatHalf: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: spacing.lg,
  },
  floatDivider: {
    width: StyleSheet.hairlineWidth,
    alignSelf: 'stretch',
    backgroundColor: colors.border,
  },
  floatText: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.textPrimary,
  },
});
