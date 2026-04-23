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
  Dimensions,
  FlatList,
  Platform,
  Pressable,
  ScrollView,
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
  ensureConversationForListing,
  seedLocalConversation,
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
    setBundle({
      ...bundle,
      isFollowing: !wasFollowing,
      profile: {
        ...profile,
        followersCount: Math.max(
          0,
          profile.followersCount + (wasFollowing ? -1 : 1),
        ),
      },
    });
    const ok = wasFollowing
      ? await unfollowProfile({ targetProfileId: profile.id, sessionUserId })
      : await followProfile({ targetProfileId: profile.id, sessionUserId });
    if (!ok) {
      setBundle({
        ...bundle,
      });
    }
    setFollowBusy(false);
  };

  const onMessage = async () => {
    if (!profile) return;
    const seedListingId = bundle?.listings[0]?.id;
    const conversationId = seedListingId
      ? await ensureConversationForListing({
          listingId: seedListingId,
          sellerProfileId: profile.id,
          sessionUserId,
        })
      : null;
    const localConversationId = seedLocalConversation({
      listingId: seedListingId ?? '',
      title: bundle?.listings[0]?.title ?? `Chat with ${profile.displayName}`,
      price: bundle?.listings[0]?.price ?? '',
      imageUrl: bundle?.listings[0]?.imageUrl ?? profile.avatarUrl,
      seller: profile.handle,
      peerUserId: profile.id,
      peerAvatarUrl: profile.avatarUrl,
      entry: 'message',
    });
    navigation.navigate('Conversation', {
      listingId: seedListingId ?? '',
      title: seedListingId ? (bundle?.listings[0]?.title ?? profile.displayName) : `Chat with ${profile.displayName}`,
      price: '',
      imageUrl: profile.avatarUrl,
      seller: profile.handle,
      peerUserId: profile.id,
      peerDisplayName: profile.displayName,
      avatarUrl: profile.avatarUrl,
      entry: 'message',
      conversationId: conversationId ?? localConversationId,
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

        <View style={styles.heroBand}>
          <View style={styles.identity}>
            <View style={styles.avatarWrap}>
              <RemoteImage uri={profile.avatarUrl} style={styles.avatarFill} />
            </View>
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
            </View>
          </View>

          {!bundle.isSelf ? (
            <View style={styles.actionRow}>
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
            </View>
          ) : null}
        </View>

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

      <ScrollView
        style={styles.scrollFlex}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
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
      </ScrollView>
    </SafeAreaView>
  );
}

/** Unused — kept for future "featured" carousel; silences linter if referenced. */
export const PUBLIC_PROFILE_CARD_W = CAROUSEL_CARD_W;

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
