/**
 * Product detail — gallery, price/condition, description, meetup, message / offer CTAs.
 */
import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import {
  Dimensions,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RemoteImage } from '@/components/RemoteImage';
import { useMarketplace } from '@/context/MarketplaceContext';
import { DEFAULT_PEER_AVATAR_URI, type ListingItem } from '@/data/mockData';
import { colors, radii, spacing, typography } from '@/styles/theme';
import type { RootStackParamList } from '@/navigation/types';

const { width: SCREEN_W } = Dimensions.get('window');
const CAROUSEL_H = 280;

const DEFAULT_DESC =
  'Great camera for photos and video — lightweight body, full-frame sensor. Works perfectly; always kept in a dry bag on campus.';

export function ItemDetailScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { params } = useRoute<RouteProp<RootStackParamList, 'ItemDetail'>>();
  const {
    listingId,
    title,
    price,
    imageUrl,
    seller = 'fahdhkhattak',
    sellerAvatarUrl,
    categoryLabel = 'Camera',
    condition = 'Slightly Used',
    description = DEFAULT_DESC,
    meetupLocation = 'LSU Student Union',
    galleryUrls,
  } = params;

  const images = galleryUrls?.length ? galleryUrls : [imageUrl, imageUrl, imageUrl, imageUrl];
  const [slide, setSlide] = useState(0);
  const { toggleFavorite, isFavorite, addToCart } = useMarketplace();

  const listingItem: ListingItem = useMemo(
    () => ({
      id: listingId,
      title,
      price,
      imageUrl,
    }),
    [listingId, title, price, imageUrl],
  );

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    const i = Math.round(x / SCREEN_W);
    setSlide(Math.min(Math.max(i, 0), images.length - 1));
  };

  const openConversation = (entry: 'message' | 'offer') => {
    navigation.navigate('Conversation', {
      listingId,
      title,
      price,
      imageUrl,
      seller,
      avatarUrl: sellerAvatarUrl ?? DEFAULT_PEER_AVATAR_URI,
      entry,
    });
  };

  const headerTitle = `${seller} - ${categoryLabel}`;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {headerTitle}
        </Text>
        <Pressable
          hitSlop={12}
          style={styles.headerBtn}
          onPress={() => toggleFavorite(listingItem)}
          accessibilityLabel="Toggle favorite"
        >
          <Ionicons
            name={isFavorite(listingId) ? 'heart' : 'heart-outline'}
            size={24}
            color={isFavorite(listingId) ? colors.error : colors.textPrimary}
          />
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.aboutHeading}>About this Item</Text>

        <View style={styles.carouselWrap}>
          <FlatList
            data={images}
            keyExtractor={(_, i) => `${i}`}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={onScroll}
            scrollEventThrottle={16}
            renderItem={({ item }) => (
              <RemoteImage uri={item} style={styles.carouselImage} />
            )}
            getItemLayout={(_, index) => ({
              length: SCREEN_W,
              offset: SCREEN_W * index,
              index,
            })}
          />
          <View style={styles.dots}>
            {images.map((_, i) => (
              <View
                key={i}
                style={[styles.dot, i === slide && styles.dotActive]}
              />
            ))}
          </View>
        </View>

        <View style={styles.priceRow}>
          <Text style={styles.price}>US {price.startsWith('$') ? price : `$${price}`}</Text>
          <Text style={styles.condition}>{condition}</Text>
        </View>

        <Text style={styles.descLabel}>Description</Text>
        <View style={styles.descBox}>
          <Text style={styles.descText}>{description}</Text>
        </View>

        <Text style={styles.meetup}>
          <Text style={styles.meetupStar}>*</Text>
          <Text> Specified Meetup Location: </Text>
          <Text style={styles.meetupLink}>{meetupLocation}</Text>
        </Text>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          style={styles.btnCart}
          onPress={() => addToCart(listingItem)}
        >
          <Ionicons name="bag-outline" size={22} color={colors.primary} />
          <Text style={styles.btnCartText}>Add to cart</Text>
        </Pressable>
        <Pressable
          style={styles.btnPrimary}
          onPress={() => openConversation('message')}
        >
          <Text style={styles.btnPrimaryText}>Message Seller</Text>
        </Pressable>
        <Pressable
          style={styles.btnOutline}
          onPress={() => openConversation('offer')}
        >
          <Text style={styles.btnOutlineText}>Send Offer ({price})</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  headerBtn: {
    width: 40,
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    ...typography.body,
    fontWeight: '700',
    fontSize: 16,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.lg,
  },
  aboutHeading: {
    textAlign: 'center',
    ...typography.body,
    fontWeight: '700',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    color: colors.textPrimary,
  },
  carouselWrap: {
    width: SCREEN_W,
    alignSelf: 'center',
  },
  carouselImage: {
    width: SCREEN_W,
    height: CAROUSEL_H,
    backgroundColor: colors.chipBg,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: 10,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.border,
  },
  dotActive: {
    backgroundColor: colors.primary,
    width: 8,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    marginTop: spacing.lg,
  },
  price: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  condition: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  descLabel: {
    ...typography.body,
    fontWeight: '700',
    marginTop: spacing.lg,
    paddingHorizontal: spacing.md,
    color: colors.textPrimary,
  },
  descBox: {
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    backgroundColor: colors.bannerTint,
    borderRadius: radii.card,
    padding: spacing.md,
  },
  descText: {
    ...typography.body,
    lineHeight: 22,
    color: colors.textPrimary,
  },
  meetup: {
    marginHorizontal: spacing.md,
    marginTop: spacing.lg,
    ...typography.body,
    lineHeight: 22,
  },
  meetupStar: {
    color: colors.error,
  },
  meetupLink: {
    color: colors.link,
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    gap: 10,
    backgroundColor: colors.surface,
  },
  btnCart: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: radii.button,
    paddingVertical: 12,
    backgroundColor: colors.bannerTint,
  },
  btnCartText: {
    ...typography.button,
    color: colors.primary,
  },
  btnPrimary: {
    backgroundColor: colors.primary,
    borderRadius: radii.button,
    paddingVertical: 14,
    alignItems: 'center',
  },
  btnPrimaryText: {
    ...typography.button,
    color: '#FFF',
  },
  btnOutline: {
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: radii.button,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  btnOutlineText: {
    ...typography.button,
    color: colors.primary,
  },
});
