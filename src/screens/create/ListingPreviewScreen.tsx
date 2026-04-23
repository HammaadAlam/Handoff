/**
 * Listing preview styled like the real item detail page.
 */
import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect, useMemo, useState } from 'react';
import {
  Dimensions,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { RemoteImage } from '@/components/RemoteImage';
import { useAuth } from '@/context/AuthContext';
import {
  SAMPLE_LISTING_PHOTOS,
  mergeCreateListingDraft,
} from '@/data/createListingDraft';
import { DEFAULT_PEER_AVATAR_URI } from '@/data/mockData';
import { PROFILE_DEMO_HANDLE, getSeedProfileByHandle } from '@/data/seedCatalog';
import { useViewerProfileId } from '@/hooks/useViewerProfileId';
import type { CreateListingStackParamList } from '@/navigation/types';
import { fetchPublicProfile, type PublicProfile } from '@/services/profiles';
import { colors, fonts, radii, shadows, spacing, typography } from '@/styles/theme';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const HERO_H = Math.min(Math.round(SCREEN_H * 0.42), 380);
const HERO_CARD_OVERLAP = 20;

const DEFAULT_PREVIEW_DESCRIPTION =
  'Campus pickup. Message with any questions before meeting up.';

const demoProfile = getSeedProfileByHandle(PROFILE_DEMO_HANDLE);

export function ListingPreviewScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<CreateListingStackParamList>>();
  const { params } =
    useRoute<RouteProp<CreateListingStackParamList, 'ListingPreview'>>();
  const insets = useSafeAreaInsets();
  const { width: windowW } = useWindowDimensions();
  const { authBypass, user } = useAuth();
  const viewerProfileId = useViewerProfileId();
  const draft = mergeCreateListingDraft(params?.draft);
  const [slide, setSlide] = useState(0);
  const [descExpanded, setDescExpanded] = useState(false);
  const [viewerProfile, setViewerProfile] = useState<PublicProfile | null>(null);
  const images = useMemo(() => {
    const selectedImages = [
      draft.imageUri,
      ...SAMPLE_LISTING_PHOTOS.filter((uri) => uri !== draft.imageUri),
    ].filter(Boolean);

    return selectedImages.length ? selectedImages.slice(0, 3) : [SAMPLE_LISTING_PHOTOS[0]];
  }, [draft.imageUri]);
  const title = draft.title || 'Untitled listing';
  const rawPrice = draft.price.trim();
  const priceDisplay = rawPrice
    ? rawPrice.startsWith('$')
      ? rawPrice
      : `$${rawPrice}`
    : '$0';
  const categoryLabel = draft.category || 'General';
  const condition = draft.condition || 'Used';
  const description = draft.description || DEFAULT_PREVIEW_DESCRIPTION;
  const meetupText =
    draft.meetupMethod === 'meet'
      ? draft.meetupLocation || 'Campus meetup'
      : 'Shipping available';
  const tagPills = useMemo(
    () =>
      [condition, categoryLabel, meetupText === 'Shipping available' ? 'Shipping' : 'Campus meetup']
        .filter((tag, index, allTags) => allTags.indexOf(tag) === index),
    [categoryLabel, condition, meetupText],
  );
  const specRows = useMemo(
    () => [
      { label: 'Category', value: categoryLabel },
      { label: 'Condition', value: condition },
      { label: 'Meetup', value: meetupText },
    ],
    [categoryLabel, condition, meetupText],
  );
  const footerBtnWidth = (windowW - spacing.md * 2 - spacing.sm) / 2;
  const descPreviewLen = 180;
  const descLong = description.length > descPreviewLen;
  const descShown =
    descExpanded || !descLong
      ? description
      : `${description.slice(0, descPreviewLen).trim()}...`;
  const accountHandle = user?.email?.split('@')[0] || 'new_user';
  const metadataAvatar =
    typeof user?.user_metadata?.avatar_url === 'string'
      ? user.user_metadata.avatar_url
      : undefined;
  const fallbackSeller = authBypass || !user
    ? {
        avatarUrl: demoProfile?.avatarUrl ?? DEFAULT_PEER_AVATAR_URI,
        handle: demoProfile?.handle ?? PROFILE_DEMO_HANDLE,
        ratingAvg: demoProfile?.ratingAvg ?? 0,
        reviewCount: demoProfile?.reviewCount ?? 0,
      }
    : {
        avatarUrl: metadataAvatar ?? DEFAULT_PEER_AVATAR_URI,
        handle: accountHandle,
        ratingAvg: 0,
        reviewCount: 0,
      };
  const sellerHandle = viewerProfile?.handle ?? fallbackSeller.handle;
  const sellerAvatarUrl = viewerProfile?.avatarUrl ?? fallbackSeller.avatarUrl;
  const sellerRatingAvg = viewerProfile?.ratingAvg ?? fallbackSeller.ratingAvg;
  const sellerReviewCount = viewerProfile?.reviewCount ?? fallbackSeller.reviewCount;
  const sellerRatingText =
    sellerReviewCount > 0
      ? `${sellerRatingAvg.toFixed(1)} (${sellerReviewCount} reviews)`
      : 'New seller';

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      if (!viewerProfileId) {
        if (!cancelled) setViewerProfile(null);
        return;
      }

      const bundle = await fetchPublicProfile({
        userId: viewerProfileId,
        sessionUserId: user?.id ?? null,
      });

      if (!cancelled) {
        setViewerProfile(bundle?.profile ?? null);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.id, viewerProfileId]);

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const nextSlide = Math.round(event.nativeEvent.contentOffset.x / SCREEN_W);
    setSlide(Math.min(Math.max(nextSlide, 0), images.length - 1));
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 88 + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <FlatList
            data={images}
            getItemLayout={(_, index) => ({
              index,
              length: SCREEN_W,
              offset: SCREEN_W * index,
            })}
            horizontal
            keyExtractor={(_, index) => `${index}`}
            onScroll={onScroll}
            pagingEnabled
            renderItem={({ item }) => (
              <RemoteImage uri={item} style={styles.heroImage} />
            )}
            scrollEventThrottle={16}
            showsHorizontalScrollIndicator={false}
          />
          <View style={[styles.heroTopBar, { paddingTop: insets.top + spacing.sm }]}>
            <Pressable
              accessibilityLabel="Go back"
              hitSlop={12}
              onPress={() => navigation.goBack()}
              style={styles.heroIconBtn}
            >
              <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
            </Pressable>
            <View style={styles.heroTopSpacer} />
            <View style={styles.heroIconBtn}>
              <Ionicons name="heart-outline" size={22} color={colors.textPrimary} />
            </View>
          </View>
          <View style={styles.heroDots}>
            {images.map((_, index) => (
              <View
                key={index}
                style={[styles.dot, index === slide && styles.dotActive]}
              />
            ))}
          </View>
        </View>

        <View style={styles.cards}>
          <View style={[styles.card, shadows.soft]}>
            <View style={styles.titlePriceRow}>
              <Text style={styles.productTitle} numberOfLines={2}>
                {title}
              </Text>
              <Text style={styles.priceAccent}>{priceDisplay}</Text>
            </View>
            <Text style={styles.listedMeta}>Listed recently</Text>

            <View style={styles.tagRow}>
              {tagPills.map((tag) => (
                <View key={tag} style={styles.tagPill}>
                  <Text style={styles.tagPillText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={[styles.card, shadows.soft]}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Description</Text>
              {descLong ? (
                <Pressable onPress={() => setDescExpanded((expanded) => !expanded)} hitSlop={8}>
                  <Text style={styles.moreLink}>
                    {descExpanded ? 'Less' : 'More'}
                    {' >'}
                  </Text>
                </Pressable>
              ) : null}
            </View>
            <Text style={styles.bodyText}>{descShown}</Text>
            {specRows.map((row) => (
              <Text key={row.label} style={styles.specLine}>
                <Text style={styles.specLabel}>{row.label}: </Text>
                {row.value}
              </Text>
            ))}
          </View>

          <View style={[styles.card, styles.sellerCard, shadows.soft]}>
            <RemoteImage uri={sellerAvatarUrl} style={styles.sellerAvatar} />
            <View style={styles.sellerMeta}>
              <Text style={styles.sellerName}>{sellerHandle}</Text>
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={16} color={colors.ratingStar} />
                <Text style={styles.ratingText}>{sellerRatingText}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={22} color={colors.textMuted} />
          </View>

          <View style={[styles.card, shadows.soft]}>
            <Text style={styles.sectionTitle}>Ad posted at</Text>
            <Text style={styles.locationText}>{meetupText}</Text>
          </View>
        </View>
      </ScrollView>

      <View
        style={[
          styles.footer,
          {
            paddingBottom: spacing.sm + insets.bottom,
            paddingTop: spacing.sm,
          },
        ]}
      >
        <View style={styles.footerRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Edit listing preview"
            onPress={() => navigation.goBack()}
            style={[styles.btnOffer, { width: footerBtnWidth }]}
          >
            <Ionicons name="pencil-outline" size={20} color={colors.primary} />
            <Text style={styles.btnOfferText} numberOfLines={1}>Edit</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Post listing"
            onPress={() => navigation.navigate('ListingSuccess', { draft })}
            style={[styles.btnChat, { width: footerBtnWidth }]}
          >
            <Ionicons name="checkmark-circle-outline" size={21} color={colors.textInverse} />
            <Text style={styles.btnChatText}>Post Listing</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  hero: {
    width: SCREEN_W,
    height: HERO_H,
    backgroundColor: colors.chipBg,
    position: 'relative',
  },
  heroImage: {
    width: SCREEN_W,
    height: HERO_H,
    backgroundColor: colors.chipBg,
  },
  heroTopBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
  },
  heroIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.overlayOnImage,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTopSpacer: {
    flex: 1,
  },
  heroDots: {
    position: 'absolute',
    bottom: spacing.md,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.carouselDotMuted,
  },
  dotActive: {
    width: 16,
    backgroundColor: colors.primary,
  },
  cards: {
    paddingHorizontal: spacing.md,
    marginTop: -HERO_CARD_OVERLAP,
    paddingTop: 0,
    gap: spacing.md,
    zIndex: 1,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    padding: spacing.md,
  },
  titlePriceRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  productTitle: {
    flex: 1,
    ...typography.header,
    color: colors.textPrimary,
    fontSize: 20,
  },
  priceAccent: {
    color: colors.primary,
    fontFamily: fonts.bold,
    fontSize: 18,
  },
  listedMeta: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  tagPill: {
    borderRadius: radii.pill,
    backgroundColor: colors.chipBg,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  tagPillText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontFamily: fonts.medium,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    ...typography.body,
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    fontSize: 16,
  },
  moreLink: {
    ...typography.caption,
    color: colors.link,
    fontFamily: fonts.semiBold,
  },
  bodyText: {
    ...typography.body,
    color: colors.textPrimary,
    lineHeight: 22,
    marginBottom: spacing.sm,
  },
  specLine: {
    ...typography.body,
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 6,
  },
  specLabel: {
    color: colors.textPrimary,
    fontFamily: fonts.semiBold,
  },
  sellerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  sellerAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.chipBg,
  },
  sellerMeta: {
    flex: 1,
  },
  sellerName: {
    ...typography.body,
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    fontSize: 17,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  ratingText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  locationText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    ...shadows.soft,
  },
  footerRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  btnOffer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    minHeight: 48,
    paddingHorizontal: spacing.sm,
    paddingVertical: 12,
    borderRadius: radii.card,
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: colors.surface,
  },
  btnOfferText: {
    ...typography.button,
    color: colors.primary,
    fontSize: 14,
    flexShrink: 1,
  },
  btnChat: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    minHeight: 48,
    paddingHorizontal: spacing.sm,
    paddingVertical: 12,
    borderRadius: radii.card,
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: colors.primary,
    ...shadows.button,
  },
  btnChatText: {
    ...typography.button,
    color: colors.textInverse,
  },
});
