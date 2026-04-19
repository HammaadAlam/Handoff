/**
 * Shared tokens for the auth flow (Welcome / Login / Sign Up) — purple inputs + buttons.
 */
import { Platform, StyleSheet } from 'react-native';
import { spacing, typography } from '@/styles/theme';

export const authColors = {
  background: '#FFFFFF',
  surface: '#FFFFFF',
  text: '#111827',
  textMuted: '#6B7280',
  primary: '#7C5CFF',
  primaryDark: '#6A4DE8',
  inputBg: '#F4F1FF',
  inputBorder: '#D6CCFF',
  inputPlaceholder: '#A99CE8',
  link: '#7C5CFF',
  divider: '#E5E7EB',
  iconTint: '#A99CE8',
  error: '#DC2626',
} as const;

/** Inputs and buttons — matches app `radii.button` (less pill-like). */
export const authRadius = 12;

export const authStyles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: authColors.background,
  },
  primaryBtn: {
    backgroundColor: authColors.primary,
    borderRadius: authRadius,
    paddingVertical: spacing.md,
    alignItems: 'center',
    width: '100%',
    shadowColor: authColors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
  primaryBtnPressed: {
    opacity: 0.9,
  },
  primaryBtnDisabled: {
    opacity: 0.6,
  },
  primaryBtnText: {
    ...typography.button,
    color: '#FFFFFF',
    fontSize: 14,
    letterSpacing: 1.4,
    textTransform: 'uppercase' as const,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: authColors.inputBorder,
    backgroundColor: authColors.inputBg,
    borderRadius: authRadius,
    paddingHorizontal: spacing.md,
    height: Platform.OS === 'ios' ? 50 : 52,
    marginBottom: spacing.md,
  },
  inputIcon: {
    marginRight: spacing.sm,
  },
  inputField: {
    flex: 1,
    fontSize: 15,
    color: authColors.text,
    paddingVertical: 0,
  },
});

/** Login / Sign Up — illustration + form on solid background (no outer card) */
export const authScreenStyles = StyleSheet.create({
  screenFill: {
    flex: 1,
    backgroundColor: authColors.surface,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  hero: {
    width: '100%',
    height: 192,
    marginBottom: spacing.sm,
    alignSelf: 'center',
  },
  subtitle: {
    ...typography.subtitle,
    fontSize: 14,
    color: authColors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 20,
    paddingHorizontal: spacing.xs,
  },
});
