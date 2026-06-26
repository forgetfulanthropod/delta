import { Platform } from 'react-native';

/** Vite base path (e.g. /delta/ on GitHub Pages, / in local dev). */
function getWebAssetBase(): string {
  try {
    const base = import.meta.env?.BASE_URL;
    if (typeof base === 'string' && base !== '/') {
      return base.endsWith('/') ? base.slice(0, -1) : base;
    }
  } catch {
    // import.meta unavailable outside Vite (e.g. Metro native)
  }
  return '';
}

/**
 * URI handling audit + helper for cross-platform consistency (Phase 1 Camera/Media).
 *
 * Supported consistently in <Image source={{ uri }} /> (RN + RNW):
 * - 'data:' base64 (web file uploads from CameraScreen.web.tsx via FileReader)
 * - 'file://' (native vision-camera takePhoto() -> photo.path)
 * - 'https://' or 'http://' (remote, or for native public fallback)
 * - '/public-path.jpg' (relative public/ assets like /ai-room-1.jpg, /test-images/... )
 *   - Web (RNW + Vite): resolves to http://host/public-path (served from public/)
 *   - Native: works in dev via packager if asset, or use full http in prod; demo fallbacks documented.
 *     For native device, prefer captured 'file://' or provide absolute if needed.
 *
 * All Image sites (DesignStudio, Scoping, worker dashboard in App.tsx, Onboarding, BeforeAfterSlider)
 * now route through normalizeImageUri for auditability. No breakage to existing RN horizontal ScrollView carousels.
 *
 * Gallery / demo fallback paths (see "Use Demo" in Camera*):
 *   /ai-room-1.jpg, /ai-room-2.jpg, /ai-room-3.jpg
 *   /test-images/before-after/before-1.jpg etc.
 *   These are present in public/ and used as reliable cross-platform fallbacks when camera/gallery unavailable.
 */
export function normalizeImageUri(uri: string | null | undefined): string {
  if (!uri) return '';
  const trimmed = uri.trim();
  if (!trimmed) return '';

  // Already fully qualified or special schemes: pass through unchanged
  if (
    trimmed.startsWith('data:') ||
    trimmed.startsWith('file:') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('blob:')
  ) {
    return trimmed;
  }

  // Public/relative paths (most common for demo + examples)
  if (trimmed.startsWith('/')) {
    const base = Platform.OS === 'web' ? getWebAssetBase() : '';
    return `${base}${trimmed}`;
  }

  // Bare filename or other: treat as public root relative (defensive)
  if (!trimmed.includes('://') && !trimmed.startsWith('/')) {
    return '/' + trimmed;
  }

  return trimmed;
}

/** Convenience for <Image source={getImageSource(uri)} /> */
export function getImageSource(uri: string | null | undefined) {
  return { uri: normalizeImageUri(uri) };
}

/** For web gallery fallbacks / conceptual testing note */
export const DEMO_IMAGE_PATHS = [
  '/ai-room-1.jpg',
  '/ai-room-2.jpg',
  '/ai-room-3.jpg',
  '/test-images/before-after/before-1.jpg',
  '/test-images/before-after/after-1.jpg',
] as const;

export function isDemoPath(uri: string): boolean {
  const n = normalizeImageUri(uri);
  return DEMO_IMAGE_PATHS.some((p) => n === p || n.endsWith(p));
}
