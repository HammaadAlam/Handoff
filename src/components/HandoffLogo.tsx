/**
 * Stylized "H" with diagonal sash — matches Handoff brand direction from mockups.
 */
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radii } from '@/styles/theme';

export function HandoffLogo({ size = 120 }: { size?: number }) {
  const fontSize = size * 0.85;
  return (
    <View style={[styles.wrap, { width: size * 1.4, height: size * 1.1 }]}>
      <Text style={[styles.letter, { fontSize, lineHeight: fontSize }]}>H</Text>
      <LinearGradient
        colors={[colors.sash, '#E8D4A8']}
        start={{ x: 0, y: 1 }}
        end={{ x: 1, y: 0 }}
        style={[styles.sash, { width: size * 1.1, height: size * 0.22 }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  letter: {
    fontWeight: '800',
    color: colors.primary,
    zIndex: 2,
  },
  sash: {
    position: 'absolute',
    transform: [{ rotate: '-32deg' }, { translateY: 8 }],
    borderRadius: radii.pill,
    opacity: 0.95,
    zIndex: 1,
  },
});
