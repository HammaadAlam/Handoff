/**
 * Product Card — UI component.
 */
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { RemoteImage } from '@/components/RemoteImage';
import { useMarketplace } from '@/context/MarketplaceContext';
import type { ListingItem } from '@/data/mockData';
import { colors, fonts, spacing } from '@/styles/theme';

type Props = {
  item: ListingItem;
  onPress?: () => void;
  variant?: 'grid' | 'rail';
  width?: number;
};

export function ProductCard({
  item,
  onPress,
  variant = 'grid',
  width,
}: Props) {
  const { isFavorite, toggleFavorite } = useMarketplace();
  const fav = isFavorite(item.id);
  const isRail = variant === 'rail';
  const titleNumberOfLines = isRail ? 1 : 2;
  const favoriteCount = item.favoriteCount ?? 0;
  const favoriteCountLabel = favoriteCount > 99 ? '99+' : String(favoriteCount);

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        isRail ? styles.railCard : styles.gridCard,
        width != null && { width },
        pressed && styles.cardPressed,
      ]}
    >
      <View style={styles.imageShell}>
        <RemoteImage uri={item.imageUrl} style={styles.image} />
        <Pressable
          style={styles.favCircle}
          onPress={(event) => {
            event.stopPropagation();
            toggleFavorite(item);
          }}
          hitSlop={8}
          accessibilityLabel={fav ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Ionicons
            name={fav ? 'heart' : 'heart-outline'}
            size={18}
            color={fav ? colors.error : colors.textPrimary}
          />
          <Text style={styles.favoriteCountText}>{favoriteCountLabel}</Text>
        </Pressable>
      </View>
      <View style={styles.copy}>
        <Text
          style={[styles.title, isRail ? styles.railTitle : styles.gridTitle]}
          numberOfLines={titleNumberOfLines}
          ellipsizeMode="tail"
        >
          {item.title}
        </Text>
        <Text style={[styles.price, isRail && styles.railPrice]}>{item.price}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
  },
  gridCard: {
    width: '100%',
    minWidth: 0,
    marginBottom: spacing.lg,
  },
  railCard: {
    marginRight: 12,
  },
  cardPressed: {
    transform: [{ scale: 0.97 }],
  },
  imageShell: {
    position: 'relative',
    backgroundColor: colors.chipBg,
    aspectRatio: 0.82,
    borderRadius: 22,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  favCircle: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 2,
    minWidth: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.97)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
    gap: 1,
  },
  favoriteCountText: {
    color: colors.textPrimary,
    fontFamily: fonts.semiBold,
    fontSize: 10,
    lineHeight: 11,
  },
  copy: {
    paddingTop: 14,
    paddingBottom: 10,
    width: '100%',
    alignItems: 'flex-start',
  },
  title: {
    color: colors.textPrimary,
    fontFamily: fonts.medium,
    fontSize: 15,
    lineHeight: 18,
    width: '100%',
  },
  gridTitle: {
    minHeight: 36,
  },
  railTitle: {
    minHeight: 0,
  },
  price: {
    color: colors.textPrimary,
    fontFamily: fonts.extraBold,
    fontSize: 19,
    lineHeight: 22,
    letterSpacing: -0.2,
    marginTop: 8,
  },
  railPrice: {
    marginTop: 8,
  },
});
