/**
 * Read-only seller profile — mirrors the layout of ProfileScreen but drops
 * every edit affordance (settings, share-my-shop, manage sections, avatar
 * replacement, sort/filter bar). Replaces them with Follow + Message actions.
 */
import { Ionicons } from '@expo/vector-icons';
import {
  RouteProp,
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  Pressable,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { RemoteImage } from '@/components/RemoteImage';
import { useAuth } from '@/context/AuthContext';
import { DEFAULT_PEER_AVATAR_URI, type ListingItem } from '@/data/mockData';
import type { RootStackParamList } from '@/navigation/types';
import {
  fetchPublicProfile,
  followProfile,
  unfollowProfile,
  type PublicProfileBundle,
  type PublicReview,
} from '@/services/profiles';
import {
  ensureDirectConversation,
  ensureConversationForListing,
} from '@/services/conversations';
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

type PublicTab = 'Shop' | 'About' | 'Reviews';
const TABS: PublicTab[] = ['Shop', 'About', 'Reviews'];

const CAROUSEL_CARD_W = Math.min(152, Dimensions.get('window').width * 0.42);
const GRID_INNER_W = Dimensions.get('window').width - spacing.md * 2;
const GRID_GAP = spacing.sm;
const GRID_CELL_W = (GRID_INNER_W - GRID_GAP) / 2;
const PROFILE_COLLAPSE_SCROLL = 140;
const PROFILE_HERO_EXPANDED_FALLBACK = 176;
const PROFILE_COMPACT_BAR_H = 72;
const PROFILE_HERO_HEIGHT_HOLD_UNTIL = 0.38;
const PROFILE_HERO_BAND_EXTRA_BOTTOM = 2;

function formatMemberSince(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}

function formatReviewDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function GridCard({
  item,
  onPress,
}: {
  item: ListingItem;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.gridCard} onPress={onPress}>
      <View style={styles.gridImgWrap}>
        <RemoteImage uri={item.imageUrl} style={styles.gridImg} />
      </View>
      <Text style={styles.gridCaption} numberOfLines={4} ellipsizeMode="tail">
        {item.title}
      </Text>
      <Text style={styles.gridPrice}>{item.price}</Text>
    </Pressable>
  );
}

function ReviewRow({ item }: { item: PublicReview }) {
  const full = Math.max(0, Math.min(5, Math.round(item.rating)));
  return (
    <View style={styles.reviewRow}>
      <RemoteImage
        uri={item.reviewer?.avatarUrl ?? DEFAULT_PEER_AVATAR_URI}
        style={styles.reviewAvatar}
      />
      <View style={styles.reviewBody}>
        <View style={styles.reviewHeader}>
          <Text style={styles.reviewHandle} numberOfLines={1}>
            {item.reviewer?.handle ?? 'buyer'}
          </Text>
          <Text style={styles.reviewDate}>{formatReviewDate(item.createdAt)}</Text>
        </View>
        <View style={styles.reviewStars}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Ionicons
              key={i}
              name={i < full ? 'star' : 'star-outline'}
              size={14}
              color={colors.warning}
            />
          ))}
        </View>
        {item.comment ? (
          <Text style={styles.reviewComment}>{item.comment}</Text>
        ) : null}
      </View>
    </View>
  );
}

