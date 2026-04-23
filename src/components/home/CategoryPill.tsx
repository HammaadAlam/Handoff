import type { StyleProp, TextStyle, ViewStyle } from 'react-native';
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, fonts } from '@/styles/theme';

type Props = {
  active?: boolean;
  label: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

export function CategoryPill({
  active = false,
  label,
  onPress,
  style,
  textStyle,
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        style,
        active && styles.active,
        pressed && styles.pressed,
      ]}
    >
      <Text
        numberOfLines={1}
        style={[styles.text, textStyle, active && styles.textActive]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: '#F4F5F8',
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#101828',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 2,
  },
  active: {
    backgroundColor: colors.primaryLight,
    shadowColor: colors.primaryLight,
    shadowOpacity: 0.18,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
  text: {
    color: colors.textPrimary,
    fontFamily: fonts.semiBold,
    fontSize: 13,
  },
  textActive: {
    color: colors.textInverse,
  },
});
