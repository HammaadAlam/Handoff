/**
 * Supabase handles sessions; `.edu` is enforced only here (and in UI) before auth calls.
 * Optional dev bypass skips the auth stack without a session (see Welcome "Skip login").
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Session, User } from '@supabase/supabase-js';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { getSupabase, isSupabaseConfigured } from '@/services/supabase';
import { assertEduEmail } from '@/utils/eduEmail';

const AUTH_BYPASS_KEY = '@handoff/auth_bypass';

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  /** True when "Skip login (testing)" is used — persisted for dev convenience */
  authBypass: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<{ needsEmailConfirmation: boolean }>;
  signOut: () => Promise<void>;
  enableAuthBypass: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [authBypass, setAuthBypass] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    let subscription: { unsubscribe: () => void } | null = null;

    void (async () => {
      try {
        const stored = await AsyncStorage.getItem(AUTH_BYPASS_KEY);
        if (!cancelled) setAuthBypass(stored === 'true');
      } catch {
        if (!cancelled) setAuthBypass(false);
      }

      if (!isSupabaseConfigured()) {
        if (!cancelled) {
          setSession(null);
          setLoading(false);
        }
        return;
      }

      const supabase = getSupabase();
      const {
        data: { session: s },
      } = await supabase.auth.getSession();
      if (!cancelled) setSession(s);
      if (!cancelled) setLoading(false);

      const {
        data: { subscription: sub },
      } = supabase.auth.onAuthStateChange((_event, nextSession) => {
        setSession(nextSession);
      });
      if (cancelled) {
        sub.unsubscribe();
        return;
      }
      subscription = sub;
    })();

    return () => {
      cancelled = true;
      subscription?.unsubscribe();
    };
  }, []);

  const clearAuthBypass = useCallback(async () => {
    await AsyncStorage.removeItem(AUTH_BYPASS_KEY);
    setAuthBypass(false);
  }, []);

  const signIn = useCallback(
    async (email: string, password: string) => {
      assertEduEmail(email);
      if (!isSupabaseConfigured()) {
        throw new Error(
          'Supabase is not configured. Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to .env.'
        );
      }
      const { error } = await getSupabase().auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) throw error;
      await clearAuthBypass();
    },
    [clearAuthBypass]
  );

  const signUp = useCallback(
    async (email: string, password: string) => {
      assertEduEmail(email);
      if (!isSupabaseConfigured()) {
        throw new Error(
          'Supabase is not configured. Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to .env.'
        );
      }
      const { data, error } = await getSupabase().auth.signUp({
        email: email.trim(),
        password,
      });
      if (error) throw error;
      if (data.session) {
        await clearAuthBypass();
      }
      return { needsEmailConfirmation: Boolean(data.user && !data.session) };
    },
    [clearAuthBypass]
  );

  const enableAuthBypass = useCallback(async () => {
    await AsyncStorage.setItem(AUTH_BYPASS_KEY, 'true');
    setAuthBypass(true);
  }, []);

  const signOut = useCallback(async () => {
    await clearAuthBypass();
    if (!isSupabaseConfigured()) return;
    await getSupabase().auth.signOut();
  }, [clearAuthBypass]);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      authBypass,
      loading,
      signIn,
      signUp,
      signOut,
      enableAuthBypass,
    }),
    [session, authBypass, loading, signIn, signUp, signOut, enableAuthBypass]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