export function PublicProfileScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { params } = useRoute<RouteProp<RootStackParamList, 'UserProfile'>>();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const sessionUserId = user?.id ?? null;

  const [bundle, setBundle] = useState<PublicProfileBundle | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<PublicTab>('Shop');
  const [followBusy, setFollowBusy] = useState(false);
  const [expandedHeroInteractable, setExpandedHeroInteractable] = useState(true);
  const [heroExpandedHeight, setHeroExpandedHeight] = useState(
    PROFILE_HERO_EXPANDED_FALLBACK,
  );
  const scrollY = useState(() => new Animated.Value(0))[0];
  const [scrollYRef] = useState(() => ({ current: 0 }));

  const load = useCallback(
    async (showSpinner: boolean) => {
      if (showSpinner) setLoading(true);
      const data = await fetchPublicProfile({
        userId: params.userId,
        handle: params.handle,
        sessionUserId,
      });
      setBundle(data);
      setLoading(false);
    },
    [params.handle, params.userId, sessionUserId],
  );

  useEffect(() => {
    void load(true);
  }, [load]);

  useFocusEffect(
    useCallback(() => {
      void load(false);
    }, [load]),
  );

  const profile = bundle?.profile;
  const positivePct = useMemo(
    () => (profile ? Math.round((profile.ratingAvg / 5) * 100) : 0),
    [profile],
  );

  const onShare = async () => {
    if (!profile) return;
    try {
      await Share.share({
        message: `Check out ${profile.displayName} on Handoff — campus marketplace.\nhttps://handoff.app/u/${profile.handle}`,
      });
    } catch {
      Alert.alert('Share', 'Could not open the share sheet.');
    }
  };

  const onFollowToggle = async () => {
    if (!bundle || !profile || bundle.isSelf || followBusy) return;
    setFollowBusy(true);
    const wasFollowing = bundle.isFollowing;
    const ok = wasFollowing
      ? await unfollowProfile({ targetProfileId: profile.id, sessionUserId })
      : await followProfile({ targetProfileId: profile.id, sessionUserId });

    if (ok) {
      await load(false);
    } else {
      Alert.alert(
        'Could not update follow',
        'Please make sure you are signed in and try again.',
      );
    }

    setFollowBusy(false);
  };

  const onMessage = async () => {
    if (!profile) return;
    const seedListingId = bundle?.listings[0]?.id;
    let conversationId = await ensureDirectConversation({
      sellerProfileId: profile.id,
      sessionUserId,
    });
    if (!conversationId && seedListingId) {
      conversationId = await ensureConversationForListing({
        listingId: seedListingId,
        sellerProfileId: profile.id,
        sessionUserId,
      });
    }
    if (!conversationId) return;
    navigation.navigate('Conversation', {
      listingId: seedListingId ?? undefined,
      title: seedListingId ? bundle?.listings[0]?.title : undefined,
      price: seedListingId ? bundle?.listings[0]?.price : undefined,
      imageUrl: seedListingId ? bundle?.listings[0]?.imageUrl : undefined,
      seller: profile.handle,
      peerUserId: profile.id,
      peerDisplayName: profile.displayName,
      avatarUrl: profile.avatarUrl,
      entry: 'message',
      conversationId,
      directMessage: true,
    });
  };

  const openListing = (item: ListingItem) => {
    navigation.navigate('ItemDetail', {
      listingId: item.id,
      title: item.title,
      price: item.price,
      imageUrl: item.imageUrl,
      seller: item.sellerHandle ?? profile?.handle ?? 'seller',
      sellerProfileId: item.sellerId ?? profile?.id,
      sellerAvatarUrl: item.sellerAvatarUrl ?? profile?.avatarUrl,
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
  };

  if (loading && !bundle) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.topBar}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </Pressable>
          <Text style={styles.topBarTitle}>Profile</Text>
          <View style={styles.topBarRightPad} />
        </View>
        <View style={styles.bootWrap}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!bundle || !profile) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.topBar}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </Pressable>
          <Text style={styles.topBarTitle}>Profile</Text>
          <View style={styles.topBarRightPad} />
        </View>
        <View style={styles.bootWrap}>
          <Text style={styles.emptyText}>Profile not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const followLabel = bundle.isFollowing ? 'Following' : 'Follow';
  const heroSlotMax = Math.max(PROFILE_COMPACT_BAR_H, heroExpandedHeight);
  const heroSlotHeight = scrollY.interpolate({
    inputRange: [
      0,
      PROFILE_COLLAPSE_SCROLL * PROFILE_HERO_HEIGHT_HOLD_UNTIL,
      PROFILE_COLLAPSE_SCROLL,
    ],
    outputRange: [heroSlotMax, heroSlotMax, PROFILE_COMPACT_BAR_H],
    extrapolate: 'clamp',
  });
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
  const statsShellHeight = scrollY.interpolate({
    inputRange: [PROFILE_COLLAPSE_SCROLL * 0.3, PROFILE_COLLAPSE_SCROLL * 0.7],
    outputRange: [48, 22],
    extrapolate: 'clamp',
  });
  const actionRowOpacity = scrollY.interpolate({
    inputRange: [0, PROFILE_COLLAPSE_SCROLL * 0.55],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <View style={[styles.profileHeader, { paddingTop: insets.top }]}>
        <View style={styles.profileTopRow}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </Pressable>
          <View style={styles.profileTitleColumn}>
            <Text style={styles.profileTitle} numberOfLines={1}>
              {profile.handle}
            </Text>
          </View>
          <Pressable
            style={styles.profileIconBtn}
            hitSlop={12}
            onPress={onShare}
            accessibilityLabel="Share profile"
          >
            <Ionicons name="share-outline" size={24} color={colors.textPrimary} />
          </Pressable>
        </View>

        <Animated.View style={[styles.profileCollapsibleSlot, { height: heroSlotHeight }]}>
          <Animated.View
            pointerEvents={expandedHeroInteractable ? 'auto' : 'none'}
            style={styles.expandedHeroLayer}
          >
            <Animated.View
              style={[
                styles.heroBand,
                { paddingTop: bandPadV, paddingBottom: bandPadBottom },
              ]}
              onLayout={(e) => {
                if (scrollYRef.current > 2) return;
                const h = Math.round(e.nativeEvent.layout.height);
                setHeroExpandedHeight((prev) => (prev === h ? prev : h));
              }}
            >
              <View style={styles.identity}>
                <Animated.View
                  style={[
                    styles.avatarWrap,
                    {
                      width: avatarSize,
                      height: avatarSize,
                      borderRadius: avatarRadius,
                    },
                  ]}
                >
                  <RemoteImage uri={profile.avatarUrl} style={styles.avatarFill} />
                </Animated.View>
                <View style={styles.identityText}>
                  <View style={styles.identityNameRow}>
                    <Text style={styles.displayName} numberOfLines={1}>
                      {profile.displayName}
                    </Text>
                    {profile.isVerifiedEdu ? (
                      <Ionicons
                        name="school-outline"
                        size={18}
                        color={colors.primary}
                        accessibilityLabel="Verified student"
                      />
                    ) : null}
                  </View>
                  <Animated.View style={[styles.ratingCrossfadeShell, { height: statsShellHeight }]}>
                    <Animated.View style={[styles.ratingCrossfadeLayer, { opacity: ratingRowOpacity }]}>
                      <View style={styles.identityMetaLines}>
                        <Text style={styles.identityMetaLine}>
                          <Text style={styles.identityMetaBold}>{positivePct}%</Text>
                          <Text style={styles.identityMetaRest}> positive feedback</Text>
                        </Text>
                        <Text style={styles.identityMetaLine}>
                          <Text style={styles.identityMetaBold}>
                            {profile.followersCount}
                          </Text>
                          <Text style={styles.identityMetaRest}> followers</Text>
                        </Text>
                        <Text style={styles.identityMetaLine}>
                          <Text style={styles.identityMetaBold}>{profile.itemsSold}</Text>
                          <Text style={styles.identityMetaRest}> items sold</Text>
                        </Text>
                      </View>
                    </Animated.View>
                    <Animated.View style={[styles.ratingCrossfadeLayerAbs, { opacity: compactSubOpacity }]}>
                      <Text style={styles.identityMetaCompactRoot} numberOfLines={1}>
                        <Text style={styles.identityMetaCompactBold}>{positivePct}%</Text>
                        <Text style={styles.identityMetaCompactRest}> positive · </Text>
                        <Text style={styles.identityMetaCompactBold}>{profile.followersCount}</Text>
                        <Text style={styles.identityMetaCompactRest}> followers · </Text>
                        <Text style={styles.identityMetaCompactBold}>{profile.itemsSold}</Text>
                        <Text style={styles.identityMetaCompactRest}> sold</Text>
                      </Text>
                    </Animated.View>
                  </Animated.View>
                </View>
              </View>

              {!bundle.isSelf ? (
                <Animated.View style={[styles.actionRow, { opacity: actionRowOpacity }]}>
                  <Pressable
                    style={[
                      styles.btnFollow,
                      bundle.isFollowing && styles.btnFollowOn,
                    ]}
                    onPress={onFollowToggle}
                    disabled={followBusy}
                  >
                    <Ionicons
                      name={bundle.isFollowing ? 'checkmark' : 'person-add-outline'}
                      size={18}
                      color={
                        bundle.isFollowing ? colors.primary : colors.textInverse
                      }
                    />
                    <Text
                      style={[
                        styles.btnFollowText,
                        bundle.isFollowing && styles.btnFollowTextOn,
                      ]}
                    >
                      {followLabel}
                    </Text>
                  </Pressable>
                  <Pressable
                    style={styles.btnMessage}
                    onPress={() => {
                      void onMessage();
                    }}
                  >
                    <Ionicons
                      name="chatbubble-outline"
                      size={18}
                      color={colors.primary}
                    />
                    <Text style={styles.btnMessageText}>Message</Text>
                  </Pressable>
                </Animated.View>
              ) : null}
            </Animated.View>
          </Animated.View>
        </Animated.View>

        <View style={styles.tabRow}>
          {TABS.map((t) => {
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
        contentContainerStyle={styles.scroll}
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
              setExpandedHeroInteractable((prev) => (prev === next ? prev : next));
            },
          },
        )}
      >
        {activeTab === 'Shop' && (
          <>
            {bundle.listings.length === 0 ? (
              <Text style={styles.emptyText}>
                No active listings from this seller yet.
              </Text>
            ) : (
              <View style={styles.grid}>
                {bundle.listings.map((item) => (
                  <View key={item.id} style={styles.gridCell}>
                    <GridCard item={item} onPress={() => openListing(item)} />
                  </View>
                ))}
              </View>
            )}
          </>
        )}

        {activeTab === 'About' && (
          <View style={styles.about}>
            <Text style={styles.aboutBio}>
              {profile.bio?.trim().length
                ? profile.bio
                : 'This seller has not added a bio yet.'}
            </Text>
            <View style={styles.aboutStats}>
              {profile.campus ? (
                <Text style={styles.aboutLine}>
                  <Text style={styles.aboutLabel}>Campus: </Text>
                  {profile.campus}
                </Text>
              ) : null}
              {profile.primaryMeetupSpot ? (
                <Text style={styles.aboutLine}>
                  <Text style={styles.aboutLabel}>Meetup: </Text>
                  {profile.primaryMeetupSpot}
                </Text>
              ) : null}
              <Text style={styles.aboutLine}>
                <Text style={styles.aboutLabel}>Items sold: </Text>
                {profile.itemsSold}
              </Text>
              <Text style={styles.aboutLine}>
                <Text style={styles.aboutLabel}>Member since </Text>
                {formatMemberSince(profile.createdAt)}
              </Text>
            </View>
          </View>
        )}

        {activeTab === 'Reviews' && (
          <View style={styles.reviewsWrap}>
            <View style={styles.reviewsSummary}>
              <Text style={styles.ratingBig}>
                {profile.ratingAvg.toFixed(1)}
              </Text>
              <View style={styles.reviewsSummaryRight}>
                <View style={styles.reviewStarsLg}>
                  {Array.from({ length: 5 }).map((_, i) => {
                    const r = profile.ratingAvg;
                    const name =
                      i < Math.floor(r)
                        ? 'star'
                        : i < r
                          ? 'star-half'
                          : 'star-outline';
                    return (
                      <Ionicons
                        key={i}
                        name={name}
                        size={18}
                        color={colors.warning}
                      />
                    );
                  })}
                </View>
                <Text style={styles.reviewsCount}>
                  {profile.reviewCount} review
                  {profile.reviewCount === 1 ? '' : 's'}
                </Text>
              </View>
            </View>
            {bundle.reviews.length === 0 ? (
              <Text style={styles.emptyText}>
                Reviews from campus buyers will appear here.
              </Text>
            ) : (
              <FlatList
                data={bundle.reviews}
                keyExtractor={(r) => r.id}
                scrollEnabled={false}
                renderItem={({ item }) => <ReviewRow item={item} />}
                ItemSeparatorComponent={() => (
                  <View style={styles.reviewDivider} />
                )}
              />
            )}
          </View>
        )}
      </Animated.ScrollView>
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
  scroll: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
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
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    justifyContent: 'space-between',
  },
  topBarTitle: {
    ...typography.header,
    fontSize: 18,
  },
  topBarRightPad: {
    width: 24,
  },
  bootWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    minHeight: 44,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    gap: spacing.md,
  },
  profileTitleColumn: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileTitle: {
    ...typography.header,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  profileIconBtn: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBand: {
    backgroundColor: colors.bannerTint,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.md,
  },
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatarWrap: {
    width: 78,
    height: 78,
    borderRadius: 39,
    overflow: 'hidden',
    backgroundColor: colors.chipBg,
  },
  avatarFill: {
    width: '100%',
    height: '100%',
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
    lineHeight: 26,
  },
  identityMetaLines: {
    gap: 0,
    alignSelf: 'stretch',
    marginTop: 2,
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
  identityMetaLine: {
    fontSize: 12,
    lineHeight: 16,
    ...(Platform.OS === 'android' ? { includeFontPadding: false } : {}),
  },
  identityMetaBold: {
    fontFamily: fonts.semiBold,
    fontSize: 12,
    lineHeight: 16,
    color: colors.textPrimary,
  },
  identityMetaRest: {
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 16,
    color: colors.textSecondary,
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
  actionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  btnFollow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: 11,
    borderRadius: radii.button,
    backgroundColor: colors.primary,
    ...shadows.soft,
  },
  btnFollowOn: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  btnFollowText: {
    fontFamily: fonts.bold,
    color: colors.textInverse,
    fontSize: 14,
  },
  btnFollowTextOn: {
    color: colors.primary,
  },
  btnMessage: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: 11,
    borderRadius: radii.button,
    borderWidth: 1.5,
    borderColor: colors.primary,
    backgroundColor: colors.surface,
  },
  btnMessageText: {
    fontFamily: fonts.bold,
    color: colors.primary,
    fontSize: 14,
  },
  tabRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'space-evenly',
    paddingHorizontal: spacing.xs,
    backgroundColor: colors.surface,
  },
  tab: {
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GRID_GAP,
    marginBottom: spacing.lg,
  },
  gridCell: {
    width: GRID_CELL_W,
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
    gap: 6,
  },
  aboutLine: {
    ...typography.body,
    color: colors.textSecondary,
  },
  aboutLabel: {
    fontFamily: fonts.semiBold,
    color: colors.textPrimary,
  },
  reviewsWrap: {
    paddingVertical: spacing.sm,
  },
  reviewsSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radii.card,
    backgroundColor: colors.chipBg,
  },
  ratingBig: {
    fontFamily: fonts.extraBold,
    fontSize: 32,
    color: colors.textPrimary,
  },
  reviewsSummaryRight: {
    flex: 1,
  },
  reviewStarsLg: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewsCount: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 4,
  },
  reviewRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  reviewAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.chipBg,
  },
  reviewBody: {
    flex: 1,
    minWidth: 0,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  reviewHandle: {
    flex: 1,
    minWidth: 0,
    fontFamily: fonts.semiBold,
    color: colors.textPrimary,
  },
  reviewDate: {
    ...typography.caption,
    color: colors.textMuted,
  },
  reviewStars: {
    flexDirection: 'row',
    gap: 1,
    marginTop: 2,
  },
  reviewComment: {
    ...typography.body,
    color: colors.textPrimary,
    marginTop: 4,
    lineHeight: 20,
  },
  reviewDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
  },
  emptyText: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    paddingVertical: spacing.xl,
  },
});
