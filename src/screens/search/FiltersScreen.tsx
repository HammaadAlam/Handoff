/**
 * Filter sheet — accordion rows, expanded Price (sort + min/max), Apply / Reset.
 */
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { SearchStackParamList } from '@/navigation/types';
import { colors, radii, spacing, typography } from '@/styles/theme';

const SECTIONS = [
  'Brand',
  'Size',
  'Price',
  'Color',
  'Rating',
  'Lister',
  'Subject',
  'Condition',
] as const;

type SortOption = 'best' | 'low' | 'high';

export function FiltersScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<SearchStackParamList>>();
  const [expanded, setExpanded] = useState<string | null>('Price');
  const [sort, setSort] = useState<SortOption>('best');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const toggle = (name: string) => {
    setExpanded((prev) => (prev === name ? null : name));
  };

  const reset = () => {
    setSort('best');
    setMinPrice('');
    setMaxPrice('');
    setExpanded('Price');
  };

  const apply = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={12}
          style={styles.headerIconBtn}
        >
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Filters</Text>
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={12}
          style={styles.headerIconBtn}
        >
          <Ionicons name="close" size={26} color={colors.textPrimary} />
        </Pressable>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {SECTIONS.map((name) => (
          <View key={name} style={styles.section}>
            <Pressable
              style={styles.accordionHead}
              onPress={() => toggle(name)}
            >
              <Text style={styles.accordionTitle}>{name}</Text>
              <Ionicons
                name={expanded === name ? 'chevron-up' : 'chevron-down'}
                size={22}
                color={colors.textSecondary}
              />
            </Pressable>
            {expanded === name && name === 'Price' && (
              <View style={styles.priceBody}>
                <View style={styles.sortCol}>
                  {(
                    [
                      ['best', 'Best Match'],
                      ['low', 'Low to High'],
                      ['high', 'High to Low'],
                    ] as const
                  ).map(([key, label]) => (
                    <Pressable
                      key={key}
                      style={styles.radioRow}
                      onPress={() => setSort(key)}
                    >
                      <View
                        style={[
                          styles.radioOuter,
                          sort === key && styles.radioOuterOn,
                        ]}
                      >
                        {sort === key && <View style={styles.radioInner} />}
                      </View>
                      <Text style={styles.radioLabel}>{label}</Text>
                    </Pressable>
                  ))}
                </View>
                <View style={styles.priceInputs}>
                  <Text style={styles.miniLabel}>Min. Price</Text>
                  <View style={styles.miniField}>
                    <Text style={styles.dollar}>$</Text>
                    <TextInput
                      style={styles.miniInput}
                      keyboardType="decimal-pad"
                      placeholder="0"
                      value={minPrice}
                      onChangeText={setMinPrice}
                    />
                  </View>
                  <Text style={styles.miniLabel}>Max. Price</Text>
                  <View style={styles.miniField}>
                    <Text style={styles.dollar}>$</Text>
                    <TextInput
                      style={styles.miniInput}
                      keyboardType="decimal-pad"
                      placeholder="999"
                      value={maxPrice}
                      onChangeText={setMaxPrice}
                    />
                  </View>
                </View>
              </View>
            )}
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <Pressable style={styles.apply} onPress={apply}>
          <Text style={styles.applyText}>Apply Filters</Text>
        </Pressable>
        <Pressable style={styles.reset} onPress={reset}>
          <Text style={styles.resetText}>Reset Filters</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
    minHeight: 56,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  headerIconBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...typography.header,
    fontSize: 18,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  section: {
    marginBottom: 10,
  },
  accordionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.bannerTint,
    borderRadius: radii.card,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
  },
  accordionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  priceBody: {
    marginTop: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  sortCol: {
    flex: 1,
    minWidth: 140,
    gap: 10,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterOn: {
    borderColor: colors.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  radioLabel: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  priceInputs: {
    width: 140,
  },
  miniLabel: {
    ...typography.caption,
    fontWeight: '600',
    marginBottom: 4,
    color: colors.textSecondary,
  },
  miniField: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 8,
    marginBottom: 10,
    backgroundColor: colors.surface,
  },
  dollar: {
    fontWeight: '700',
    color: colors.textSecondary,
  },
  miniInput: {
    flex: 1,
    paddingVertical: 8,
    fontSize: 15,
    color: colors.textPrimary,
  },
  footer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    gap: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  apply: {
    backgroundColor: colors.primary,
    borderRadius: radii.button,
    paddingVertical: 14,
    alignItems: 'center',
  },
  applyText: {
    ...typography.button,
    color: '#FFF',
  },
  reset: {
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: radii.button,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  resetText: {
    ...typography.button,
    color: colors.textPrimary,
  },
});
