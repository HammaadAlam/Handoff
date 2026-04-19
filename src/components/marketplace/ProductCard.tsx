import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { RemoteImage } from '@/components/RemoteImage';
import { useMarketplace } from '@/context/MarketplaceContext';
import type { ListingItem } from '@/data/mockData';
import { fonts, colors, radii, typography } from '@/styles/theme';

type Props = {
  item: ListingItem;
  onPress?: () => void;
};

export function ProductCard({ item, onPress }: Props) {
  const { isFavorite, toggleFavorite } = useMarketplace();
  const fav = isFavorite(item.id);

  return (
    <View style={styles.wrap}>
      <View style={styles.imageBox}>
        <Pressable style={styles.imagePress} onPress={onPress}>
          <RemoteImage uri={item.imageUrl} style={styles.image} />
        </Pressable>
        <Pressable
          style={styles.favBtn}
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
      <Pressable onPress={onPress}>
        <Text style={styles.title} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.price}>{item.price}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 6,
    marginBottom: 16,
  },
  imageBox: {
    position: 'relative',
    aspectRatio: 1,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.border,
  },
  imagePress: {
    flex: 1,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  favBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 2,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 16,
    padding: 6,
  },
  title: {
    ...typography.body,
    fontSize: 14,
    marginTop: 8,
    color: colors.textPrimary,
  },
  price: {
    ...typography.body,
    fontSize: 15,
    fontFamily: fonts.bold,
    color: colors.textPrimary,
    marginTop: 2,
  },
});
