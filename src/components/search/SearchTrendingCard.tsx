import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { RemoteImage } from '@/components/RemoteImage';
import { useMarketplace } from '@/context/MarketplaceContext';
import type { ListingItem } from '@/data/mockData';
import { colors, fonts } from '@/styles/theme';

type Props = {
  item: ListingItem;
  onPress?: () => void;
};

function fallbackFavoriteCount(listingId: string): number {
  let hash = 0;
  for (let i = 0; i < listingId.length; i += 1) {
    hash = (hash * 31 + listingId.charCodeAt(i)) >>> 0;
  }
  return (hash % 23) + 3;
}

export function SearchTrendingCard({ item, onPress }: Props) {
  const { isFavorite, toggleFavorite } = useMarketplace();
  const favorite = isFavorite(item.id);
  const count = item.favoriteCount ?? fallbackFavoriteCount(item.id);
  const countLabel = count > 99 ? '99+' : String(count);
  const rating = typeof item.rating === 'number' ? item.rating.toFixed(1) : '4.8';
  const postedAgo = item.postedAgo ?? '2h ago';

  return (
    <Pressable
      accessibilityLabel={`${item.title}, ${item.price}`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <View style={styles.imageShell}>
        <RemoteImage style={styles.image} uri={item.imageUrl} />
        <Pressable
          accessibilityLabel={favorite ? 'Remove from favorites' : 'Add to favorites'}
          hitSlop={8}
          onPress={() => toggleFavorite(item)}
          style={styles.favoriteButton}
        >
          <Ionicons
            color={favorite ? colors.error : colors.textPrimary}
            name={favorite ? 'heart' : 'heart-outline'}
            size={15}
          />
          <Text style={styles.favoriteCountText}>{countLabel}</Text>
        </Pressable>
      </View>

      <View style={styles.copy}>
        <Text numberOfLines={2} style={styles.title}>
          {item.title}
        </Text>
        <Text style={styles.price}>{item.price}</Text>

        <View style={styles.metaRow}>
          <View style={styles.ratingWrap}>
            <Ionicons color={colors.primary} name="star" size={11} />
            <Text style={styles.metaText}>{rating}</Text>
          </View>
          <Text style={styles.metaText}>{postedAgo}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    height: 170,
    borderRadius: 16,
    backgroundColor: colors.surface,
  },
  cardPressed: {
    transform: [{ scale: 0.98 }],
  },
  imageShell: {
    position: 'relative',
    height: 96,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: 'hidden',
    backgroundColor: colors.chipBg,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    minWidth: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.96)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    gap: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  favoriteCountText: {
    color: colors.textPrimary,
    fontFamily: fonts.semiBold,
    fontSize: 9,
    lineHeight: 10,
  },
  copy: {
    flex: 1,
    paddingTop: 8,
    paddingBottom: 2,
    gap: 2,
  },
  title: {
    fontFamily: fonts.medium,
    fontSize: 13,
    lineHeight: 16,
    color: colors.textPrimary,
  },
  price: {
    fontFamily: fonts.bold,
    fontSize: 14,
    lineHeight: 18,
    color: colors.textPrimary,
  },
  metaRow: {
    marginTop: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  ratingWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontFamily: fonts.medium,
    fontSize: 11,
    lineHeight: 13,
    color: colors.textSecondary,
  },
});
