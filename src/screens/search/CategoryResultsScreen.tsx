/**
 * Category / text search results — grid + open filters.
 */
import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMemo } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ProductCard } from '@/components/marketplace/ProductCard';
import { DEFAULT_PEER_AVATAR_URI, listingsForSearchQuery } from '@/data/mockData';
import { navigateToItemDetail } from '@/navigation/navigateItemDetail';
import type { SearchStackParamList } from '@/navigation/types';
import { fonts, colors, spacing, typography } from '@/styles/theme';

export function CategoryResultsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<SearchStackParamList>>();
  const { width } = useWindowDimensions();
  const gridInset = spacing.md;
  const gridGutter = spacing.sm;
  const gridInnerWidth = width - gridInset * 2;
  const gridColWidth = (gridInnerWidth - gridGutter) / 2;
  const { params } = useRoute<RouteProp<SearchStackParamList, 'CategoryResults'>>();
  const { query } = params;

  const data = useMemo(
    () => listingsForSearchQuery(query),
    [query],
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.top}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </Pressable>
        <Pressable
          onPress={() => navigation.navigate('Filters')}
          hitSlop={12}
          style={styles.filterBtn}
        >
          <Ionicons name="filter-outline" size={24} color={colors.textPrimary} />
        </Pressable>
      </View>
      <Text style={styles.title}>{query}</Text>

      <FlatList
        style={styles.listFlex}
        data={data}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={[styles.row, { gap: gridGutter }]}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={{ width: gridColWidth, minWidth: 0 }}>
            <ProductCard
              item={item}
              onPress={() =>
                navigateToItemDetail(navigation, {
                  listingId: item.id,
                  title: item.title,
                  price: item.price,
                  imageUrl: item.imageUrl,
                  seller: item.sellerHandle,
                  sellerProfileId: item.sellerId,
                  sellerAvatarUrl: item.sellerAvatarUrl ?? DEFAULT_PEER_AVATAR_URI,
                  description: item.description,
                  condition: item.condition,
                  categoryLabel: item.category,
                  meetupLocation: item.location,
                })
              }
            />
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  listFlex: {
    flex: 1,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xs,
  },
  filterBtn: {
    padding: 4,
  },
  title: {
    fontSize: 28,
    fontFamily: fonts.extraBold,
    color: colors.textPrimary,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  list: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
});
