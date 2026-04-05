/**
 * Search landing — logo, tappable search field, categories, trending.
 */
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CategoryTile } from '@/components/marketplace/CategoryTile';
import { ProductCard } from '@/components/marketplace/ProductCard';
import {
  DEFAULT_PEER_AVATAR_URI,
  SUGGESTED_CATEGORIES,
  TRENDING_LISTINGS,
} from '@/data/mockData';
import { navigateToItemDetail } from '@/navigation/navigateItemDetail';
import type { SearchStackParamList } from '@/navigation/types';
import { colors, spacing, typography } from '@/styles/theme';

export function SearchHomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<SearchStackParamList>>();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <Text style={styles.pageTitle}>Item Search</Text>

        <Pressable
          onPress={() => navigation.navigate('SearchQuery', {})}
          style={styles.searchRow}
          accessibilityRole="button"
          accessibilityLabel="Open search"
        >
          <Ionicons
            name="search-outline"
            size={22}
            color={colors.textSecondary}
            style={styles.searchIcon}
          />
          <Text style={styles.searchPlaceholder}>Search</Text>
        </Pressable>

        <Text style={styles.section}>Suggested Categories</Text>
        <View style={styles.grid3}>
          {SUGGESTED_CATEGORIES.map((c) => (
            <CategoryTile
              key={c.id}
              category={c}
              onPress={() =>
                navigation.navigate('CategoryResults', { query: c.label })
              }
            />
          ))}
        </View>

        <Text style={styles.section}>Trending Items</Text>
        <View style={styles.grid3}>
          {TRENDING_LISTINGS.map((item) => (
            <View key={item.id} style={styles.trendCell}>
              <ProductCard
                item={item}
                onPress={() =>
                  navigateToItemDetail(navigation, {
                    listingId: item.id,
                    title: item.title,
                    price: item.price,
                    imageUrl: item.imageUrl,
                    sellerAvatarUrl: DEFAULT_PEER_AVATAR_URI,
                  })
                }
              />
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  scroll: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
  pageTitle: {
    ...typography.title,
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.primaryLight,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: spacing.lg,
    backgroundColor: colors.chipBg,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchPlaceholder: {
    fontSize: 16,
    color: colors.textMuted,
  },
  section: {
    ...typography.header,
    fontSize: 17,
    marginBottom: spacing.md,
    color: colors.textPrimary,
  },
  grid3: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  trendCell: {
    width: '31%',
    marginBottom: 8,
  },
});
