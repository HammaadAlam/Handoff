/**
 * Set listing price.
 */
import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { mergeCreateListingDraft } from '@/data/createListingDraft';
import type { CreateListingStackParamList } from '@/navigation/types';
import { colors, fonts, spacing } from '@/styles/theme';

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

export function SetPriceScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<CreateListingStackParamList>>();
  const { params } = useRoute<RouteProp<CreateListingStackParamList, 'SetPrice'>>();
  const draft = mergeCreateListingDraft(params?.draft);
  const [price, setPrice] = useState(draft.price);

  const continueFlow = () => {
    navigation.navigate('PickupLocation', {
      draft: {
        ...draft,
        price: price.trim() || draft.price,
      },
    });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Set Price</Text>
          <Text style={styles.stepText}>Step 4 of 5</Text>
        </View>
        <View style={styles.headerSide} />
      </View>

      <StepProgress active={4} />

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.suggestCard}>
          <View style={styles.suggestHeader}>
            <Text style={styles.cardLabel}>Suggested Price</Text>
            <Ionicons name="sparkles" size={24} color={colors.primary} />
          </View>
          <Text style={[styles.suggestedPrice, !draft.price && styles.emptyPrice]}>
            {draft.price ? `$${draft.price}` : '--'}
          </Text>
          <View style={styles.basedRow}>
            <Text style={styles.basedText}>Based on similar listings</Text>
            <Ionicons name="information-circle-outline" size={14} color={colors.textMuted} />
          </View>
        </View>

        <Text style={styles.label}>Your Price</Text>
        <View style={styles.priceInputWrap}>
          <Text style={styles.dollar}>$</Text>
          <TextInput
            keyboardType="number-pad"
            onChangeText={setPrice}
            placeholder="0"
            placeholderTextColor={colors.textMuted}
            style={styles.priceInput}
            value={price}
          />
        </View>

        <View style={styles.tipsCard}>
          <View style={styles.tipsHeader}>
            <Text style={styles.tipsTitle}>Pricing tips</Text>
            <Ionicons name="trending-up-outline" size={22} color={colors.primary} />
          </View>
          {[
            'Competitive prices sell faster',
            'You can always lower later',
            'Similar items range $680 - $820',
          ].map((tip) => (
            <View key={tip} style={styles.tipRow}>
              <Ionicons name="add" size={14} color={colors.primary} />
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable style={styles.primaryButton} onPress={continueFlow}>
          <Text style={styles.primaryButtonText}>Next: Meet Up</Text>
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
    paddingTop: 26,
    paddingBottom: 120,
  },
  suggestCard: {
    borderRadius: 14,
    backgroundColor: '#F8F7FC',
    padding: 16,
    marginBottom: 22,
  },
  suggestHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardLabel: {
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    fontSize: 14,
  },
  suggestedPrice: {
    color: colors.primary,
    fontFamily: fonts.medium,
    fontSize: 32,
    letterSpacing: 2,
    marginTop: 12,
  },
  emptyPrice: {
    color: colors.textMuted,
  },
  basedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  basedText: {
    color: colors.textSecondary,
    fontFamily: fonts.medium,
    fontSize: 12,
  },
  label: {
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    fontSize: 14,
    marginBottom: 8,
  },
  priceInputWrap: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
  },
  dollar: {
    color: colors.textPrimary,
    fontFamily: fonts.medium,
    fontSize: 20,
    marginRight: 14,
  },
  priceInput: {
    flex: 1,
    color: colors.textPrimary,
    fontFamily: fonts.medium,
    fontSize: 20,
  },
  tipsCard: {
    borderRadius: 14,
    backgroundColor: '#F8F7FC',
    marginTop: 24,
    padding: 16,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  tipsTitle: {
    color: colors.primary,
    fontFamily: fonts.bold,
    fontSize: 15,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 10,
  },
  tipText: {
    color: colors.textSecondary,
    fontFamily: fonts.medium,
    fontSize: 13,
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
