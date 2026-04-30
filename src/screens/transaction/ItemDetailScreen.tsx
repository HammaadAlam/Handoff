/**
 * Product detail — hero gallery with overlays, card sections, Send offer + Chat footer.
 * Layout inspired by marketplace listing reference; colors use Handoff theme tokens.
 */
import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import {
  Alert,
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
import { useMarketplace } from '@/context/MarketplaceContext';
import { DEFAULT_PEER_AVATAR_URI, type ListingItem } from '@/data/mockData';
import { useViewerProfileId } from '@/hooks/useViewerProfileId';
import { navigateToUserProfile } from '@/navigation/navigateToUserProfile';
import { MakeOfferSheet } from '@/screens/transaction/MakeOfferSheet';
import { useAuth } from '@/context/AuthContext';
import {
  createPendingOffer,
  ensureConversationForListing,
  seedLocalOfferAmount,
  upsertLocalInboxConversation,
} from '@/services/conversations';
import { removeListing } from '@/services/listings';
import { resolveProfileId } from '@/services/profiles';
import { fonts, colors, radii, shadows, spacing, typography } from '@/styles/theme';
import type { RootStackParamList } from '@/navigation/types';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
/** Taller hero; bottom overlaps the first card slightly */
const HERO_H = Math.min(Math.round(SCREEN_H * 0.42), 380);
/** How far the first card sits up on the image (image shows through under the card edge) */
const HERO_CARD_OVERLAP = 20;

export function ItemDetailScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { params } = useRoute<RouteProp<RootStackParamList, 'ItemDetail'>>();
  const {
    listingId,
    title,
    price,
    imageUrl,
    seller = 'Seller',
    sellerProfileId,
    sellerAvatarUrl,
    categoryLabel,
    condition,
    brand,
    model,
    storage,
    color,
    lowestOffer,
    description,
    meetupLocation,
    galleryUrls,
  } = params;

  const images = galleryUrls?.length ? galleryUrls : [imageUrl, imageUrl, imageUrl];
  const [slide, setSlide] = useState(0);
  const [offerOpen, setOfferOpen] = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);
  const [profileResolving, setProfileResolving] = useState(false);
  const [conversationOpening, setConversationOpening] = useState(false);
  const [removing, setRemoving] = useState(false);
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const viewerProfileId = useViewerProfileId();
  const { width: windowW } = useWindowDimensions();
  const { toggleFavorite, isFavorite } = useMarketplace();
  /** Exact half of footer row (matches `footer` horizontal padding + `footerRow` gap) */
  const footerBtnWidth =
    (windowW - spacing.md * 2 - spacing.sm) / 2;
  /**
   * Owner detection — when the viewer is the seller, swap the buyer-facing
   * Offer / Message footer for a single destructive "Remove Listing" action.
   * Defaults to false while the viewer profile id is still loading so we
   * never flicker the wrong CTA in front of a real buyer.
   */
  const isOwnListing = Boolean(
    viewerProfileId && sellerProfileId && viewerProfileId === sellerProfileId,
  );

  const listingItem: ListingItem = useMemo(
    () => ({
      id: listingId,
      title,
      price,
      imageUrl,
    }),
    [listingId, title, price, imageUrl],
  );

  const priceDisplay = price.startsWith('$') ? price : `$${price}`;

  const tagPills = useMemo(
    () =>
      [condition, categoryLabel].filter(
        (t): t is string => Boolean(t && t.trim()),
      ).filter((t, i, a) => a.indexOf(t) === i),
    [condition, categoryLabel],
  );

  const specRows = useMemo(
    () => {
      const rows: Array<{ label: string; value: string }> = [];
      if (categoryLabel) rows.push({ label: 'Category', value: categoryLabel });
      if (condition) rows.push({ label: 'Condition', value: condition });
      if (brand) rows.push({ label: 'Brand', value: brand });
      if (model) rows.push({ label: 'Model', value: model });
      if (storage) rows.push({ label: 'Storage', value: storage });
      if (color) rows.push({ label: 'Color', value: color });
      if (meetupLocation) rows.push({ label: 'Meetup', value: meetupLocation });
      return rows;
    },
    [categoryLabel, condition, brand, model, storage, color, meetupLocation],
  );

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    const i = Math.round(x / SCREEN_W);
    setSlide(Math.min(Math.max(i, 0), images.length - 1));
  };

  const openConversation = async (
    entry: 'message' | 'offer',
    offerAmount?: string,
  ) => {
    if (conversationOpening) return;
    setConversationOpening(true);
    try {
      const sellerId =
        (await resolveProfileId({
          userId: sellerProfileId,
          handle: seller,
        }).catch(() => null)) ?? sellerProfileId;
      let conversationId: string | undefined;
      if (sellerId) {
        conversationId =
          (await ensureConversationForListing({
            listingId,
            sellerProfileId: sellerId,
            sessionUserId: user?.id ?? null,
          })) ?? undefined;
        if (entry === 'offer' && conversationId && offerAmount) {
          await createPendingOffer({
            conversationId,
            amount: offerAmount,
            sessionUserId: user?.id ?? null,
          });
        }
      }
      // Never block navigation on backend conversation creation.
      // Local threads still allow composing and keep UX responsive.
      if (!conversationId) {
        const sellerToken = sellerId ?? seller.trim().toLowerCase().replace(/\s+/g, '-');
        conversationId = `local:${listingId}:${sellerToken}`;
      }
      if (entry === 'offer' && offerAmount) {
        await seedLocalOfferAmount({ conversationId, amount: offerAmount });
      }

      await upsertLocalInboxConversation({
        sessionUserId: user?.id ?? null,
        conversationId,
        listingId,
        title,
        price,
        imageUrl,
        seller,
        peerUserId: sellerId ?? undefined,
        peerAvatarUrl: sellerAvatarUrl ?? DEFAULT_PEER_AVATAR_URI,
        preview:
          entry === 'offer'
            ? offerAmount
              ? `Offer sent: ${offerAmount}`
              : 'Offer sent'
            : 'Conversation started',
      });

      navigation.navigate('Conversation', {
        listingId,
        title,
        price,
        imageUrl,
        seller,
        peerUserId: sellerId,
        peerDisplayName: seller,
        avatarUrl: sellerAvatarUrl ?? DEFAULT_PEER_AVATAR_URI,
        entry,
        offerAmount,
        conversationId,
      });
    } finally {
      setConversationOpening(false);
    }
  };

  const handleOfferSubmit = (amount: string) => {
    setOfferOpen(false);
    void openConversation('offer', amount);
  };

  const handleRemoveListing = () => {
    if (removing) return;
    Alert.alert(
      'Remove listing?',
      `“${title}” will be hidden from the marketplace. This can\u2019t be undone right now.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            setRemoving(true);
            try {
              const result = await removeListing({
                listingId,
                sellerProfileId: viewerProfileId,
              });
              if (!result.ok) {
                Alert.alert(
                  'Could not remove listing',
                  result.reason ||
                    'Something went wrong while removing this listing. Please try again.',
                );
                return;
              }
              navigation.goBack();
            } finally {
              setRemoving(false);
            }
          },
        },
      ],
      { cancelable: true },
    );
  };

  const sellerAvatar = sellerAvatarUrl ?? DEFAULT_PEER_AVATAR_URI;
  const descText = description?.trim() ?? '';
  const descPreviewLen = 180;
  const descLong = descText.length > descPreviewLen;
  const descShown = descText
    ? descExpanded || !descLong
      ? descText
      : `${descText.slice(0, descPreviewLen).trim()}…`
    : 'No description provided.';

  const openSellerProfile = async () => {
    if (profileResolving) return;
    setProfileResolving(true);
    try {
      const userId = await resolveProfileId({
        userId: sellerProfileId,
        handle: seller,
      });
      if (!userId) return;
      navigateToUserProfile(
        navigation,
        {
          userId,
          handle: seller,
          displayName: seller,
          avatarUrl: sellerAvatar,
        },
        viewerProfileId
      );
    } finally {
      setProfileResolving(false);
    }
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
            keyExtractor={(_, i) => `${i}`}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={onScroll}
            scrollEventThrottle={16}
            renderItem={({ item }) => (
              <RemoteImage uri={item} style={styles.heroImage} />
            )}
            getItemLayout={(_, index) => ({
              length: SCREEN_W,
              offset: SCREEN_W * index,
              index,
            })}
          />
          <View style={[styles.heroTopBar, { paddingTop: insets.top + spacing.sm }]}>
            <Pressable
              onPress={() => navigation.goBack()}
              hitSlop={12}
              style={styles.heroIconBtn}
              accessibilityLabel="Go back"
            >
              <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
            </Pressable>
            <View style={styles.heroTopSpacer} />
            <Pressable
              hitSlop={12}
              style={styles.heroIconBtn}
              onPress={() => toggleFavorite(listingItem)}
              accessibilityLabel="Toggle favorite"
            >
              <Ionicons
                name={isFavorite(listingId) ? 'heart' : 'heart-outline'}
                size={22}
                color={isFavorite(listingId) ? colors.error : colors.textPrimary}
              />
            </Pressable>
          </View>
          <View style={styles.heroDots}>
            {images.map((_, i) => (
              <View
                key={i}
                style={[styles.dot, i === slide && styles.dotActive]}
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
            {tagPills.length > 0 ? (
              <View style={styles.tagRow}>
                {tagPills.map((t) => (
                  <View key={t} style={styles.tagPill}>
                    <Text style={styles.tagPillText}>{t}</Text>
                  </View>
                ))}
              </View>
            ) : null}
          </View>

          <View style={[styles.card, shadows.soft]}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Description</Text>
              {descLong ? (
                <Pressable onPress={() => setDescExpanded((e) => !e)} hitSlop={8}>
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

          <Pressable
            style={[styles.card, styles.sellerCard, shadows.soft]}
            onPress={openSellerProfile}
            accessibilityLabel={`View ${seller}'s profile`}
            disabled={profileResolving}
          >
            <RemoteImage uri={sellerAvatar} style={styles.sellerAvatar} />
            <View style={styles.sellerMeta}>
              <Text style={styles.sellerName}>{seller}</Text>
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={16} color={colors.ratingStar} />
                <Text style={styles.ratingText}>4.5 (22 reviews)</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </Pressable>
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
        {isOwnListing ? (
          <Pressable
            style={[styles.btnRemove, removing && styles.btnRemoveDisabled]}
            onPress={handleRemoveListing}
            accessibilityRole="button"
            accessibilityLabel="Remove this listing"
            disabled={removing}
          >
            <Ionicons name="trash-outline" size={20} color={colors.primary} />
            <Text style={styles.btnRemoveText}>
              {removing ? 'Removing…' : 'Remove Listing'}
            </Text>
          </Pressable>
        ) : (
          <View style={styles.footerRow}>
            <Pressable
              style={[styles.btnOffer, { width: footerBtnWidth }]}
              onPress={() => setOfferOpen(true)}
              accessibilityRole="button"
              accessibilityLabel={`Send offer ${priceDisplay}`}
              disabled={conversationOpening}
            >
              <Ionicons name="pricetag-outline" size={20} color={colors.primary} />
              <Text style={styles.btnOfferText} numberOfLines={1}>
                Offer
              </Text>
            </Pressable>
            <Pressable
              style={[styles.btnChat, { width: footerBtnWidth }]}
              onPress={() => {
                void openConversation('message');
              }}
              accessibilityRole="button"
              accessibilityLabel="Message seller"
              disabled={conversationOpening}
            >
              <Ionicons name="chatbubble-outline" size={20} color={colors.textInverse} />
              <Text style={styles.btnChatText}>Message</Text>
            </Pressable>
          </View>
        )}
      </View>

      {!isOwnListing ? (
        <MakeOfferSheet
          visible={offerOpen}
          title={title}
          imageUrl={imageUrl}
          price={price}
          variant={condition}
          lowestOffer={lowestOffer}
          onClose={() => setOfferOpen(false)}
          onSubmit={handleOfferSubmit}
        />
      ) : null}
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
    backgroundColor: colors.primary,
    width: 16,
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
    padding: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
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
    fontSize: 20,
    color: colors.textPrimary,
  },
  priceAccent: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: colors.textPrimary,
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
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radii.pill,
    backgroundColor: colors.chipBg,
  },
  tagPillText: {
    ...typography.caption,
    fontFamily: fonts.medium,
    color: colors.textSecondary,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    ...typography.body,
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.textPrimary,
  },
  moreLink: {
    ...typography.caption,
    fontFamily: fonts.semiBold,
    color: colors.link,
  },
  bodyText: {
    ...typography.body,
    lineHeight: 22,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  specLine: {
    ...typography.body,
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 6,
  },
  specLabel: {
    fontFamily: fonts.semiBold,
    color: colors.textPrimary,
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
    fontFamily: fonts.bold,
    fontSize: 17,
    color: colors.textPrimary,
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
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
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
    paddingVertical: 12,
    paddingHorizontal: spacing.sm,
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
    paddingVertical: 12,
    paddingHorizontal: spacing.sm,
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
  btnRemove: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    minHeight: 48,
    paddingVertical: 12,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.card,
    borderWidth: 2,
    borderColor: colors.primaryLight,
    backgroundColor: '#F5F4FF',
  },
  btnRemoveDisabled: {
    opacity: 0.6,
  },
  btnRemoveText: {
    ...typography.button,
    color: colors.primary,
  },
});
