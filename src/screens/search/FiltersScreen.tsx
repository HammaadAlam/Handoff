/**
 * Filters — sheet layout; max price slider, sort chips, condition, footer.
 */
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Slider from '@react-native-community/slider';
import { useCallback, useMemo, useState } from 'react';
import { BackHandler, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { SearchStackParamList } from '@/navigation/types';
import { fonts, colors, radii, shadows, spacing, typography } from '@/styles/theme';

type SortOption = 'best' | 'low' | 'high';

const CONDITIONS = ['New', 'Like New', 'Used'] as const;
const SELLER_TYPES = ['Individual', 'Campus shop'] as const;
const MILEAGE_LABELS = ['Any', 'On campus', 'Within 5 mi', 'Within 15 mi'] as const;

const PRICE_SLIDER_MAX = 2000;
const PRICE_STEP = 25;

export function FiltersScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<SearchStackParamList>>();

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

  const [sort, setSort] = useState<SortOption>('best');
  /** Maximum budget (slider); min is always $0 */
  const [priceMax, setPriceMax] = useState(PRICE_SLIDER_MAX);

  const [condition, setCondition] = useState<(typeof CONDITIONS)[number] | null>(null);
  const [sellerType, setSellerType] = useState<(typeof SELLER_TYPES)[number]>('Individual');
  const [mileage, setMileage] = useState<(typeof MILEAGE_LABELS)[number]>('Any');

  const rangeLabel = useMemo(() => {
    const rounded = Math.round(priceMax);
    if (rounded >= PRICE_SLIDER_MAX) {
      return `$0 – $${PRICE_SLIDER_MAX.toLocaleString()}+`;
    }
    return `$0 – $${rounded.toLocaleString()}`;
  }, [priceMax]);

  const reset = () => {
    setSort('best');
    setPriceMax(PRICE_SLIDER_MAX);
    setCondition(null);
    setSellerType('Individual');
    setMileage('Any');
  };

  const apply = () => {
    exitFilters();
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
          {/* Price — slider only */}
          <View style={styles.block}>
            <View style={styles.blockHead}>
              <Text style={styles.blockTitle}>Price</Text>
              <Text style={styles.blockMeta}>{rangeLabel}</Text>
            </View>
            <Text style={styles.sliderHint}>Max budget</Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={PRICE_SLIDER_MAX}
              step={PRICE_STEP}
              value={priceMax}
              onValueChange={setPriceMax}
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
