import { DEFAULT_DESIGN_TWEAKS } from '../../store/useDeltaStore';
import { apiUrl } from '../../shared/api';
import type { DesignVersion } from '../design/types';

const FALLBACK_URIS = [
  '/test-images/before-after/after-1.jpg',
  '/ai-room-1.jpg',
  '/ai-room-2.jpg',
  '/ai-room-3.jpg',
];

let fallbackCursor = 0;

function nextFallbackUri(): string {
  const uri = FALLBACK_URIS[fallbackCursor % FALLBACK_URIS.length];
  fallbackCursor += 1;
  return uri;
}

export function createConceptVersion(
  imageUri: string,
  prompt: string,
): DesignVersion {
  return {
    id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    imageUri,
    prompt,
    tweaks: { ...DEFAULT_DESIGN_TWEAKS },
    createdAt: new Date().toISOString(),
  };
}

/** Slot 0 = Direction A (older), slot 1 = Direction B (newer). Store keeps newest first. */
export function pairFromVersions(
  versions: DesignVersion[],
): [DesignVersion | null, DesignVersion | null] {
  return [versions[1] ?? null, versions[0] ?? null];
}

export function versionsFromPair(
  pair: [DesignVersion | null, DesignVersion | null],
): DesignVersion[] {
  const a = pair[0];
  const b = pair[1];
  if (a && b) return [b, a];
  if (b) return [b];
  if (a) return [a];
  return [];
}

export async function fetchConceptVersion(
  baseImage: string,
  prompt: string,
  provider: string | null,
): Promise<DesignVersion> {
  const enhanced = `Best hoped outcome for this remodel: ${prompt.trim()}`;
  try {
    const res = await fetch(apiUrl('/api/reimagine'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageUri: baseImage,
        prompt: enhanced,
        provider: provider || 'x',
        apiKey: 'demo-x',
      }),
    });
    const data = await res.json();
    if (data.imageUri) {
      return createConceptVersion(data.imageUri, prompt);
    }
  } catch {
    /* fallback below */
  }
  return createConceptVersion(nextFallbackUri(), prompt);
}

export async function generateConceptPair(
  baseImage: string,
  prompt: string,
  provider: string | null,
): Promise<[DesignVersion, DesignVersion]> {
  const [a, b] = await Promise.all([
    fetchConceptVersion(baseImage, prompt, provider),
    fetchConceptVersion(baseImage, prompt, provider),
  ]);
  return [a, b];
}