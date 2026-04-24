/**
 * Single combined "Details" step — merges the previous review + edit screens into
 * one form so sellers only touch listing metadata once before continuing to pricing.
 */
import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { OptionPickerModal } from '@/components/create/OptionPickerModal';
import { mergeCreateListingDraft } from '@/data/createListingDraft';
import {
  getListingAttributesForCategory,
  LISTING_BRANDS,
  LISTING_CATEGORIES,
  LISTING_CONDITIONS,
} from '@/data/listingOptions';
import type { CreateListingStackParamList } from '@/navigation/types';
import { colors, fonts, spacing } from '@/styles/theme';

type PickerKind =
  | 'category'
  | 'condition'
  | 'brand'
  | 'model'
  | 'storage'
  | 'color';

const TOTAL_STEPS = 4;

function StepProgress({ active }: { active: number }) {
  return (
    <View style={styles.progressRow}>
      {Array.from({ length: TOTAL_STEPS }).map((_, index) => {
        const step = index + 1;
        return (
          <View
            key={step}
            style={[
              styles.progressTrack,
              step <= active && styles.progressTrackActive,
            ]}
          />
        );
      })}
    </View>
  );
}

export function ListingDetailsScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<CreateListingStackParamList>>();
  const { params } =
    useRoute<RouteProp<CreateListingStackParamList, 'ListingDetails'>>();
  const startingDraft = mergeCreateListingDraft({
    ...params?.draft,
    imageUri: params?.capturedImageUri ?? params?.draft?.imageUri,
  });

  const [title, setTitle] = useState(startingDraft.title);
  const [description, setDescription] = useState(startingDraft.description);
  const [category, setCategory] = useState(startingDraft.category);
  const [condition, setCondition] = useState(startingDraft.condition);
  const [brand, setBrand] = useState(startingDraft.brand);
  const [model, setModel] = useState(startingDraft.model);
  const [storage, setStorage] = useState(startingDraft.storage);
  const [color, setColor] = useState(startingDraft.color);
  const [acceptOffers, setAcceptOffers] = useState(startingDraft.acceptOffers);
  const [picker, setPicker] = useState<PickerKind | null>(null);
  const categoryAttributes = useMemo(
    () => getListingAttributesForCategory(category),
    [category],
  );
  const attributeByKey = useMemo(
    () => Object.fromEntries(categoryAttributes.map((attr) => [attr.key, attr])),
    [categoryAttributes],
  );

  useEffect(() => {
    if (!attributeByKey.brand && brand) setBrand('');
    if (!attributeByKey.model && model) setModel('');
    if (!attributeByKey.storage && storage) setStorage('');
    if (!attributeByKey.color && color) setColor('');
  }, [attributeByKey, brand, model, storage, color]);

  const pickerModal = useMemo(() => {
    switch (picker) {
      case 'category':
        return {
          title: 'Category',
          options: LISTING_CATEGORIES,
          selected: category,
          onSelect: setCategory,
        };
      case 'condition':
        return {
          title: 'Condition',
          options: LISTING_CONDITIONS,
          selected: condition,
          onSelect: setCondition,
        };
      case 'brand':
        if (!attributeByKey.brand) return null;
        return {
          title: attributeByKey.brand.label,
          options: attributeByKey.brand.options.length
            ? attributeByKey.brand.options
            : LISTING_BRANDS,
          selected: brand,
          onSelect: setBrand,
        };
      case 'model':
        if (!attributeByKey.model) return null;
        return {
          title: attributeByKey.model.label,
          options: attributeByKey.model.options,
          selected: model,
          onSelect: setModel,
        };
      case 'storage':
        if (!attributeByKey.storage) return null;
        return {
          title: attributeByKey.storage.label,
          options: attributeByKey.storage.options,
          selected: storage,
          onSelect: setStorage,
        };
      case 'color':
        if (!attributeByKey.color) return null;
        return {
          title: attributeByKey.color.label,
          options: attributeByKey.color.options,
          selected: color,
          onSelect: setColor,
        };
      default:
        return null;
    }
  }, [picker, brand, category, color, condition, model, storage, attributeByKey]);

  const canContinue =
    title.trim().length > 0 &&
    category.trim().length > 0 &&
    condition.trim().length > 0;

  const continueFlow = () => {
    if (!canContinue) return;
    navigation.navigate('SetPrice', {
      draft: {
        ...startingDraft,
        acceptOffers,
        brand,
        category,
        color,
        condition,
        description,
        model,
        storage,
        title,
      },
    });
  };

  const rows: Array<{
    key: PickerKind;
    label: string;
    value: string;
    required?: boolean;
  }> = [
    { key: 'category', label: 'Category', value: category, required: true },
    { key: 'condition', label: 'Condition', value: condition, required: true },
    ...categoryAttributes.map((attribute) => ({
      key: attribute.key,
      label: attribute.label,
      value:
        attribute.key === 'brand'
          ? brand
          : attribute.key === 'model'
            ? model
            : attribute.key === 'storage'
              ? storage
              : color,
    })),
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {pickerModal ? (
        <OptionPickerModal
          visible={picker !== null}
          title={pickerModal.title}
          options={pickerModal.options}
          selected={pickerModal.selected}
          onSelect={(value) => {
            pickerModal.onSelect(value);
            setPicker(null);
          }}
          onClear={() => undefined}
          onClose={() => setPicker(null)}
        />
      ) : null}

      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Listing Details</Text>
          <Text style={styles.stepText}>Step 2 of {TOTAL_STEPS}</Text>
        </View>
        <View style={styles.headerSide} />
      </View>

      <StepProgress active={2} />

      <View style={styles.body}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.label}>
            Title <Text style={styles.requiredMarker}>*</Text>
          </Text>
          <TextInput
            maxLength={60}
            onChangeText={setTitle}
            placeholder="What are you selling?"
            placeholderTextColor={colors.textMuted}
            style={styles.input}
            value={title}
          />
          <Text style={styles.count}>{title.length}/60</Text>

          <Text style={styles.label}>Description</Text>
          <TextInput
            maxLength={300}
            multiline
            onChangeText={setDescription}
            placeholder="Add condition notes, accessories, and anything buyers should know."
            placeholderTextColor={colors.textMuted}
            style={[styles.input, styles.textArea]}
            textAlignVertical="top"
            value={description}
          />
          <Text style={styles.count}>{description.length}/300</Text>

          <View style={styles.rows}>
            {rows.map((row) => {
              const isSelected = !!row.value;
              return (
                <Pressable
                  key={row.key}
                  onPress={() => setPicker(row.key)}
                  style={styles.detailRow}
                >
                  <Text style={styles.rowLabel}>
                    {row.label}
                    {row.required ? (
                      <Text style={styles.requiredMarker}> *</Text>
                    ) : null}
                  </Text>
                  <View style={styles.rowValueWrap}>
                    <Text
                      style={[
                        styles.rowValue,
                        !row.value && styles.rowPlaceholder,
                      ]}
                    >
                      {row.value || 'Select'}
                    </Text>
                    {!isSelected ? (
                      <Ionicons
                        name="chevron-forward"
                        size={18}
                        color={colors.textPrimary}
                      />
                    ) : (
                      <Ionicons
                        name="checkmark"
                        size={18}
                        color={colors.primary}
                      />
                    )}
                  </View>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.offerRow}>
            <View style={styles.offerCopy}>
              <Text style={styles.rowLabel}>Accept offers</Text>
              <Text style={styles.offerHint}>Let buyers send you offers</Text>
            </View>
            <Switch
              onValueChange={setAcceptOffers}
              thumbColor={colors.surface}
              trackColor={{ false: colors.border, true: colors.primary }}
              value={acceptOffers}
            />
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Pressable
            style={[
              styles.primaryButton,
              !canContinue && styles.primaryButtonDisabled,
            ]}
            onPress={continueFlow}
            disabled={!canContinue}
          >
            <Text style={styles.primaryButtonText}>Next: Price</Text>
          </Pressable>
        </View>
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
  body: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.md,
    paddingTop: 30,
    paddingBottom: spacing.lg,
  },
  label: {
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    fontSize: 14,
    marginBottom: 8,
  },
  requiredMarker: {
    color: colors.error,
  },
  input: {
    minHeight: 54,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.textPrimary,
    fontFamily: fonts.medium,
    fontSize: 15,
    paddingHorizontal: 16,
  },
  textArea: {
    minHeight: 104,
    paddingTop: 16,
    lineHeight: 21,
  },
  count: {
    color: colors.textSecondary,
    fontFamily: fonts.medium,
    fontSize: 11,
    marginTop: 7,
    marginBottom: 18,
    textAlign: 'right',
  },
  rows: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  detailRow: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  rowLabel: {
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    fontSize: 13,
  },
  rowValueWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rowValue: {
    color: colors.textPrimary,
    fontFamily: fonts.medium,
    fontSize: 13,
  },
  rowPlaceholder: {
    color: colors.textMuted,
  },
  offerRow: {
    minHeight: 62,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  offerCopy: {
    flex: 1,
  },
  offerHint: {
    color: colors.textSecondary,
    fontFamily: fonts.medium,
    fontSize: 12,
    marginTop: 4,
  },
  footer: {
    paddingHorizontal: spacing.md,
    paddingTop: 12,
    paddingBottom: 18,
    backgroundColor: colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  primaryButton: {
    minHeight: 52,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  primaryButtonDisabled: {
    opacity: 0.45,
  },
  primaryButtonText: {
    color: colors.textInverse,
    fontFamily: fonts.bold,
    fontSize: 15,
  },
});
