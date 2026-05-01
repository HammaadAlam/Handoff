/**
 * Personalization Interests screen — auth UI.
 */
import { Ionicons } from '@expo/vector-icons';
import { CommonActions, useNavigation, useNavigationState } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import type { RootStackParamList } from '@/navigation/types';
import {
  fetchViewerPersonalization,
  PERSONALIZATION_INTEREST_OPTIONS,
  saveViewerInterests,
  skipViewerOnboarding,
} from '@/services/personalization';
import { colors, fonts, radii, spacing } from '@/styles/theme';

const INTEREST_ICON: Record<string, string> = {
  Textbooks: '📚',
  'School Supplies': '✏️',
  Electronics: '💻',
  Sports: '🏀',
  Clothes: '🧥',
  'Beauty & Style': '💄',
  Music: '🎵',
  Art: '🎨',
  Food: '🍕',
  Gaming: '🎮',
  Baking: '🎂',
};

type Nav = NativeStackNavigationProp<RootStackParamList>;

function resetToMain(navigation: Nav) {
  navigation.dispatch(
    CommonActions.reset({
      index: 0,
      routes: [{ name: 'Main' }],
    }),
  );
}

export function PersonalizationInterestsScreen() {
  const navigation = useNavigation<Nav>();
  const stackIndex = useNavigationState((state) => state?.index ?? 0);
  const { user } = useAuth();
  const [selected, setSelected] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const data = await fetchViewerPersonalization(user?.id ?? null);
      if (!cancelled && data?.interests?.length) {
        setSelected(data.interests);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const canContinue = useMemo(() => selected.length > 0 && !busy, [selected, busy]);

  const toggleInterest = (value: string) => {
    setSelected((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value],
    );
  };

  const handleBack = () => {
    if (stackIndex > 0) {
      navigation.goBack();
      return;
    }
    navigation.navigate('PersonalizationAbout');
  };

  const handleSkip = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const result = await skipViewerOnboarding(user?.id ?? null);
      if (!result.ok) {
        Alert.alert('Could not save', result.message);
        return;
      }
      resetToMain(navigation);
    } finally {
      setBusy(false);
    }
  };

  const handleDone = async () => {
    if (!canContinue) {
      Alert.alert('Choose interests', 'Select at least one interest to continue.');
      return;
    }
    setBusy(true);
    try {
      const result = await saveViewerInterests(user?.id ?? null, selected);
      if (!result.ok) {
        Alert.alert('Could not save', result.message);
        return;
      }
      resetToMain(navigation);
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.headerRow}>
        <Pressable
          onPress={handleBack}
          hitSlop={12}
          style={styles.headerSide}
          accessibilityRole="button"
          accessibilityLabel="Back to previous step"
        >
          <Ionicons name="chevron-back" size={26} color={colors.textPrimary} />
        </Pressable>
        <View style={styles.progressWrap}>
          <View style={[styles.progressBar, styles.progressBarActive]} />
          <View style={[styles.progressBar, styles.progressBarActive]} />
        </View>
        <Pressable onPress={() => void handleSkip()} hitSlop={12} style={styles.headerSide}>
          <Text style={styles.skipText}>Skip</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Choose your interests</Text>
        <Text style={styles.subtitle}>Get personalized item recommendations.</Text>

        <View style={styles.grid}>
          {PERSONALIZATION_INTEREST_OPTIONS.map((interest) => {
            const active = selected.includes(interest);
            return (
              <Pressable
                key={interest}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => toggleInterest(interest)}
              >
                <Text style={styles.chipIcon}>{INTEREST_ICON[interest] ?? '✨'}</Text>
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{interest}</Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          style={[styles.nextButton, !canContinue && styles.nextButtonDisabled]}
          onPress={() => void handleDone()}
          disabled={!canContinue}
        >
          <Text style={styles.nextButtonText}>Next</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.sm,
    gap: spacing.sm,
  },
  headerSide: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressWrap: { flexDirection: 'row', gap: 8, flex: 1 },
  progressBar: {
    flex: 1,
    height: 5,
    borderRadius: 999,
    backgroundColor: colors.border,
  },
  progressBarActive: { backgroundColor: colors.primary },
  skipText: {
    color: colors.textMuted,
    fontFamily: fonts.semiBold,
    fontSize: 15,
  },
  content: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  title: {
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    fontSize: 26,
    lineHeight: 32,
    letterSpacing: -0.35,
  },
  subtitle: {
    color: colors.textSecondary,
    fontFamily: fonts.medium,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 6,
    marginBottom: spacing.lg,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    minHeight: 52,
    borderRadius: radii.button,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.primaryLight,
    backgroundColor: colors.surface,
    gap: 8,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipIcon: {
    fontSize: 18,
  },
  chipText: {
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    fontSize: 15,
    lineHeight: 20,
  },
  chipTextActive: {
    color: colors.textInverse,
  },
  footer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  nextButton: {
    minHeight: 52,
    borderRadius: radii.button,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonDisabled: { opacity: 0.45 },
  nextButtonText: {
    color: colors.textInverse,
    fontFamily: fonts.bold,
    fontSize: 15,
    letterSpacing: 0,
  },
});
