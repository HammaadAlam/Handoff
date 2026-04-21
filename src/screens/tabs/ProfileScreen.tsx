/**
 * Profile / store — top actions, identity row, tabs, carousels, grid, floating sort/filter.
 * Layout inspired by marketplace store pages; colors use Handoff theme tokens.
 */
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
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
  PROFILE_MY_ITEMS,
  type ListingItem,
} from '@/data/mockData';
import { PROFILE_DEMO_HANDLE, SEED_PROFILES } from '@/data/seedCatalog';
import { navigateToItemDetail } from '@/navigation/navigateItemDetail';
import type { ProfileTabNavigation } from '@/navigation/types';
import { fetchRecommendedListings } from '@/services/listings';
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

const demoProfile =
  SEED_PROFILES.find((p) => p.handle === PROFILE_DEMO_HANDLE) ?? SEED_PROFILES[0];
/** Maps rating to marketplace-style “% positive” copy */
const PROFILE_POSITIVE_PCT = Math.round((demoProfile.ratingAvg / 5) * 100);
const PROFILE_FOLLOWERS = demoProfile.followersCount;
const PROFILE_ITEMS_SOLD = demoProfile.itemsSold;
const PROFILE_SHOP_TITLE = demoProfile.displayName;

/** Width of the right action cluster (2 icons + gap) — mirrored on the left for centered title. */
const PROFILE_HEADER_ACTIONS_W = 28 + 16 + 28;

/** Scroll distance over which the profile hero collapses into the compact shop bar. */
const PROFILE_COLLAPSE_SCROLL = 140;
/** Until `onLayout` runs, avoid clipping the hero (then height snaps to measured content). */
const PROFILE_HERO_EXPANDED_FALLBACK = 176;
const PROFILE_COMPACT_BAR_H = 72;
/** Keep full hero height for the first fraction of scroll so stats are not clipped while fading. */
const PROFILE_HERO_HEIGHT_HOLD_UNTIL = 0.38;
/** Extra bottom inset inside the lavender band so the rating row clears the tab edge. */
const PROFILE_HERO_BAND_EXTRA_BOTTOM = 2;

/** Stacked seller stats — marketplace-style lines with bold leading numbers. */
function ProfileIdentityMetaExpanded() {
  return (
    <View
      style={styles.identityMetaLines}
      accessibilityRole="text"
      accessibilityLabel={`${PROFILE_POSITIVE_PCT} percent positive feedback, ${PROFILE_FOLLOWERS} followers, ${PROFILE_ITEMS_SOLD} items sold`}
    >
      <Text style={styles.identityMetaLine}>
        <Text style={styles.identityMetaBold}>{PROFILE_POSITIVE_PCT}%</Text>
        <Text style={styles.identityMetaRest}> positive feedback</Text>
      </Text>
      <Text style={styles.identityMetaLine}>
        <Text style={styles.identityMetaBold}>{PROFILE_FOLLOWERS}</Text>
        <Text style={styles.identityMetaRest}> followers</Text>
      </Text>
      <Text style={styles.identityMetaLine}>
        <Text style={styles.identityMetaBold}>{PROFILE_ITEMS_SOLD}</Text>
        <Text style={styles.identityMetaRest}> items sold</Text>
      </Text>
    </View>
  );
}

