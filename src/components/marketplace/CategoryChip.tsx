import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, radii, typography } from '@/styles/theme';

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
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  textActive: {
    color: '#FFFFFF',
  },
});
