import { Platform, Pressable, StyleSheet, Text } from 'react-native';
import { fonts, typography } from '@/styles/theme';

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
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 18,
    backgroundColor: 'transparent',
    marginRight: 12,
  },
  active: {
    backgroundColor: '#7B6FF6',
  },
  text: {
    ...typography.caption,
    fontSize: 15,
    fontFamily: fonts.semiBold,
    color: '#17213C',
    flexShrink: 0,
    ...(Platform.OS === 'android' ? { includeFontPadding: false } : {}),
  },
  textActive: {
    color: '#FFFFFF',
  },
});
