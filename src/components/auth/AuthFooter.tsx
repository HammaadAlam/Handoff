/**
 * Bottom Privacy Policy / Terms of Service strip used on auth screens.
 */
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { authColors } from '@/screens/auth/authTheme';
import { spacing } from '@/styles/theme';

export function AuthFooter() {
  return (
    <View style={styles.row}>
      <Pressable hitSlop={8} onPress={() => Alert.alert('Privacy Policy', 'Coming soon.')}>
        <Text style={styles.text}>Privacy Policy</Text>
      </Pressable>
      <View style={styles.gap} />
      <Pressable hitSlop={8} onPress={() => Alert.alert('Terms of Service', 'Coming soon.')}>
        <Text style={styles.text}>Terms of Service</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  gap: {
    width: spacing.lg,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
    color: authColors.primary,
  },
});
