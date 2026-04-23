/**
 * Quick List review: show generated item details before editing.
 */
import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { OptionPickerModal } from '@/components/create/OptionPickerModal';
import { RemoteImage } from '@/components/RemoteImage';
import {
  SAMPLE_LISTING_PHOTOS,
  mergeCreateListingDraft,
} from '@/data/createListingDraft';
import type { CreateListingDraft } from '@/data/createListingDraft';
import {
  LISTING_BRANDS,
  LISTING_CONDITIONS,
} from '@/data/listingOptions';
import type { CreateListingStackParamList } from '@/navigation/types';
import { colors, fonts, spacing } from '@/styles/theme';

type PickerKind = 'condition' | 'brand' | 'model' | 'storage' | 'color';

const MODEL_OPTIONS = [
  'MacBook Pro M1',
  'MacBook Air',
  'iPad Air',
  'TI-84 Plus',
  'Desk Chair',
  'Mini Fridge',
] as const;

const STORAGE_OPTIONS = ['64GB', '128GB', '256GB', '512GB', '1TB', 'N/A'] as const;

const COLOR_OPTIONS = [
  'Space Gray',
  'Silver',
  'Black',
  'White',
  'Navy',
  'Tan',
  'Multicolor',
] as const;

const AI_DETAIL_PRESETS: Array<
  Pick<
    CreateListingDraft,
    'brand' | 'category' | 'color' | 'condition' | 'model' | 'storage' | 'title'
  >
> = [
  {
    brand: 'Apple',
    category: 'Electronics',
    color: 'Space Gray',
    condition: 'Like New',
    model: 'MacBook Pro M1',
    storage: '256GB',
    title: 'MacBook Pro 13" (M1, 2020)',
  },
  {
    brand: 'Texas Instruments',
    category: 'Electronics',
    color: 'Black',
    condition: 'Good',
    model: 'TI-84 Plus',
    storage: 'N/A',
    title: 'TI-84 Plus Calculator',
  },
  {
    brand: 'Generic / Unbranded',
    category: 'Furniture',
    color: 'Black',
    condition: 'Good',
    model: 'Desk Chair',
    storage: 'N/A',
    title: 'Desk Chair',
  },
  {
    brand: 'Generic / Unbranded',
    category: 'Electronics',
    color: 'White',
    condition: 'Like New',
    model: 'Mini Fridge',
    storage: 'N/A',
    title: 'Mini Fridge',
  },
];

function fillDraftWithRandomDetails(draft: Partial<CreateListingDraft>) {
  const mergedDraft = mergeCreateListingDraft(draft);
  const randomPreset =
    AI_DETAIL_PRESETS[Math.floor(Math.random() * AI_DETAIL_PRESETS.length)];

  return {
    ...mergedDraft,
    brand: mergedDraft.brand || randomPreset.brand,
    category: mergedDraft.category || randomPreset.category,
    color: mergedDraft.color || randomPreset.color,
    condition: mergedDraft.condition || randomPreset.condition,
    model: mergedDraft.model || randomPreset.model,
    storage: mergedDraft.storage || randomPreset.storage,
    title: mergedDraft.title || randomPreset.title,
  };
}

function StepProgress({ active }: { active: number }) {
  return (
    <View style={styles.progressRow}>
      {[1, 2, 3, 4, 5].map((step) => (
        <View
          key={step}
          style={[styles.progressTrack, step <= active && styles.progressTrackActive]}
        />
      ))}
    </View>
  );
}

