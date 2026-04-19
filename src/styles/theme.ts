/**
 * Handoff design tokens — purple-forward, campus marketplace UI.
 */
import { fonts } from '@/styles/fonts';

export { fonts } from '@/styles/fonts';

export const colors = {
  primary: '#7065D4',
  primaryDark: '#5B52B8',
  primaryLight: '#8B82E0',
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
  sash: '#F5E6C8',
  textInverse: '#FFFFFF',
  overlayOnImage: 'rgba(255,255,255,0.92)',
  carouselDotMuted: 'rgba(255,255,255,0.55)',
  ratingStar: '#FBBF24',
  /** Listing detail — curated / success strip */
  curatedBannerBg: '#ECFDF5',
  curatedBannerBorder: '#A7F3D0',
  curatedBannerText: '#166534',
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
  input: 12,
  button: 12,
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
  title: {
    fontFamily: fonts.bold,
    fontSize: 26,
    letterSpacing: -0.3,
  },
  subtitle: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 22 },
  header: { fontFamily: fonts.bold, fontSize: 22 },
  body: { fontFamily: fonts.regular, fontSize: 15 },
  caption: { fontFamily: fonts.regular, fontSize: 12 },
  button: { fontFamily: fonts.bold, fontSize: 15 },
} as const;
