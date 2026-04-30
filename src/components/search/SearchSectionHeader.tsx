/**
 * Search Section Header — UI component.
 */
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '@/styles/theme';

type Props = {
  title: string;
  actionLabel?: string;
  onPressAction?: () => void;
};

export function SearchSectionHeader({
  title,
  actionLabel = 'See All',
  onPressAction,
}: Props) {
  return (
    <View style={styles.row}>
      <Text style={styles.title}>{title}</Text>
      {onPressAction ? (
        <Pressable hitSlop={8} onPress={onPressAction}>
          <Text style={styles.action}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 12,
  },
  title: {
    flex: 1,
    minWidth: 0,
    fontFamily: fonts.bold,
    fontSize: 18,
    lineHeight: 23,
    color: colors.textPrimary,
  },
  action: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    lineHeight: 17,
    color: colors.primary,
  },
});
