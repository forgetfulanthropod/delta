import { apiUrl } from '../../shared/api';

export type RoomAnalysis = {
  roomType: string;
  issues: string[];
  suggestedMaterials: string[];
  scopeHint: string;
  usedImageRef?: boolean;
  imageDescription?: string | null;
  visionSource?: 'describeimages' | 'heuristic';
};

export async function analyzeRoom(
  prompt: string,
  tweaks: Record<string, string>,
  imageUri?: string | null,
): Promise<RoomAnalysis | null> {
  try {
    const res = await fetch(apiUrl('/api/analyze'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, tweaks, imageUri }),
    });
    const data = await res.json();
    if (data?.success) {
      return {
        roomType: data.roomType,
        issues: data.issues || [],
        suggestedMaterials: data.suggestedMaterials || [],
        scopeHint: data.scopeHint || '',
        usedImageRef: data.usedImageRef,
        imageDescription: data.imageDescription ?? null,
        visionSource: data.visionSource,
      };
    }
  } catch {
    // offline fallback
  }
  return inferLocalAnalysis(prompt, tweaks);
}

export function inferLocalAnalysis(prompt: string, tweaks: Record<string, string>): RoomAnalysis {
  const text = `${prompt} ${Object.values(tweaks).join(' ')}`.toLowerCase();
  const roomType = text.includes('kitchen') ? 'kitchen' : text.includes('bath') ? 'bathroom' : 'living_room';
  return {
    roomType,
    issues: [],
    suggestedMaterials: roomType === 'kitchen' ? ['cabinets', 'countertop', 'lighting'] : ['paint', 'flooring'],
    scopeHint: `Local analysis: ${roomType} remodel`,
  };
}