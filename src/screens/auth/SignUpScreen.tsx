/**
 * Sign Up — pill inputs, .edu check, password rules + match check, optional username.
 */
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthFooter } from '@/components/auth/AuthFooter';
import { PillInput } from '@/components/auth/PillInput';
import { useAuth } from '@/context/AuthContext';
import { AUTH_SIGNUP_HERO } from '@/images/authAssets';
import type { RootStackParamList } from '@/navigation/types';
import { authColors, authStyles, authScreenStyles } from '@/screens/auth/authTheme';
import { fonts, spacing, typography } from '@/styles/theme';
import {
  EDU_EMAIL_REQUIRED_MESSAGE,
  eduEmailInlineHint,
  isEduEmail,
} from '@/utils/eduEmail';

type Nav = NativeStackNavigationProp<RootStackParamList>;

type Rule = { label: string; ok: boolean };

function passwordRules(pw: string): Rule[] {
  return [
    { label: 'at least 8 characters', ok: pw.length >= 8 },
    { label: 'a letter', ok: /[A-Za-z]/.test(pw) },
    { label: 'a digit', ok: /\d/.test(pw) },
  ];
}

function authErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return 'Something went wrong. Try again.';
}

export function SignUpScreen() {
  const navigation = useNavigation<Nav>();
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);

  const emailHint = eduEmailInlineHint(email);
  const rules = useMemo(() => passwordRules(password), [password]);
  const passwordOk = rules.every((r) => r.ok);
  const matchOk = confirm.length === 0 || confirm === password;

  const canSubmit =
    !busy &&
    email.trim().length > 0 &&
    !emailHint &&
    passwordOk &&
    confirm === password &&
    confirm.length > 0;

  const onSubmit = async () => {
    if (!email.trim() || !password || !confirm) {
      Alert.alert('Missing fields', 'Fill in every field to continue.');
      return;
    }
    if (!isEduEmail(email)) {
      Alert.alert('School email required', emailHint ?? EDU_EMAIL_REQUIRED_MESSAGE);
      return;
    }
    if (!passwordOk) {
      Alert.alert('Password is too weak', 'Match the password requirements below.');
      return;
    }
    if (confirm !== password) {
      Alert.alert('Passwords don\u2019t match', 'Re-type the same password.');
      return;
    }
    setBusy(true);
    try {
      const { needsEmailConfirmation } = await signUp(email, password);
      if (needsEmailConfirmation) {
        Alert.alert(
          'Check your email',
          'We sent a confirmation link. Open it, then come back to log in.'
        );
        navigation.navigate('Login');
      }
    } catch (e) {
      Alert.alert('Sign up failed', authErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={authScreenStyles.screenFill}>
        <View style={styles.column}>
          <ScrollView
            style={styles.scroll}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardDismissMode="on-drag"
            automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
          >
            <Image
              source={AUTH_SIGNUP_HERO}
              style={styles.hero}
              contentFit="contain"
              accessibilityIgnoresInvertColors
            />
            <Text style={styles.title}>Sign Up</Text>
            <Text style={styles.subtitle}>
              Use your school email and details to continue.
            </Text>

            <PillInput
              icon="mail-outline"
              placeholder="Enter valid .edu email"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              autoComplete="email"
              textContentType="username"
              value={email}
              onChangeText={setEmail}
              editable={!busy}
              containerStyle={
                emailHint ? [styles.inputSpacing, styles.inputError] : styles.inputSpacing
              }
            />
            {emailHint ? <Text style={styles.fieldError}>{emailHint}</Text> : null}

            <PillInput
              icon="person-outline"
              placeholder="Username"
              autoCapitalize="none"
              autoCorrect={false}
              value={username}
              onChangeText={setUsername}
              editable={!busy}
              containerStyle={styles.inputSpacing}
            />

            <PillInput
              icon="lock-closed-outline"
              placeholder="Password"
              secureTextEntry
              autoComplete="password-new"
              textContentType="newPassword"
              value={password}
              onChangeText={setPassword}
              editable={!busy}
              containerStyle={styles.inputSpacing}
            />

            <Text style={styles.rulesOneLine}>
              <Text style={styles.rulesPrefix}>Password must have </Text>
              {rules.map((r, i) => (
                <Text
                  key={r.label}
                  style={r.ok ? styles.ruleSegmentOk : styles.ruleSegmentPending}
                >
                  {i > 0 ? '; ' : ''}
                  {r.label}
                </Text>
              ))}
              {'.'}
            </Text>

            <PillInput
              icon="lock-closed-outline"
              placeholder="re-type password"
              secureTextEntry
              autoComplete="password-new"
              textContentType="newPassword"
              value={confirm}
              onChangeText={setConfirm}
              editable={!busy}
              containerStyle={
                !matchOk
                  ? [styles.inputSpacing, styles.inputError]
                  : styles.inputSpacing
              }
            />
            <Text style={[styles.matchHint, !matchOk && styles.matchHintError]}>
              {matchOk ? 'Passwords must match' : 'Passwords don\u2019t match'}
            </Text>

            <View style={styles.bottomActions}>
              <Pressable
                style={({ pressed }) => [
                  authStyles.primaryBtn,
                  pressed && authStyles.primaryBtnPressed,
                  !canSubmit && authStyles.primaryBtnDisabled,
                ]}
                onPress={() => void onSubmit()}
                disabled={!canSubmit}
              >
                {busy ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={authStyles.primaryBtnText}>Create Account</Text>
                )}
              </Pressable>

              <View style={styles.altRow}>
                <Text style={styles.altMuted}>Already have an account? </Text>
                <Pressable onPress={() => navigation.navigate('Login')} hitSlop={8}>
                  <Text style={styles.altLink}>Log in</Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>

          <AuthFooter />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: authColors.surface,
  },
  column: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
  },
  hero: {
    width: '100%',
    height: 220,
    marginBottom: spacing.sm,
    alignSelf: 'center',
  },
  title: {
    ...typography.title,
    fontSize: 26,
    color: authColors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.subtitle,
    fontSize: 15,
    lineHeight: 22,
    color: authColors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.xs,
  },
  inputSpacing: {
    marginBottom: spacing.sm,
  },
  inputError: {
    borderColor: authColors.error,
  },
  fieldError: {
    fontSize: 12,
    color: authColors.error,
    marginTop: -spacing.xs,
    marginBottom: spacing.sm,
    marginLeft: spacing.md,
  },
  rulesOneLine: {
    fontSize: 12,
    lineHeight: 17,
    color: authColors.textMuted,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
    marginRight: spacing.xs,
  },
  rulesPrefix: {
    color: authColors.textMuted,
  },
  ruleSegmentPending: {
    color: authColors.textMuted,
  },
  ruleSegmentOk: {
    color: '#16A34A',
  },
  matchHint: {
    fontSize: 12,
    color: authColors.textMuted,
    marginTop: -spacing.xs,
    marginBottom: 0,
    marginLeft: spacing.md,
  },
  matchHintError: {
    color: authColors.error,
  },
  bottomActions: {
    paddingTop: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  altRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  altMuted: {
    fontSize: 14,
    color: authColors.textMuted,
  },
  altLink: {
    fontSize: 14,
    color: authColors.link,
    fontFamily: fonts.bold,
  },
});
