/**
 * Search grid card — rounded image, favorite on image, title + prominent price (minimal).
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
};

/** Image corner radius — generous rounded photo (reference ~16–24px) */
const IMAGE_RADIUS = 22;

export function SearchPopularCard({ item, onPress }: Props) {
  const { isFavorite, toggleFavorite } = useMarketplace();
  const fav = isFavorite(item.id);

  return (
    <Pressable
      style={[styles.card, styles.cardFill]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${item.title}, ${item.price}`}
    >
      <View style={styles.imageShell}>
        <RemoteImage uri={item.imageUrl} style={styles.image} />
        <Pressable
          style={styles.favCircle}
          onPress={() => toggleFavorite(item)}
          hitSlop={8}
          accessibilityLabel={fav ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Ionicons
            name={fav ? 'heart' : 'heart-outline'}
            size={20}
            color={fav ? colors.error : colors.textPrimary}
          />
        </Pressable>
      </View>

      <View style={styles.copy}>
        <Text
          style={styles.title}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {item.title}
        </Text>
        <Text style={styles.price}>{item.price}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {},
  cardFill: {
    width: '100%',
    minWidth: 0,
    alignSelf: 'stretch',
  },
  imageShell: {
    position: 'relative',
    borderRadius: IMAGE_RADIUS,
    overflow: 'hidden',
    backgroundColor: colors.chipBg,
    /** Taller-than-wide photo */
    aspectRatio: 0.82,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  favCircle: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.97)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  copy: {
    paddingTop: 14,
    width: '100%',
    alignItems: 'flex-start',
  },
  title: {
    fontFamily: fonts.medium,
    fontSize: 15,
    lineHeight: 18,
    color: colors.textPrimary,
    width: '100%',
  },
  price: {
    color: colors.textPrimary,
    fontFamily: fonts.extraBold,
    fontSize: 19,
    lineHeight: 22,
    marginTop: 8,
  },
});
