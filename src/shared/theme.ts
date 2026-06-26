import { StyleSheet, useColorScheme } from 'react-native';
import { MILKY_INK, MILKY_INK_SOFT, MILKY_BORDER, milkyFill } from './milkyGradients';

export interface Theme {
  colors: {
    background: string;
    surface: string;
    surfaceAlt: string;
    text: string;
    textSecondary: string;
    textMuted: string;
    border: string;
    accent: string;
    accentLight: string;
    success: string;
    successLight: string;
    cardBg: string;
    headerBg: string;
    tabBarBg: string;
    pillBg: string;
    pillBorder: string;
    textPrimary: string;
    backgroundAlt: string;
    backgroundLight: string;
    backgroundSuccess?: string;
    successBorder?: string;
    dark?: string;
    gray?: string;
    textLight?: string;
    borderDark?: string;
    workerClaim?: string;
  };
  spacing: { xs: number; sm: number; md: number; lg: number; xl: number; xxl?: number };
  radii?: any;
  typography?: any;
}

const baseColorsLight = {
  accent: MILKY_INK,
  primary: MILKY_INK,
  textPrimary: '#222',
  textSecondary: '#666',
  textMuted: '#888',
  textLight: '#fff',
  background: '#FDF8FF',
  backgroundAlt: '#F8F4FF',
  backgroundLight: '#FAF7FF',
  backgroundSuccess: '#e6f4ea',
  border: MILKY_BORDER,
  borderLight: '#E8E0F4',
  borderDark: '#ddd',
  success: '#2e7d32',
  successLight: '#E8F5E9',
  successDark: '#1b5e20',
  successBorder: '#c8e6c9',
  cardBg: '#fff',
  workerClaim: '#4caf50',
  dark: '#111',
  gray: '#333',
};

const light: Theme = {
  colors: {
    ...baseColorsLight,
    background: '#FDF8FF',
    surface: 'rgba(255,255,255,0.92)',
    surfaceAlt: '#F5F0FF',
    text: '#2D2640',
    textSecondary: MILKY_INK_SOFT,
    textMuted: '#8A7E9A',
    border: MILKY_BORDER,
    accent: MILKY_INK,
    accentLight: '#EDE9FE',
    success: '#2e7d32',
    successLight: '#e8f5e9',
    cardBg: '#fff',
    headerBg: 'rgba(255,255,255,0.88)',
    tabBarBg: '#fff',
    pillBg: '#e8f5e9',
    pillBorder: '#a5d6a7',
    textPrimary: '#222',
    backgroundAlt: '#f8f8f8',
    backgroundLight: '#fafafa',
    backgroundSuccess: '#e6f4ea',
    successBorder: '#c8e6c9',
    dark: '#111',
    gray: '#333',
    textLight: '#fff',
    borderDark: '#ddd',
    workerClaim: '#4caf50',
  },
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 },
  radii: { sm: 8, md: 12, lg: 16, xl: 18, pill: 999 },
  typography: {
    title: { fontSize: 32, fontWeight: '700' as const, color: '#222', letterSpacing: -1 },
    titleLarge: { fontSize: 36, fontWeight: '700' as const, color: '#222', letterSpacing: -1 },
    subtitle: { fontSize: 16, color: '#666' },
    subtitleLarge: { fontSize: 20, color: '#666' },
  },
};

const dark: Theme = {
  colors: {
    ...baseColorsLight,
    background: '#121212',
    surface: '#1e1e1e',
    surfaceAlt: '#252525',
    text: '#eee',
    textSecondary: '#aaa',
    textMuted: '#888',
    border: '#333',
    accent: '#FF385C',
    accentLight: '#3a1f24',
    success: '#81c784',
    successLight: '#1b3a1f',
    cardBg: '#1e1e1e',
    headerBg: '#1e1e1e',
    tabBarBg: '#1a1a1a',
    pillBg: '#1b3a1f',
    pillBorder: '#2e5f2f',
    textPrimary: '#eee',
    backgroundAlt: '#252525',
    backgroundLight: '#1f1f1f',
    backgroundSuccess: '#1b3a1f',
    successBorder: '#2e5f2f',
    dark: '#000',
    gray: '#aaa',
    textLight: '#fff',
    borderDark: '#444',
    workerClaim: '#4caf50',
  },
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 },
  radii: { sm: 8, md: 12, lg: 16, xl: 18, pill: 999 },
  typography: {
    title: { fontSize: 32, fontWeight: '700' as const, color: '#eee', letterSpacing: -1 },
    titleLarge: { fontSize: 36, fontWeight: '700' as const, color: '#eee', letterSpacing: -1 },
    subtitle: { fontSize: 16, color: '#aaa' },
    subtitleLarge: { fontSize: 20, color: '#aaa' },
  },
};

export function useTheme(): Theme {
  const scheme = useColorScheme();
  return scheme === 'dark' ? dark : light;
}

export const COLORS = light.colors;
export const SPACING = light.spacing;
export const RADII = light.radii || { md: 12, lg: 16, pill: 999 };
export const TYPOGRAPHY = light.typography || {};
export const CONSTRAINED_STYLE: any = { maxWidth: 720, width: '100%', alignSelf: 'center' };

const _sharedStyles = StyleSheet.create({
  constrained: CONSTRAINED_STYLE,
  primaryButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: MILKY_BORDER,
    ...milkyFill('primaryBtn', '#DDD6FE'),
  },
  primaryButtonText: {
    color: MILKY_INK,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  secondaryButton: {
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.65)',
    borderWidth: 1,
    borderColor: MILKY_BORDER,
  },
  secondaryButtonText: {
    color: MILKY_INK_SOFT,
    fontSize: 15,
    fontWeight: '600',
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: MILKY_BORDER,
    padding: 16,
  },
  emptyState: {
    padding: 24,
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: MILKY_BORDER,
    backgroundColor: 'rgba(255,255,255,0.85)',
  },
  heroWrap: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: MILKY_BORDER,
  },
  subtleButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderWidth: 1,
    borderColor: MILKY_BORDER,
  },
  subtleButtonText: {
    color: MILKY_INK_SOFT,
    fontSize: 13,
    fontWeight: '600',
  },
}) as any;

export const sharedStyles: any = _sharedStyles;

export default { useTheme, COLORS, SPACING, RADII, TYPOGRAPHY, sharedStyles, CONSTRAINED_STYLE };
