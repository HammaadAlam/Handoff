/**
 * Personalization About screen — auth UI.
 */
import { Ionicons } from '@expo/vector-icons';
import { CommonActions, useNavigation, useNavigationState } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import type { RootStackParamList } from '@/navigation/types';
import { fetchViewerPersonalization, saveAboutYou, skipViewerOnboarding } from '@/services/personalization';
import { colors, fonts, radii, spacing } from '@/styles/theme';

const UNIVERSITIES = [
  'Louisiana State University',
  'Southern University',
  'Tulane University',
  'University of Louisiana at Lafayette',
  'Southeastern Louisiana University',
] as const;

const YEARS = ['Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate'] as const;
const GENDERS = ['Female', 'Male', 'Non-binary', 'Prefer not to say'] as const;
const CLOTHING_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'] as const;

type Nav = NativeStackNavigationProp<RootStackParamList>;

function resetToMain(navigation: Nav) {
  navigation.dispatch(
    CommonActions.reset({
      index: 0,
      routes: [{ name: 'Main' }],
    }),
  );
}

function SelectRow({
  label,
  value,
  placeholder,
  options,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  options: readonly string[];
  onChange: (value: string) => void;
}) {
  return (
    <View>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Pressable
        style={styles.selectRow}
        onPress={() =>
          Alert.alert(label, undefined, [
            ...options.map((option) => ({
              text: option,
              onPress: () => onChange(option),
            })),
            { text: 'Cancel', style: 'cancel' },
          ])
        }
      >
        <Text style={value ? styles.selectText : styles.selectPlaceholder}>
          {value || placeholder}
        </Text>
        <Ionicons name="chevron-down" size={18} color={colors.textSecondary} />
      </Pressable>
    </View>
  );
}

export function PersonalizationAboutScreen() {
  const navigation = useNavigation<Nav>();
  const stackIndex = useNavigationState((state) => state?.index ?? 0);
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [university, setUniversity] = useState('');
  const [year, setYear] = useState('');
  const [gender, setGender] = useState('');
  const [clothingSize, setClothingSize] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const data = await fetchViewerPersonalization(user?.id ?? null);
      if (!cancelled && data) {
        setName(data.displayName);
        setUniversity(data.university);
        setYear(data.year);
        setGender(data.gender);
        setClothingSize(data.clothingSize);
        setHeight(data.height);
        setWeight(data.weight);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const canContinue = useMemo(
    () => name.trim().length > 1 && university.trim().length > 0 && year.trim().length > 0 && !busy,
    [name, university, year, busy],
  );

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

  const handleNext = async () => {
    if (!canContinue) {
      Alert.alert('Missing fields', 'Please complete name, university, and year.');
      return;
    }
    setBusy(true);
    try {
      const result = await saveAboutYou(user?.id ?? null, {
        name,
        university,
        year,
        gender,
        clothingSize,
        height,
        weight,
      });
      if (!result.ok) {
        Alert.alert('Could not save', result.message);
        return;
      }
      navigation.navigate('PersonalizationInterests');
    } finally {
      setBusy(false);
    }
  };

  const showBack = stackIndex > 0;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.headerRow}>
        {showBack ? (
          <Pressable
            onPress={() => navigation.goBack()}
            hitSlop={12}
            style={styles.headerSide}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="chevron-back" size={26} color={colors.textPrimary} />
          </Pressable>
        ) : (
          <View style={styles.headerSide} />
        )}
        <View style={styles.progressWrap}>
          <View style={[styles.progressBar, styles.progressBarActive]} />
          <View style={styles.progressBar} />
        </View>
        <Pressable onPress={() => void handleSkip()} hitSlop={12} style={styles.headerSide}>
          <Text style={styles.skipText}>Skip</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Tell us about yourself</Text>
        <Text style={styles.subtitle}>Help us tailor recommendations just for you.</Text>

        <Text style={styles.fieldLabel}>Name</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Enter name..."
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          maxLength={60}
        />

        <SelectRow
          label="University"
          value={university}
          placeholder="Select University"
          options={UNIVERSITIES}
          onChange={setUniversity}
        />

        <SelectRow
          label="Year"
          value={year}
          placeholder="Select Grade"
          options={YEARS}
          onChange={setYear}
        />

        <Text style={styles.optionalTitle}>Optional (helps improve recommendations)</Text>
        <SelectRow
          label="Gender"
          value={gender}
          placeholder="Select Gender"
          options={GENDERS}
          onChange={setGender}
        />
        <SelectRow
          label="Clothing Size"
          value={clothingSize}
          placeholder="Select Size"
          options={CLOTHING_SIZES}
          onChange={setClothingSize}
        />

        <Text style={styles.fieldLabel}>Height</Text>
        <TextInput
          value={height}
          onChangeText={setHeight}
          placeholder={`5'11"`}
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          maxLength={20}
        />

        <Text style={styles.fieldLabel}>Weight</Text>
        <TextInput
          value={weight}
          onChangeText={setWeight}
          placeholder="140 lbs"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          maxLength={20}
        />
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          style={[styles.nextButton, !canContinue && styles.nextButtonDisabled]}
          onPress={() => void handleNext()}
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
  fieldLabel: {
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    fontSize: 15,
    marginBottom: 8,
    marginTop: spacing.sm,
  },
  input: {
    minHeight: 52,
    borderRadius: radii.button,
    borderWidth: 1,
    borderColor: '#ECE8FF',
    backgroundColor: '#F6F3FF',
    color: colors.textPrimary,
    fontFamily: fonts.medium,
    fontSize: 15,
    paddingHorizontal: 14,
  },
  selectRow: {
    minHeight: 52,
    borderRadius: radii.button,
    borderWidth: 1,
    borderColor: '#ECE8FF',
    backgroundColor: '#F6F3FF',
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectText: {
    color: colors.textPrimary,
    fontFamily: fonts.medium,
    fontSize: 15,
  },
  selectPlaceholder: {
    color: colors.textMuted,
    fontFamily: fonts.medium,
    fontSize: 15,
  },
  optionalTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    fontSize: 15,
    alignSelf: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
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
