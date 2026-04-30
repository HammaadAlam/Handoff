/**
 * Filters — sheet layout; max price slider, sort chips, condition, footer.
 */
import { Ionicons } from '@expo/vector-icons';
import {
  CommonActions,
  RouteProp,
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Slider from '@react-native-community/slider';
import { useCallback, useMemo, useState } from 'react';
import {
  BackHandler,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { SearchFilters, SearchStackParamList } from '@/navigation/types';
import {
  DEFAULT_FILTERS,
  FILTER_CATEGORIES,
} from '@/screens/search/searchFilterUtils';
import { fonts, colors, radii, shadows, spacing, typography } from '@/styles/theme';

type SortOption = 'best' | 'low' | 'high';

const CONDITIONS = ['New', 'Like New', 'Used'] as const;
const SELLER_TYPES = ['Any', 'Individual', 'Campus shop'] as const;
const MILEAGE_LABELS = ['Any', 'On campus', 'Within 5 mi', 'Within 15 mi'] as const;

const PRICE_SLIDER_MAX = DEFAULT_FILTERS.priceMax;
const PRICE_STEP = 25;

export function FiltersScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<SearchStackParamList>>();
  const { params } = useRoute<RouteProp<SearchStackParamList, 'Filters'>>();
  const query = params?.query ?? '';
  const initialFilters = params?.filters;
  const targetRouteKey = params?.targetRouteKey;

  /** Pop when possible; if Filters is the only route (nothing to pop), replace with Search home */
  const exitFilters = useCallback(() => {
    const state = navigation.getState();
    const routes = state?.routes ?? [];
    const filtersOnly = routes.length === 1 && routes[0]?.name === 'Filters';

    if (filtersOnly || !navigation.canGoBack()) {
      navigation.replace('SearchHome');
      return;
    }
    navigation.goBack();
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      const sub = BackHandler.addEventListener('hardwareBackPress', () => {
        exitFilters();
        return true;
      });
      return () => sub.remove();
    }, [exitFilters]),
  );

  const [sort, setSort] = useState<SortOption>(initialFilters?.sort ?? 'best');
  const [priceMinInput, setPriceMinInput] = useState(
    `${initialFilters?.priceMin ?? DEFAULT_FILTERS.priceMin}`,
  );
  const [priceMaxInput, setPriceMaxInput] = useState(
    `${initialFilters?.priceMax ?? DEFAULT_FILTERS.priceMax}`,
  );
  const [priceMaxSlider, setPriceMaxSlider] = useState(
    initialFilters?.priceMax ?? PRICE_SLIDER_MAX,
  );

  const [condition, setCondition] = useState<(typeof CONDITIONS)[number] | null>(
    initialFilters?.condition ?? null,
  );
  const [sellerType, setSellerType] = useState<(typeof SELLER_TYPES)[number]>(
    initialFilters?.sellerType ?? 'Any',
  );
  const [mileage, setMileage] = useState<(typeof MILEAGE_LABELS)[number]>(
    initialFilters?.mileage ?? 'Any',
  );
  const [categories, setCategories] = useState<string[]>(
    initialFilters?.categories ?? [],
  );
  const [budgetError, setBudgetError] = useState<string | null>(null);

  const parseBudget = (value: string) => {
    const cleaned = value.replace(/[^0-9]/g, '');
    if (!cleaned) return 0;
    const parsed = Number(cleaned);
    if (!Number.isFinite(parsed)) return 0;
    return Math.min(Math.max(0, parsed), 99999);
  };

  const rangeLabel = useMemo(() => {
    const rounded = Math.round(priceMaxSlider);
    if (rounded >= PRICE_SLIDER_MAX) {
      return `$0 – $${PRICE_SLIDER_MAX.toLocaleString()}+`;
    }
    return `$0 – $${rounded.toLocaleString()}`;
  }, [priceMaxSlider]);

  const reset = () => {
    setSort('best');
    setPriceMinInput(`${DEFAULT_FILTERS.priceMin}`);
    setPriceMaxInput(`${DEFAULT_FILTERS.priceMax}`);
    setPriceMaxSlider(DEFAULT_FILTERS.priceMax);
    setCondition(null);
    setSellerType('Any');
    setMileage('Any');
    setCategories([]);
    setBudgetError(null);
  };

  const apply = () => {
    const priceMin = parseBudget(priceMinInput);
    const priceMax = parseBudget(priceMaxInput);
    if (priceMin > priceMax) {
      setBudgetError('Min budget cannot be greater than max budget.');
      return;
    }
    setBudgetError(null);
    const nextFilters: SearchFilters = {
      sort,
      priceMin,
      priceMax,
      condition,
      sellerType,
      mileage,
      categories,
    };
    if (targetRouteKey) {
      navigation.dispatch(
        CommonActions.setParams({
          params: { filters: nextFilters },
          source: targetRouteKey,
        }),
      );
      navigation.goBack();
      return;
    }
    navigation.replace('CategoryResults', { query, filters: nextFilters });
  };

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <View style={styles.sheet}>
        <View style={styles.handle} />

        <View style={styles.sheetHead}>
          <Text style={styles.sheetTitle}>Filters</Text>
          <Pressable
            onPress={exitFilters}
            hitSlop={12}
            accessibilityLabel="Close filters"
          >
            <Ionicons name="close" size={26} color={colors.textPrimary} />
          </Pressable>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollInner}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.block}>
            <View style={styles.blockHead}>
              <Text style={styles.blockTitle}>Price</Text>
              <Text style={styles.blockMeta}>{rangeLabel}</Text>
            </View>
            <Text style={styles.sliderHint}>Min and max budget</Text>
            <View style={styles.budgetRow}>
              <TextInput
                value={priceMinInput}
                onChangeText={(value) => {
                  const cleaned = value.replace(/[^0-9]/g, '');
                  setPriceMinInput(cleaned);
                }}
                keyboardType="number-pad"
                placeholder="Min"
                style={[styles.input, styles.budgetInput]}
              />
              <TextInput
                value={priceMaxInput}
                onChangeText={(value) => {
                  const cleaned = value.replace(/[^0-9]/g, '');
                  setPriceMaxInput(cleaned);
                  const numeric = parseBudget(cleaned);
                  setPriceMaxSlider(Math.min(numeric || PRICE_SLIDER_MAX, PRICE_SLIDER_MAX));
                }}
                keyboardType="number-pad"
                placeholder="Max"
                style={[styles.input, styles.budgetInput]}
              />
            </View>
            {budgetError ? <Text style={styles.errorText}>{budgetError}</Text> : null}
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={PRICE_SLIDER_MAX}
              step={PRICE_STEP}
              value={priceMaxSlider}
              onValueChange={(value) => {
                setPriceMaxSlider(value);
                setPriceMaxInput(`${Math.round(value)}`);
              }}
              minimumTrackTintColor={colors.primary}
              maximumTrackTintColor={colors.chipBg}
              thumbTintColor={colors.primary}
            />
            <Text style={styles.sortHeading}>Sort by</Text>
            <View style={styles.sortChips}>
              {(
                [
                  ['best', 'Best match'],
                  ['low', 'Low → High'],
                  ['high', 'High → Low'],
                ] as const
              ).map(([key, label]) => {
                const on = sort === key;
                return (
                  <Pressable
                    key={key}
                    onPress={() => setSort(key)}
                    style={[styles.choiceChip, on && styles.choiceChipOn]}
                  >
                    <Text style={[styles.choiceChipText, on && styles.choiceChipTextOn]}>
                      {label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.block}>
            <Text style={[styles.blockTitle, styles.blockTitleGap]}>Categories</Text>
            <Text style={styles.inlineHint}>Optional - choose any categories</Text>
            <View style={styles.chipRow}>
              {FILTER_CATEGORIES.map((category) => {
                const on = categories.includes(category);
                return (
                  <Pressable
                    key={category}
                    onPress={() =>
                      setCategories((prev) =>
                        prev.includes(category)
                          ? prev.filter((c) => c !== category)
                          : [...prev, category],
                      )
                    }
                    style={[styles.choiceChip, on && styles.choiceChipOn]}
                  >
                    <Text style={[styles.choiceChipText, on && styles.choiceChipTextOn]}>
                      {category}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.block}>
            <Text style={[styles.blockTitle, styles.blockTitleGap]}>Condition</Text>
            <View style={[styles.chipRow, styles.chipRowTight]}>
              {CONDITIONS.map((c) => {
                const on = condition === c;
                return (
                  <Pressable
                    key={c}
                    onPress={() => setCondition((prev) => (prev === c ? null : c))}
                    style={[styles.choiceChip, on && styles.choiceChipOn]}
                  >
                    <Text style={[styles.choiceChipText, on && styles.choiceChipTextOn]}>
                      {c}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.block}>
            <Text style={[styles.blockTitle, styles.blockTitleGap]}>Seller type</Text>
            <View style={[styles.chipRow, styles.chipRowTight]}>
              {SELLER_TYPES.map((s) => {
                const on = sellerType === s;
                return (
                  <Pressable
                    key={s}
                    onPress={() => setSellerType(s)}
                    style={[styles.choiceChip, on && styles.choiceChipOn]}
                  >
                    <Text style={[styles.choiceChipText, on && styles.choiceChipTextOn]}>
                      {s}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={[styles.block, styles.blockLast]}>
            <Text style={[styles.blockTitle, styles.blockTitleGap]}>Distance</Text>
            <View style={styles.chipRowWrap}>
              {MILEAGE_LABELS.map((m) => {
                const on = mileage === m;
                return (
                  <Pressable
                    key={m}
                    onPress={() => setMileage(m)}
                    style={[styles.choiceChip, on && styles.choiceChipOn]}
                  >
                    <Text style={[styles.choiceChipText, on && styles.choiceChipTextOn]}>
                      {m}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </ScrollView>

        <View style={[styles.footer, shadows.soft]}>
          <Pressable style={styles.resetBtn} onPress={reset}>
            <Text style={styles.resetText}>Reset</Text>
          </Pressable>
          <Pressable style={styles.applyBtn} onPress={apply}>
            <Text style={styles.applyText}>Apply Filter</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  sheet: {
    flex: 1,
    overflow: 'hidden',
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  sheetHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  sheetTitle: {
    ...typography.header,
    fontSize: 20,
    fontFamily: fonts.bold,
    color: colors.textPrimary,
  },
  scroll: {
    flex: 1,
  },
  scrollInner: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
  },
  block: {
    marginBottom: spacing.lg,
  },
  blockLast: {
    marginBottom: spacing.md,
  },
  blockHead: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  blockTitle: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.textPrimary,
  },
  blockTitleGap: {
    marginBottom: spacing.sm,
  },
  blockMeta: {
    ...typography.caption,
    fontSize: 13,
    color: colors.textMuted,
  },
  sliderHint: {
    ...typography.caption,
    fontFamily: fonts.semiBold,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  budgetRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  budgetInput: {
    flex: 1,
  },
  input: {
    minHeight: 44,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    paddingHorizontal: 12,
    color: colors.textPrimary,
    fontFamily: fonts.medium,
    backgroundColor: colors.surface,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
    marginTop: 2,
  },
  inlineHint: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  slider: {
    width: '100%',
    height: 44,
  },
  sortHeading: {
    ...typography.caption,
    fontFamily: fonts.semiBold,
    color: colors.textSecondary,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  sortChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  chipRowTight: {
    marginTop: 0,
  },
  chipRowWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  choiceChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radii.pill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  choiceChipOn: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  choiceChipText: {
    fontSize: 13,
    fontFamily: fonts.medium,
    color: colors.textSecondary,
  },
  choiceChipTextOn: {
    color: colors.textInverse,
    fontFamily: fonts.semiBold,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  resetBtn: {
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  resetText: {
    ...typography.button,
    fontSize: 15,
    color: colors.primaryDark,
    fontFamily: fonts.semiBold,
  },
  applyBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: radii.button,
    paddingVertical: 14,
    alignItems: 'center',
    ...shadows.button,
  },
  applyText: {
    ...typography.button,
    color: colors.textInverse,
    fontSize: 16,
  },
});
