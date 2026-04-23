import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, fonts } from '@/styles/theme';

type Props = {
  label: string;
  onPress?: () => void;
};

export function SearchChip({ label, onPress }: Props) {
  return (
    <Pressable onPress={onPress} style={styles.chip}>
      <Ionicons name="search-outline" size={12} color={colors.primary} />
      <Text style={styles.label} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    height: 28,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    borderRadius: 14,
    backgroundColor: '#F4F0FF',
  },
  label: {
    fontFamily: fonts.medium,
    fontSize: 11,
    lineHeight: 14,
    color: colors.primary,
    textTransform: 'lowercase',
  },
});
