/**
 * Saved favorites — opens ItemDetail from saved listings.
 */
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RemoteImage } from '@/components/RemoteImage';
import { useMarketplace } from '@/context/MarketplaceContext';
import { DEFAULT_PEER_AVATAR_URI, PLACEHOLDER_IMAGE_URI } from '@/data/mockData';
import type { RootStackParamList } from '@/navigation/types';
import { colors, radii, spacing, typography } from '@/styles/theme';

export function FavoritesScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { favorites, toggleFavorite } = useMarketplace();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Favorites</Text>
        <View style={{ width: 28 }} />
      </View>

      <FlatList
        data={favorites}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <RemoteImage uri={PLACEHOLDER_IMAGE_URI} style={styles.emptyImg} />
            <Text style={styles.emptyTitle}>No favorites yet</Text>
            <Text style={styles.emptySub}>
              Tap the heart on a listing to save it here.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.cell}>
            <Pressable
              style={styles.card}
              onPress={() =>
                navigation.navigate('ItemDetail', {
                  listingId: item.id,
                  title: item.title,
                  price: item.price,
                  imageUrl: item.imageUrl,
                  sellerAvatarUrl: DEFAULT_PEER_AVATAR_URI,
                })
              }
            >
              <View style={styles.imgBox}>
                <RemoteImage uri={item.imageUrl} style={styles.img} />
                <Pressable
                  style={styles.fav}
                  onPress={() => toggleFavorite(item)}
                  hitSlop={8}
                >
                  <Ionicons name="heart" size={20} color={colors.error} />
                </Pressable>
              </View>
              <Text style={styles.cardTitle} numberOfLines={2}>
                {item.title}
              </Text>
              <Text style={styles.price}>{item.price}</Text>
            </Pressable>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  headerTitle: {
    ...typography.header,
    fontSize: 18,
  },
  list: {
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.xl,
    flexGrow: 1,
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  cell: {
    width: '50%',
    paddingHorizontal: 6,
    marginBottom: 16,
  },
  card: {
    flex: 1,
  },
  imgBox: {
    aspectRatio: 1,
    borderRadius: radii.card,
    overflow: 'hidden',
    backgroundColor: colors.border,
  },
  img: {
    width: '100%',
    height: '100%',
  },
  fav: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 16,
    padding: 6,
  },
  cardTitle: {
    ...typography.body,
    fontSize: 14,
    marginTop: 8,
    color: colors.textPrimary,
  },
  price: {
    fontWeight: '700',
    marginTop: 2,
    color: colors.textPrimary,
  },
  empty: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl,
  },
  emptyImg: {
    width: 160,
    height: 120,
    borderRadius: radii.card,
    marginBottom: spacing.md,
    opacity: 0.85,
  },
  emptyTitle: {
    ...typography.header,
    fontSize: 18,
    marginBottom: spacing.sm,
  },
  emptySub: {
    ...typography.body,
    textAlign: 'center',
    color: colors.textSecondary,
    lineHeight: 22,
  },
});
