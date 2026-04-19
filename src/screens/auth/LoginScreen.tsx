/**
 * Login — pill inputs, .edu enforced in app (not Supabase), forgot-password stub.
 */
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
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

function authErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return 'Something went wrong. Try again.';
}

export function LoginScreen() {
  const navigation = useNavigation<Nav>();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const emailHint = eduEmailInlineHint(email);

  const onSubmit = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Missing fields', 'Enter your school email and password.');
      return;
    }
    if (!isEduEmail(email)) {
      Alert.alert('School email required', emailHint ?? EDU_EMAIL_REQUIRED_MESSAGE);
      return;
    }
    setBusy(true);
    try {
      await signIn(email, password);
    } catch (e) {
      Alert.alert('Sign in failed', authErrorMessage(e));
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
          <Text style={styles.title}>Login</Text>

          <View style={styles.formBlock}>
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
            {emailHint ? (
              <Text style={styles.fieldError}>{emailHint}</Text>
            ) : null}

            <PillInput
              icon="lock-closed-outline"
              placeholder="Password"
              secureTextEntry
              autoComplete="password"
              textContentType="password"
              value={password}
              onChangeText={setPassword}
              editable={!busy}
            />

            <Pressable
              style={styles.forgot}
              onPress={() =>
                Alert.alert('Forgot password', 'Password reset is coming soon.')
              }
              hitSlop={8}
            >
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                authStyles.primaryBtn,
                styles.submitBtn,
                pressed && authStyles.primaryBtnPressed,
                (busy || Boolean(emailHint)) && authStyles.primaryBtnDisabled,
              ]}
              onPress={() => void onSubmit()}
              disabled={busy || Boolean(emailHint)}
            >
              {busy ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={authStyles.primaryBtnText}>Login</Text>
              )}
            </Pressable>

            <View style={styles.altRow}>
              <Text style={styles.altMuted}>Don&apos;t have an account? </Text>
              <Pressable onPress={() => navigation.navigate('SignUp')} hitSlop={8}>
                <Text style={styles.altLink}>Sign up</Text>
              </Pressable>
            </View>
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
    paddingTop: spacing.xxl + spacing.lg,
    paddingBottom: spacing.lg,
  },
  title: {
    ...typography.title,
    fontSize: 28,
    color: authColors.text,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  formBlock: {
    width: '100%',
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
  forgot: {
    alignSelf: 'flex-end',
    marginTop: -spacing.xs,
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.xs,
  },
  forgotText: {
    color: authColors.link,
    fontSize: 13,
    fontWeight: '600',
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
