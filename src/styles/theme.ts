/**
 * Handoff design tokens — purple-forward, campus marketplace UI.
 * Adjust gradients here to tune LSU-inspired branding.
 */

export const colors = {
  /** Core purple from mockups */
  primary: '#7065D4',
  primaryDark: '#5B52B8',
  primaryLight: '#8B82E0',
  /** Gradient stops for buttons / accents */
  gradientStart: '#7C6FE0',
  gradientEnd: '#5E54C9',
  background: '#F9FAFB',
  surface: '#FFFFFF',
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  border: '#E5E7EB',
  borderStrong: '#1F2937',
  link: '#2563EB',
  error: '#DC2626',
  success: '#16A34A',
  warning: '#EAB308',
  chipBg: '#F3F4F6',
  bannerTint: '#EDE9FE',
  /** Soft sash accent on logo */
  sash: '#F5E6C8',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radii = {
  pill: 999,
  input: 28,
  button: 28,
  card: 16,
} as const;

export const shadows = {
  soft: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  button: {
    shadowColor: '#5E54C9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
} as const;

export const typography = {
  title: { fontSize: 26, fontWeight: '700' as const, letterSpacing: -0.3 },
  subtitle: { fontSize: 15, fontWeight: '400' as const, lineHeight: 22 },
  header: { fontSize: 22, fontWeight: '700' as const },
  body: { fontSize: 15, fontWeight: '400' as const },
  caption: { fontSize: 12, fontWeight: '400' as const },
  button: { fontSize: 15, fontWeight: '700' as const },
} as const;
