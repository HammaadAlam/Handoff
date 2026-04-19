/**
 * Tab labels that shrink to fit (avoids "Ho…", "Sear…" truncation with wide fonts like Poppins).
 */
import { Platform, StyleSheet, Text, View } from 'react-native';
import { fonts } from '@/styles/theme';

type Props = {
  focused: boolean;
  color: string;
  position: 'beside-icon' | 'below-icon';
  children: string;
};

export function CompactTabBarLabel({ color, children }: Props) {
  return (
    <View style={styles.wrap}>
      <Text
        allowFontScaling={false}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={Platform.OS === 'ios' ? 0.68 : 0.78}
        ellipsizeMode="clip"
        style={[styles.text, { color }]}
      >
        {children}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    minWidth: 0,
    alignItems: 'center',
    paddingHorizontal: 1,
  },
  text: {
    fontFamily: fonts.medium,
    fontSize: 11,
    lineHeight: 13,
    textAlign: 'center',
    width: '100%',
  },
});
