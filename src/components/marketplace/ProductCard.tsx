import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { RemoteImage } from '@/components/RemoteImage';
import { useMarketplace } from '@/context/MarketplaceContext';
import type { ListingItem } from '@/data/mockData';
import { colors, listingCardTypography, listingPriceDisplay, spacing } from '@/styles/theme';

/** Keep in sync with `SearchPopularCard` — shared marketplace grid look */
const IMAGE_RADIUS = 18;

type Props = {
  item: ListingItem;
  onPress?: () => void;
};

export function ProductCard({ item, onPress }: Props) {
  const { isFavorite, toggleFavorite } = useMarketplace();
  const fav = isFavorite(item.id);

  return (
    <View style={styles.wrap}>
      <View style={styles.imageShell}>
        <Pressable style={styles.imagePress} onPress={onPress}>
          <RemoteImage uri={item.imageUrl} style={styles.image} />
        </Pressable>
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
      <Pressable style={styles.copyPress} onPress={onPress}>
        <View style={styles.copy}>
          <Text
            style={styles.title}
            numberOfLines={4}
            ellipsizeMode="tail"
          >
            {item.title}
          </Text>
          <Text style={styles.price}>{item.price}</Text>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    width: '100%',
    minWidth: 0,
    marginBottom: spacing.md,
  },
  copyPress: {
    alignSelf: 'stretch',
    width: '100%',
  },
  imageShell: {
    position: 'relative',
    borderRadius: IMAGE_RADIUS,
    overflow: 'hidden',
    backgroundColor: colors.chipBg,
    aspectRatio: 0.82,
  },
  imagePress: {
    flex: 1,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  favCircle: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 2,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 252, 248, 0.96)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  copy: {
    paddingTop: 12,
    width: '100%',
    alignItems: 'flex-start',
  },
  title: {
    ...listingCardTypography.title,
    width: '100%',
  },
  price: {
    ...listingPriceDisplay,
    marginTop: 6,
  },
});