function ProfileIdentityMetaCompact() {
  return (
    <Text style={styles.identityMetaCompactRoot} numberOfLines={1}>
      <Text style={styles.identityMetaCompactBold}>{PROFILE_POSITIVE_PCT}%</Text>
      <Text style={styles.identityMetaCompactRest}> positive · </Text>
      <Text style={styles.identityMetaCompactBold}>{PROFILE_FOLLOWERS}</Text>
      <Text style={styles.identityMetaCompactRest}> followers · </Text>
      <Text style={styles.identityMetaCompactBold}>{PROFILE_ITEMS_SOLD}</Text>
      <Text style={styles.identityMetaCompactRest}> sold</Text>
    </Text>
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
  const [expandedHeroInteractable, setExpandedHeroInteractable] = useState(true);
  const [heroExpandedHeight, setHeroExpandedHeight] = useState(
    PROFILE_HERO_EXPANDED_FALLBACK,
  );
  const [storeListings, setStoreListings] = useState<ListingItem[]>(PROFILE_MY_ITEMS);

  const scrollY = useRef(new Animated.Value(0)).current;
  const scrollYRef = useRef(0);

  const heroSlotMax = Math.max(PROFILE_COMPACT_BAR_H, heroExpandedHeight);

  const heroSlotHeight = useMemo(
    () =>
      scrollY.interpolate({
        inputRange: [
          0,
          PROFILE_COLLAPSE_SCROLL * PROFILE_HERO_HEIGHT_HOLD_UNTIL,
          PROFILE_COLLAPSE_SCROLL,
        ],
        outputRange: [
          heroSlotMax,
          heroSlotMax,
          PROFILE_COMPACT_BAR_H,
        ],
        extrapolate: 'clamp',
      }),
    [scrollY, heroSlotMax],
  );

  const avatarSize = scrollY.interpolate({
    inputRange: [0, PROFILE_COLLAPSE_SCROLL],
    outputRange: [78, 40],
    extrapolate: 'clamp',
  });
  const avatarRadius = scrollY.interpolate({
    inputRange: [0, PROFILE_COLLAPSE_SCROLL],
    outputRange: [39, 20],
    extrapolate: 'clamp',
  });

  const bandPadV = scrollY.interpolate({
    inputRange: [
      0,
      PROFILE_COLLAPSE_SCROLL * PROFILE_HERO_HEIGHT_HOLD_UNTIL,
      PROFILE_COLLAPSE_SCROLL,
    ],
    outputRange: [spacing.sm, spacing.sm, 8],
    extrapolate: 'clamp',
  });
  const bandPadBottom = scrollY.interpolate({
    inputRange: [
      0,
      PROFILE_COLLAPSE_SCROLL * PROFILE_HERO_HEIGHT_HOLD_UNTIL,
      PROFILE_COLLAPSE_SCROLL,
    ],
    outputRange: [
      spacing.sm + PROFILE_HERO_BAND_EXTRA_BOTTOM,
      spacing.sm + PROFILE_HERO_BAND_EXTRA_BOTTOM,
      8,
    ],
    extrapolate: 'clamp',
  });

  const ratingRowOpacity = scrollY.interpolate({
    inputRange: [PROFILE_COLLAPSE_SCROLL * 0.3, PROFILE_COLLAPSE_SCROLL * 0.65],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });
  const compactSubOpacity = scrollY.interpolate({
    inputRange: [PROFILE_COLLAPSE_SCROLL * 0.36, PROFILE_COLLAPSE_SCROLL * 0.74],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });
  /** Collapse the stacked-stats shell from 3-line tall → compact 1-line as the rating fades. */
  const statsShellHeight = scrollY.interpolate({
    inputRange: [
      PROFILE_COLLAPSE_SCROLL * 0.3,
      PROFILE_COLLAPSE_SCROLL * 0.7,
    ],
    outputRange: [48, 22],
    extrapolate: 'clamp',
  });
  /** Nudge the compact stat line up slightly at full collapse so it clears the tab row. */
  const statsCompactTranslateY = scrollY.interpolate({
    inputRange: [
      PROFILE_COLLAPSE_SCROLL * 0.5,
      PROFILE_COLLAPSE_SCROLL,
    ],
    outputRange: [0, -4],
    extrapolate: 'clamp',
  });

  const meetingStripOpacity = scrollY.interpolate({
    inputRange: [0, PROFILE_COLLAPSE_SCROLL * 0.42],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });
  const meetingStripMaxH = scrollY.interpolate({
    inputRange: [0, PROFILE_COLLAPSE_SCROLL * 0.52],
    outputRange: [96, 0],
    extrapolate: 'clamp',
  });

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

  const loadStoreListings = useCallback(async () => {
    const all = await fetchRecommendedListings();
    const mine = all.filter((item) => item.sellerHandle === PROFILE_DEMO_HANDLE);
    setStoreListings(mine.length > 0 ? mine : PROFILE_MY_ITEMS);
  }, []);

  useEffect(() => {
    void loadStoreListings();
  }, [loadStoreListings]);

  useFocusEffect(
    useCallback(() => {
      void loadStoreListings();
    }, [loadStoreListings]),
  );

  const featuredListings = useMemo(() => storeListings.slice(0, 8), [storeListings]);
  const saleListings = useMemo(() => storeListings.slice(0, 10), [storeListings]);
  const allListings = storeListings;

  const openListing = (item: ListingItem) => {
    navigateToItemDetail(navigation, {
      listingId: item.id,
      title: item.title,
      price: item.price,
      imageUrl: item.imageUrl,
      seller: item.sellerHandle ?? PROFILE_DEMO_HANDLE,
      sellerProfileId: item.sellerId,
      sellerAvatarUrl: item.sellerAvatarUrl ?? DEFAULT_PEER_AVATAR_URI,
      description: item.description,
      condition: item.condition,
      categoryLabel: item.category,
      meetupLocation: item.location,
    });
  };

  const shareProfile = async () => {
    try {
      await Share.share({
        message: `Check out ${PROFILE_SHOP_TITLE} on Handoff — campus marketplace.\nhttps://handoff.app/u/${PROFILE_DEMO_HANDLE}`,
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
        featuredCount={featuredListings.length}
        saleListingCount={saleListings.length}
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
              style={styles.profileIconBtn}
              hitSlop={12}
              onPress={shareProfile}
              accessibilityLabel="Share profile"
            >
              <Ionicons name="share-outline" size={24} color={colors.textPrimary} />
            </Pressable>
            <Pressable
              style={styles.profileIconBtn}
              hitSlop={12}
              onPress={() => navigation.navigate('ProfileSettings')}
              accessibilityLabel="Settings"
            >
              <Ionicons name="settings-outline" size={24} color={colors.textPrimary} />
            </Pressable>
          </View>
        </View>

        <Animated.View
          style={[styles.profileCollapsibleSlot, { height: heroSlotHeight }]}
        >
          <Animated.View
            pointerEvents={expandedHeroInteractable ? 'auto' : 'none'}
            style={styles.expandedHeroLayer}
          >
            <Animated.View
              style={[
                styles.profileMiddleBand,
                { paddingTop: bandPadV, paddingBottom: bandPadBottom },
              ]}
              onLayout={(e) => {
                if (scrollYRef.current > 2) return;
                const h = Math.round(e.nativeEvent.layout.height);
                setHeroExpandedHeight((prev) => (prev === h ? prev : h));
              }}
            >
              <View style={styles.identityOuter}>
                <View style={styles.identity}>
                  <Animated.View
                    style={[
                      styles.avatarAnimatedWrap,
                      !profilePhotoReady && styles.avatarPlaceholderRing,
                      {
                        width: avatarSize,
                        height: avatarSize,
                        borderRadius: avatarRadius,
                      },
                    ]}
                  >
                    <Pressable
                      onPress={() => {
                        if (!profilePhotoReady) setProfilePhotoReady(true);
                        else Alert.alert('Profile photo', 'Replace photo (demo).');
                      }}
                      style={styles.avatarPressFill}
                    >
                      {profilePhotoReady ? (
                        <RemoteImage
                          uri={DEFAULT_PEER_AVATAR_URI}
                          style={styles.avatarFill}
                        />
                      ) : (
                        <View style={styles.avatarPlaceholderFill}>
                          <RemoteImage
                            uri={PLACEHOLDER_IMAGE_URI}
                            style={styles.avatarPhImage}
                            contentFit="cover"
                          />
                          <View style={styles.avatarPhOverlay}>
                            <Ionicons name="camera" size={20} color={colors.primary} />
                          </View>
                        </View>
                      )}
                    </Pressable>
                  </Animated.View>
                  <View style={styles.identityText}>
                    <View style={styles.identityNameRow}>
                      <Text style={styles.displayName} numberOfLines={1}>
                        {PROFILE_SHOP_TITLE}
                      </Text>
                      <Pressable
                        style={styles.heartWell}
                        hitSlop={10}
                        onPress={() =>
                          Alert.alert('Saved', 'Pinning your shop is coming soon.')
                        }
                        accessibilityLabel="Favorite shop"
                      >
                        <Ionicons
                          name="heart-outline"
                          size={20}
                          color={colors.textPrimary}
                        />
                      </Pressable>
                    </View>
                    <Animated.View
                      style={[
                        styles.ratingCrossfadeShell,
                        { height: statsShellHeight },
                      ]}
                    >
                      <Animated.View
                        style={[
                          styles.ratingCrossfadeLayer,
                          { opacity: ratingRowOpacity },
                        ]}
                      >
                        <ProfileIdentityMetaExpanded />
                      </Animated.View>
                      <Animated.View
                        style={[
                          styles.ratingCrossfadeLayerAbs,
                          {
                            opacity: compactSubOpacity,
                            transform: [{ translateY: statsCompactTranslateY }],
                          },
                        ]}
                      >
                        <ProfileIdentityMetaCompact />
                      </Animated.View>
                    </Animated.View>
                  </View>
                </View>
              </View>

              <Animated.View
                style={{
                  opacity: meetingStripOpacity,
                  maxHeight: meetingStripMaxH,
                  overflow: 'hidden',
                }}
              >
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
              </Animated.View>
            </Animated.View>
          </Animated.View>
        </Animated.View>

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

      <Animated.ScrollView
        style={styles.scrollFlex}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          {
            useNativeDriver: false,
            listener: (e: NativeSyntheticEvent<NativeScrollEvent>) => {
              const y = e.nativeEvent.contentOffset.y;
              scrollYRef.current = y;
              const next = y < PROFILE_COLLAPSE_SCROLL * 0.88;
              setExpandedHeroInteractable((prev) =>
                prev === next ? prev : next,
              );
            },
          },
        )}
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
                  <Ionicons name="menu-outline" size={18} color={colors.textMuted} />
                  <Text style={styles.searchPillLabel}>Categories</Text>
                </Pressable>
                <Pressable
                  style={[styles.searchPill, styles.searchPillGrow]}
                  onPress={() => Alert.alert('Search', 'Search your listings is coming soon.')}
                >
                  <Ionicons name="search-outline" size={18} color={colors.textMuted} />
                  <Text
                    style={[styles.searchPillLabel, styles.searchPillLabelFlex]}
                    numberOfLines={1}
                  >
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
                  {featuredListings.map((item) => (
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
                  {saleListings.map((item) => (
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
                    ? allListings.slice(0, 2)
                    : allListings
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
              <Text style={styles.aboutLine}>
                Items sold: {PROFILE_ITEMS_SOLD}
              </Text>
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
      </Animated.ScrollView>

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
  scrollFlex: {
    flex: 1,
  },
  profileHeader: {
    backgroundColor: colors.surface,
  },
  profileCollapsibleSlot: {
    overflow: 'hidden',
    backgroundColor: colors.bannerTint,
  },
  expandedHeroLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  profileMiddleBand: {
    backgroundColor: colors.bannerTint,
  },
  avatarAnimatedWrap: {
    overflow: 'hidden',
    backgroundColor: colors.chipBg,
  },
  /** Ring sits on the outer circle so it stays centered (inner dashed borders clip badly on iOS). */
  avatarPlaceholderRing: {
    borderWidth: 2,
    borderColor: colors.primaryLight,
    backgroundColor: colors.surface,
  },
  avatarPressFill: {
    flex: 1,
  },
  avatarFill: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholderFill: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: colors.bannerTint,
  },
  ratingCrossfadeShell: {
    position: 'relative',
    marginTop: 2,
    alignSelf: 'stretch',
    overflow: 'hidden',
  },
  ratingCrossfadeLayer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-start',
  },
  ratingCrossfadeLayerAbs: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-start',
  },
  identityMetaLines: {
    gap: 0,
    alignSelf: 'stretch',
  },
  identityMetaLine: {
    fontSize: 12,
    lineHeight: 15,
    ...(Platform.OS === 'android' ? { includeFontPadding: false } : {}),
  },
  identityMetaBold: {
    fontFamily: fonts.semiBold,
    fontSize: 12,
    lineHeight: 15,
    color: colors.textPrimary,
    ...(Platform.OS === 'android' ? { includeFontPadding: false } : {}),
  },
  identityMetaRest: {
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 15,
    color: colors.textSecondary,
    ...(Platform.OS === 'android' ? { includeFontPadding: false } : {}),
  },
  identityMetaCompactRoot: {
    fontSize: 11,
    lineHeight: 18,
    paddingVertical: 1,
    ...(Platform.OS === 'android' ? { includeFontPadding: false } : {}),
  },
  identityMetaCompactBold: {
    fontFamily: fonts.semiBold,
    fontSize: 11,
    lineHeight: 18,
    color: colors.textPrimary,
    ...(Platform.OS === 'android' ? { includeFontPadding: false } : {}),
  },
  identityMetaCompactRest: {
    fontFamily: fonts.regular,
    fontSize: 11,
    lineHeight: 18,
    color: colors.textSecondary,
    ...(Platform.OS === 'android' ? { includeFontPadding: false } : {}),
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
    ...typography.header,
    color: colors.textPrimary,
    textAlign: 'center',
    ...(Platform.OS === 'android' ? { includeFontPadding: false } : {}),
  },
  profileTopActions: {
    width: PROFILE_HEADER_ACTIONS_W,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: spacing.md,
  },
  profileIconBtn: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  identityOuter: {
    paddingTop: 0,
    paddingBottom: 0,
  },
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    gap: 10,
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
  identityNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minWidth: 0,
    paddingTop: 2,
  },
  displayName: {
    flex: 1,
    minWidth: 0,
    fontFamily: fonts.bold,
    fontSize: 20,
    letterSpacing: -0.4,
    color: colors.textPrimary,
    marginBottom: 0,
    lineHeight: 26,
  },
  heartWell: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  headerStatusStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primaryDark,
    borderRadius: radii.pill,
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
    marginHorizontal: spacing.md,
    marginTop: spacing.xs,
    marginBottom: 0,
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
    paddingVertical: 0,
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
    gap: spacing.xs,
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
  searchPillLabel: {
    fontSize: 13,
    fontFamily: fonts.regular,
    lineHeight: 18,
    color: colors.textMuted,
    ...(Platform.OS === 'android' ? { includeFontPadding: false } : {}),
  },
  searchPillLabelFlex: {
    flex: 1,
    minWidth: 0,
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