export function ReviewDetailsScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<CreateListingStackParamList>>();
  const { params } =
    useRoute<RouteProp<CreateListingStackParamList, 'ReviewDetails'>>();
  const draft = useMemo(
    () => fillDraftWithRandomDetails(params?.draft ?? {}),
    [params?.draft],
  );
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);
  const [picker, setPicker] = useState<PickerKind | null>(null);
  const [condition, setCondition] = useState(draft.condition);
  const [brand, setBrand] = useState(draft.brand);
  const [model, setModel] = useState(draft.model);
  const [storage, setStorage] = useState(draft.storage);
  const [color, setColor] = useState(draft.color);
  const previewImageUri = draft.imageUri || SAMPLE_LISTING_PHOTOS[0];
  const summaryTitle = draft.title || 'No title yet';
  const summaryMeta = [model, storage].filter(Boolean).join(' - ');

  const pickerModal = useMemo(() => {
    switch (picker) {
      case 'condition':
        return {
          title: 'Condition',
          options: LISTING_CONDITIONS,
          selected: condition,
          onSelect: setCondition,
        };
      case 'brand':
        return {
          title: 'Brand',
          options: LISTING_BRANDS,
          selected: brand,
          onSelect: setBrand,
        };
      case 'model':
        return {
          title: 'Model',
          options: MODEL_OPTIONS,
          selected: model,
          onSelect: setModel,
        };
      case 'storage':
        return {
          title: 'Storage',
          options: STORAGE_OPTIONS,
          selected: storage,
          onSelect: setStorage,
        };
      case 'color':
        return {
          title: 'Color',
          options: COLOR_OPTIONS,
          selected: color,
          onSelect: setColor,
        };
      default:
        return null;
    }
  }, [picker, brand, color, condition, model, storage]);

  const details: Array<{ key: PickerKind; label: string; value: string }> = [
    { key: 'condition', label: 'Condition', value: condition },
    { key: 'brand', label: 'Brand', value: brand },
    { key: 'model', label: 'Model', value: model },
    { key: 'storage', label: 'Storage', value: storage },
    { key: 'color', label: 'Color', value: color },
  ];

  const updatedDraft = {
    ...draft,
    brand,
    color,
    condition,
    model,
    storage,
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {pickerModal ? (
        <OptionPickerModal
          visible={picker !== null}
          title={pickerModal.title}
          options={pickerModal.options}
          selected={pickerModal.selected}
          onSelect={pickerModal.onSelect}
          onClear={() => undefined}
          onClose={() => setPicker(null)}
        />
      ) : null}

      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Review Details</Text>
          <Text style={styles.stepText}>Step 2 of 5</Text>
        </View>
        <View style={styles.headerSide} />
      </View>

      <StepProgress active={2} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.helper}>We found these details for you.</Text>

        <View style={styles.summaryCard}>
          <RemoteImage uri={previewImageUri} style={styles.summaryImage} />
          <View style={styles.summaryCopy}>
            <Text
              style={styles.summaryTitle}
            >
              {summaryTitle}
            </Text>
            <Text style={styles.summaryMeta}>{summaryMeta}</Text>
            {draft.category ? (
              <View style={styles.categoryPill}>
                <Text style={styles.categoryText}>{draft.category}</Text>
              </View>
            ) : null}
          </View>
        </View>

        <View style={styles.detailsCard}>
          {details.map((detail, index) => (
            <Pressable
              key={detail.key}
              onPress={() => setPicker(detail.key)}
              style={[styles.detailRow, index === details.length - 1 && styles.lastRow]}
            >
              <Text style={styles.detailLabel}>{detail.label}</Text>
              <View style={styles.detailValueWrap}>
                <Text style={styles.detailValue}>{detail.value}</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.primary} />
              </View>
            </Pressable>
          ))}
        </View>

        <View style={styles.feedbackRow}>
          <Text style={styles.feedbackText}>These look right?</Text>
          <Pressable
            accessibilityLabel="Details look right"
            onPress={() => setFeedback('up')}
            style={[styles.feedbackButton, feedback === 'up' && styles.feedbackButtonOn]}
          >
            <Ionicons
              name="thumbs-up-outline"
              size={22}
              color={feedback === 'up' ? colors.primary : colors.textPrimary}
            />
          </Pressable>
          <Pressable
            accessibilityLabel="Details need changes"
            onPress={() => setFeedback('down')}
            style={[styles.feedbackButton, feedback === 'down' && styles.feedbackButtonOn]}
          >
            <Ionicons
              name="thumbs-down-outline"
              size={22}
              color={feedback === 'down' ? colors.primary : colors.textPrimary}
            />
          </Pressable>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          style={styles.primaryButton}
          onPress={() => navigation.navigate('ListingDetails', { mode: 'quick', draft: updatedDraft })}
        >
          <Text style={styles.primaryButtonText}>Next: Edit Details</Text>
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
    paddingHorizontal: spacing.md,
    paddingTop: 8,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    fontSize: 19,
    letterSpacing: -0.2,
  },
  stepText: {
    color: colors.textSecondary,
    fontFamily: fonts.medium,
    fontSize: 12,
    marginTop: 5,
  },
  headerSide: {
    width: 24,
  },
  progressRow: {
    flexDirection: 'row',
    gap: 7,
    paddingHorizontal: 54,
    marginTop: 24,
  },
  progressTrack: {
    flex: 1,
    height: 5,
    borderRadius: 999,
    backgroundColor: colors.border,
  },
  progressTrackActive: {
    backgroundColor: colors.primary,
  },
  content: {
    paddingHorizontal: spacing.md,
    paddingTop: 30,
    paddingBottom: 120,
  },
  helper: {
    color: colors.textPrimary,
    fontFamily: fonts.medium,
    fontSize: 14,
    marginBottom: 18,
    textAlign: 'center',
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    gap: 16,
  },
  summaryImage: {
    width: 86,
    height: 86,
    borderRadius: 6,
  },
  summaryCopy: {
    flex: 1,
  },
  summaryTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    fontSize: 16,
  },
  placeholderText: {
    color: colors.textMuted,
  },
  summaryMeta: {
    color: colors.textSecondary,
    fontFamily: fonts.medium,
    fontSize: 13,
    marginTop: 6,
  },
  categoryPill: {
    alignSelf: 'flex-start',
    borderRadius: 8,
    backgroundColor: '#F1ECFF',
    marginTop: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  categoryText: {
    color: colors.primary,
    fontFamily: fonts.semiBold,
    fontSize: 12,
  },
  detailsCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 18,
    overflow: 'hidden',
  },
  detailRow: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    paddingHorizontal: 16,
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  detailLabel: {
    flex: 1,
    color: colors.textPrimary,
    fontFamily: fonts.medium,
    fontSize: 13,
  },
  detailValueWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 999,
    backgroundColor: '#F7F5FE',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  detailValue: {
    color: colors.primary,
    fontFamily: fonts.medium,
    fontSize: 12,
  },
  feedbackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 24,
  },
  feedbackText: {
    color: colors.textSecondary,
    fontFamily: fonts.medium,
    fontSize: 13,
    marginRight: 2,
  },
  feedbackButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F7F5FE',
  },
  feedbackButtonOn: {
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.md,
    paddingTop: 12,
    paddingBottom: 18,
    backgroundColor: colors.surface,
  },
  primaryButton: {
    minHeight: 52,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  primaryButtonText: {
    color: colors.textInverse,
    fontFamily: fonts.bold,
    fontSize: 15,
  },
});
