/**
 * Primary (filled purple gradient) and secondary (outlined) actions.
 * Uses Pressable only — avoids Reanimated issues in Expo Go.
 */
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, radii, shadows, typography } from '@/styles/theme';

type Props = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  /** Narrow width for auth CTAs like mockups */
  narrow?: boolean;
  disabled?: boolean;
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  narrow = false,
  disabled = false,
}: Props) {
  if (variant === 'primary') {
    return (
      <Pressable
        onPress={onPress}
        disabled={disabled}
        style={({ pressed }) => [
          styles.row,
          narrow && styles.narrow,
          pressed && !disabled && { opacity: 0.92 },
        ]}
      >
        <LinearGradient
          colors={[colors.gradientStart, colors.gradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.primaryFill, disabled && styles.disabledFill]}
        >
          <Text style={styles.primaryText}>{label}</Text>
        </LinearGradient>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.row,
        narrow && styles.narrow,
        styles.secondaryOuter,
        disabled && styles.disabledBorder,
        pressed && !disabled && { opacity: 0.92 },
      ]}
    >
      <Text style={styles.secondaryText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    width: '100%',
    alignSelf: 'stretch',
  },
  narrow: {
    alignSelf: 'center',
    width: '72%',
    maxWidth: 280,
  },
  primaryFill: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: radii.button,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.button,
  },
  disabledFill: {
    opacity: 0.5,
  },
  primaryText: {
    ...typography.button,
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  secondaryOuter: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: radii.button,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
  },
  disabledBorder: {
    opacity: 0.5,
  },
  secondaryText: {
    ...typography.button,
    color: colors.textPrimary,
    fontWeight: '600',
  },
});
