/**
 * Sign Up — pill inputs, .edu check, password rules + match check, optional username.
 */
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthFooter } from '@/components/auth/AuthFooter';
import { PillInput } from '@/components/auth/PillInput';
import { useAuth } from '@/context/AuthContext';
import type { RootStackParamList } from '@/navigation/types';
import { authColors, authStyles } from '@/screens/auth/authTheme';
import { spacing, typography } from '@/styles/theme';
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
    <SafeAreaView style={authStyles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>Sign Up</Text>

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
            containerStyle={emailHint ? styles.inputError : undefined}
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
          />

          <View style={styles.rules}>
            <Text style={styles.rulesTitle}>Must Contain:</Text>
            {rules.map((r) => (
              <Text
                key={r.label}
                style={[styles.ruleItem, r.ok && styles.ruleItemOk]}
              >
                {'\u2022'} {r.label}
              </Text>
            ))}
          </View>

          <PillInput
            icon="lock-closed-outline"
            placeholder="re-type password"
            secureTextEntry
            autoComplete="password-new"
            textContentType="newPassword"
            value={confirm}
            onChangeText={setConfirm}
            editable={!busy}
            containerStyle={!matchOk ? styles.inputError : undefined}
          />
          <Text
            style={[styles.matchHint, !matchOk && styles.matchHintError]}
          >
            {matchOk ? 'Passwords must match' : 'Passwords don\u2019t match'}
          </Text>

          <Pressable
            style={({ pressed }) => [
              authStyles.primaryBtn,
              styles.submitBtn,
              pressed && authStyles.primaryBtnPressed,
              !canSubmit && authStyles.primaryBtnDisabled,
            ]}
            onPress={() => void onSubmit()}
            disabled={!canSubmit}
          >
            {busy ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={authStyles.primaryBtnText}>Sign Up</Text>
            )}
          </Pressable>

          <View style={styles.altRow}>
            <Text style={styles.altMuted}>Already have an account? </Text>
            <Pressable onPress={() => navigation.navigate('Login')} hitSlop={8}>
              <Text style={styles.altLink}>Log in</Text>
            </Pressable>
          </View>
        </ScrollView>

        <AuthFooter />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.lg,
  },
  title: {
    ...typography.title,
    fontSize: 28,
    color: authColors.text,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  inputError: {
    borderColor: authColors.error,
  },
  fieldError: {
    fontSize: 12,
    color: authColors.error,
    marginTop: -spacing.sm,
    marginBottom: spacing.sm,
    marginLeft: spacing.md,
  },
  rules: {
    marginTop: -spacing.xs,
    marginBottom: spacing.md,
    marginLeft: spacing.xs,
  },
  rulesTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: authColors.text,
    marginBottom: spacing.xs,
  },
  ruleItem: {
    fontSize: 12,
    color: authColors.textMuted,
    marginLeft: spacing.sm,
    lineHeight: 18,
  },
  ruleItemOk: {
    color: '#16A34A',
  },
  matchHint: {
    fontSize: 12,
    color: authColors.textMuted,
    marginTop: -spacing.sm,
    marginBottom: spacing.lg,
    marginLeft: spacing.md,
  },
  matchHintError: {
    color: authColors.error,
  },
  submitBtn: {
    marginTop: spacing.sm,
  },
  altRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  altMuted: {
    fontSize: 14,
    color: authColors.textMuted,
  },
  altLink: {
    fontSize: 14,
    color: authColors.link,
    fontWeight: '700',
  },
});
