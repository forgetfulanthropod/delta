import { Platform, type ViewStyle } from 'react-native';

/** Soft milky rainbow stops — juxtaposed bands, not flat accent pink. */
export const MILKY_BANDS = ['#E8D4FF', '#FFD4E8', '#FFE8C8', '#D4FFE8', '#D4E8FF'] as const;

export const MILKY = {
  canvas:
    'linear-gradient(165deg, #FDF8FF 0%, #FFF9F5 30%, #F5FAFF 60%, #FAFFF8 100%)',
  rainbowBand:
    'linear-gradient(90deg, #E8D4FF 0%, #FFD4E8 20%, #FFE8C8 40%, #D4FFE8 60%, #D4E8FF 80%, #E8D4FF 100%)',
  progress:
    'linear-gradient(90deg, #C4B5FD 0%, #F9A8D4 28%, #FCD34D 52%, #6EE7B7 76%, #93C5FD 100%)',
  card:
    'linear-gradient(160deg, rgba(255,255,255,0.94) 0%, rgba(253,248,255,0.9) 45%, rgba(245,250,255,0.92) 100%)',
  header:
    'linear-gradient(180deg, rgba(255,255,255,0.88) 0%, rgba(253,248,255,0.72) 100%)',
  footer:
    'linear-gradient(0deg, rgba(255,255,255,0.95) 0%, rgba(250,252,255,0.85) 100%)',
  primaryBtn:
    'linear-gradient(135deg, #DDD6FE 0%, #FBCFE8 42%, #BAE6FD 100%)',
  chipActive:
    'linear-gradient(135deg, #EDE9FE 0%, #FCE7F3 50%, #DBEAFE 100%)',
  labelChip:
    'linear-gradient(135deg, #C4B5FD 0%, #F9A8D4 50%, #93C5FD 100%)',
} as const;

/** Readable text on milky surfaces (replaces hot pink accent). */
export const MILKY_INK = '#4A3F5C';
export const MILKY_INK_SOFT = '#6B5F7A';
/** Light example/placeholder copy inside milky inputs. */
export const MILKY_PLACEHOLDER = '#B8AECC';
export const MILKY_BORDER = 'rgba(180, 160, 210, 0.35)';

type MilkyKey = keyof typeof MILKY;

/** Apply CSS gradient on web; soft flat tint on native. */
export function milkyFill(key: MilkyKey, fallback: string): ViewStyle {
  if (Platform.OS === 'web') {
    return { backgroundImage: MILKY[key] } as ViewStyle;
  }
  return { backgroundColor: fallback };
}