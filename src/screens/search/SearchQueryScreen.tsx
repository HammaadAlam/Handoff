/**
 * Active search — full-screen white search surface launched from the landing bar.
 */
import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect, useMemo, useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  type ListingItem,
} from '@/data/mockData';
import type { SearchStackParamList } from '@/navigation/types';
import { fetchRecommendedListings } from '@/services/listings';
import { colors, fonts, spacing } from '@/styles/theme';

const SUGGESTION_LIMIT = 6;

function haystackForListing(item: ListingItem) {
  return [item.title, item.brand, item.category, item.description, item.sellerHandle]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

export function SearchQueryScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<SearchStackParamList>>();
  const { params } = useRoute<RouteProp<SearchStackParamList, 'SearchQuery'>>();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState(params?.initialQuery ?? '');
  const [listings, setListings] = useState<ListingItem[]>([]);

  const trimmedQuery = query.trim();

  const suggestions = useMemo(() => {
    if (!trimmedQuery) {
      return [];
    }

    const normalizedQuery = trimmedQuery.toLowerCase();
    return listings
      .filter((item) => haystackForListing(item).includes(normalizedQuery))
      .slice(0, SUGGESTION_LIMIT);
  }, [trimmedQuery, listings]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const items = await fetchRecommendedListings();
      if (!cancelled) setListings(items);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const submit = (term: string) => {
    const nextQuery = term.trim();
    if (!nextQuery) {
      return;
    }

    navigation.navigate('CategoryResults', { query: nextQuery });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <View style={styles.screen}>
        <View style={[styles.header, { paddingTop: insets.top + 6 }]}>
          <Pressable
            accessibilityLabel="Close search"
            hitSlop={12}
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </Pressable>

          <View style={styles.searchPill}>
            <Ionicons name="search-outline" size={20} color={colors.textMuted} />
            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              autoFocus
              onChangeText={setQuery}
              onSubmitEditing={() => submit(query)}
              placeholder="Search campus items"
              placeholderTextColor={colors.textMuted}
              returnKeyType="search"
              style={styles.input}
              value={query}
            />
            {query.length > 0 ? (
              <Pressable
                accessibilityLabel="Clear search"
                hitSlop={10}
                onPress={() => setQuery('')}
              >
                <Ionicons name="close-circle" size={19} color={colors.textMuted} />
              </Pressable>
            ) : null}
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {trimmedQuery.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.kicker}>Search HandOff</Text>
              <Text style={styles.headline}>Find anything on campus.</Text>
              <Text style={styles.body}>
                Search for textbooks, laptops, tickets, furniture, and quick
                pickup deals near LSU.
              </Text>

              <Text style={styles.sectionLabel}>Recently searched</Text>
              <View style={styles.quickWrap}>
                <Text style={styles.noMatches}>No recent searches yet.</Text>
              </View>
            </View>
          ) : (
            <View>
              <Pressable
                onPress={() => submit(trimmedQuery)}
                style={styles.searchSubmitRow}
              >
                <View style={styles.submitIcon}>
                  <Ionicons name="search-outline" size={18} color={colors.primary} />
                </View>
                <Text style={styles.submitText} numberOfLines={1}>
                  Search for "{trimmedQuery}"
                </Text>
                <Ionicons
                  name="arrow-forward"
                  size={18}
                  color={colors.textSecondary}
                />
              </Pressable>

              <Text style={styles.sectionLabel}>Suggestions</Text>
              {suggestions.length > 0 ? (
                suggestions.map((item) => (
                  <Pressable
                    key={item.id}
                    onPress={() => {
                      setQuery(item.title);
                      submit(item.title);
                    }}
                    style={styles.suggestionRow}
                  >
                    <View style={styles.suggestionIcon}>
                      <Ionicons
                        name="pricetag-outline"
                        size={18}
                        color={colors.textSecondary}
                      />
                    </View>
                    <View style={styles.suggestionCopy}>
                      <Text style={styles.suggestionTitle} numberOfLines={1}>
                        {item.title}
                      </Text>
                      <Text style={styles.suggestionMeta} numberOfLines={1}>
                        {[item.price, item.category, item.location]
                          .filter(Boolean)
                          .join(' · ')}
                      </Text>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color={colors.textMuted}
                    />
                  </Pressable>
                ))
              ) : (
                <Text style={styles.noMatches}>
                  No quick matches yet. Press search to see all results.
                </Text>
              )}
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  screen: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: spacing.md,
    paddingBottom: 12,
  },
  backButton: {
    width: 34,
    height: 44,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  searchPill: {
    flex: 1,
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    borderRadius: 24,
    backgroundColor: '#F8F7FC',
    paddingHorizontal: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#ECE7F8',
  },
  input: {
    flex: 1,
    color: colors.textPrimary,
    fontFamily: fonts.medium,
    fontSize: 15,
    paddingVertical: Platform.OS === 'ios' ? 12 : 9,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.md,
    paddingTop: 16,
    paddingBottom: spacing.xxl,
  },
  emptyState: {
    flex: 1,
  },
  kicker: {
    color: colors.primary,
    fontFamily: fonts.bold,
    fontSize: 13,
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },
  headline: {
    color: colors.textPrimary,
    fontFamily: fonts.extraBold,
    fontSize: 30,
    lineHeight: 36,
    letterSpacing: -0.8,
    marginTop: 10,
  },
  body: {
    color: colors.textSecondary,
    fontFamily: fonts.medium,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 10,
    maxWidth: 330,
  },
  sectionLabel: {
    color: colors.textSecondary,
    fontFamily: fonts.bold,
    fontSize: 13,
    marginTop: 28,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  quickWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  quickChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    borderRadius: 999,
    backgroundColor: '#F5F1FF',
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  quickText: {
    color: colors.primary,
    fontFamily: fonts.semiBold,
    fontSize: 14,
    textTransform: 'capitalize',
  },
  searchSubmitRow: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 18,
    backgroundColor: '#F8F7FC',
    paddingHorizontal: 14,
  },
  submitIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFEAFF',
  },
  submitText: {
    flex: 1,
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    fontSize: 15,
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  suggestionIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.chipBg,
  },
  suggestionCopy: {
    flex: 1,
  },
  suggestionTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.semiBold,
    fontSize: 15,
  },
  suggestionMeta: {
    color: colors.textSecondary,
    fontFamily: fonts.medium,
    fontSize: 12,
    marginTop: 4,
  },
  noMatches: {
    color: colors.textSecondary,
    fontFamily: fonts.medium,
    fontSize: 14,
    lineHeight: 20,
  },
});
