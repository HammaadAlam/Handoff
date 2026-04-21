import { Platform, Pressable, StyleSheet, Text } from 'react-native';
import { fonts, colors, radii, typography } from '@/styles/theme';

type Props = {
  label: string;
  active?: boolean;
  onPress?: () => void;
};

export function CategoryChip({ label, active, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.base, active && styles.active]}
    >
      <Text style={[styles.text, active && styles.textActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexShrink: 0,
    flexGrow: 0,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radii.button,
    backgroundColor: colors.surface,
    marginRight: 8,
  },
  active: {
    backgroundColor: colors.primary,
  },
  text: {
    ...typography.caption,
    fontSize: 13,
    fontFamily: fonts.semiBold,
    color: colors.textPrimary,
    flexShrink: 0,
    ...(Platform.OS === 'android' ? { includeFontPadding: false } : {}),
  },
  textActive: {
    color: '#FFFFFF',
  },
});
