/**
 * Welcome / landing — Handoff mark, intro copy, Login + Sign Up CTAs.
 */
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppLogo } from '@/components/AppLogo';
import { useAuth } from '@/context/AuthContext';
import type { RootStackParamList } from '@/navigation/types';
import { authColors, authRadius, authStyles } from '@/screens/auth/authTheme';
import { spacing, typography } from '@/styles/theme';

type Nav = NativeStackNavigationProp<RootStackParamList>;

/** Dev / optional env: show "Skip login" on Welcome */
const SHOW_AUTH_BYPASS =
  (typeof __DEV__ !== 'undefined' && __DEV__) ||
  process.env.EXPO_PUBLIC_ENABLE_AUTH_BYPASS === '1';

export function WelcomeScreen() {
  const navigation = useNavigation<Nav>();
  const { enableAuthBypass } = useAuth();

  return (
    <SafeAreaView style={authStyles.safe} edges={['top', 'bottom']}>
      <View style={styles.content}>
        <View style={styles.brand}>
          <AppLogo width={140} height={140} />
          <Text style={styles.title}>Welcome to{'\n'}Handoff</Text>
        </View>

        <Text style={styles.copy}>
          Buy and exchange items securely with verified students. Discover
          affordable furniture, textbooks, electronics, clothing, and more on
          campus.
        </Text>

        <View style={styles.actions}>
          <Pressable
            style={({ pressed }) => [
              authStyles.primaryBtn,
              pressed && authStyles.primaryBtnPressed,
            ]}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={authStyles.primaryBtnText}>Login</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.secondaryBtn,
              pressed && styles.secondaryBtnPressed,
            ]}
            onPress={() => navigation.navigate('SignUp')}
          >
            <Text style={styles.secondaryBtnText}>Sign Up</Text>
          </Pressable>

          {SHOW_AUTH_BYPASS ? (
            <Pressable
              style={({ pressed }) => [styles.bypassBtn, pressed && styles.bypassBtnPressed]}
              onPress={() => void enableAuthBypass()}
              hitSlop={12}
            >
              <Text style={styles.bypassText}>Skip login (testing)</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl,
    alignItems: 'center',
  },
  brand: {
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  title: {
    ...typography.title,
    fontSize: 30,
    color: authColors.text,
    textAlign: 'center',
    marginTop: spacing.lg,
    lineHeight: 36,
  },
  copy: {
    ...typography.subtitle,
    color: authColors.textMuted,
    textAlign: 'center',
    marginTop: spacing.lg,
    paddingHorizontal: spacing.sm,
  },
  actions: {
    width: '100%',
    marginTop: 'auto',
    gap: spacing.md,
  },
  secondaryBtn: {
    backgroundColor: authColors.surface,
    borderWidth: 1,
    borderColor: authColors.inputBorder,
    borderRadius: authRadius,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  secondaryBtnPressed: {
    opacity: 0.85,
  },
  secondaryBtnText: {
    ...typography.button,
    color: authColors.text,
    fontSize: 16,
  },
  bypassBtn: {
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  bypassBtnPressed: {
    opacity: 0.7,
  },
  bypassText: {
    fontSize: 13,
    fontWeight: '600',
    color: authColors.textMuted,
    textDecorationLine: 'underline',
  },
});
