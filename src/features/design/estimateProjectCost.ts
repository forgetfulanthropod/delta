import type { DesignVersion } from './types';

export interface ProjectCostEstimate {
  materials: number;
  labor: number;
  total: number;
  hours: number;
}

/** Estimate ready-to-go project cost from design prompt + tweaks (shared by Studio + guided flow). */
export function estimateProjectCost(v: DesignVersion): ProjectCostEstimate {
  const p = (v.prompt + ' ' + Object.values(v.tweaks).join(' ')).toLowerCase();
  let materials = 1350;
  let laborHours = 16;

  if (p.includes('kitchen') || p.includes('cabinet') || p.includes('island')) {
    materials += 2100;
    laborHours += 14;
  } else if (p.includes('bath') || p.includes('shower') || p.includes('vanity')) {
    materials += 1450;
    laborHours += 10;
  }
  if (p.includes('floor') || p.includes('lvp') || p.includes('hardwood') || p.includes('living') || p.includes('family')) {
    materials += 1100;
    laborHours += 9;
  }
  if (p.includes('light') || p.includes('electrical') || p.includes('recessed') || p.includes('pendant')) {
    materials += 520;
    laborHours += 7;
  }
  if (p.includes('paint') || p.includes('wall') || p.includes('color')) {
    materials += 420;
    laborHours += 6;
  }
  if (p.includes('counter') || p.includes('quartz') || p.includes('granite') || p.includes('backsplash')) {
    materials += 950;
    laborHours += 5;
  }
  if (p.includes('sink') || p.includes('faucet') || p.includes('shower')) {
    materials += 380;
    laborHours += 4;
  }

  if (v.tweaks.style === 'Modern' || v.tweaks.style === 'Minimal') {
    materials += 480;
    laborHours += 5;
  }
  if (v.tweaks.style === 'Industrial') {
    materials += 320;
    laborHours += 3;
  }
  if (v.tweaks.layout === 'Open plan') {
    laborHours += 6;
    materials += 380;
  }
  if (v.tweaks.layout === 'Multi-zone') {
    laborHours += 4;
    materials += 290;
  }
  if (v.tweaks.colorPalette === 'Bold colors') {
    materials += 380;
  }
  if (v.tweaks.colorPalette === 'Earthy' || v.tweaks.colorPalette === 'Warm neutrals') {
    materials += 180;
  }

  const luxuryWords = [
    'luxury',
    'custom',
    'high-end',
    'statement',
    'premium',
    'designer',
    'handcrafted',
    'spa',
    'gourmet',
  ];
  const complexity = luxuryWords.filter((w) => p.includes(w)).length;
  if (complexity > 0) {
    materials += complexity * 420;
    laborHours += complexity * 3;
  }
  if (p.includes('large') || p.includes('entire') || p.includes('whole') || p.includes('full')) {
    materials += 650;
    laborHours += 8;
  }
  if (p.includes('reimagine') || p.includes('transform')) {
    laborHours += 2;
  }

  const labor = Math.round(laborHours * 25);
  const total = materials + labor;

  return {
    materials: Math.round(materials / 50) * 50,
    labor,
    total: Math.round(total / 50) * 50,
    hours: Math.round(laborHours),
  };
}

export function sourcingMaterialsTotal(
  items: { price: number; quantity: number; approved?: boolean }[],
  approvedOnly = false,
): number {
  const list = approvedOnly ? items.filter((i) => i.approved) : items;
  return list.reduce((sum, i) => sum + i.price * i.quantity, 0);
}

export function laborCostFromTasks(tasks: { estimatedHours: number }[]): {
  labor: number;
  hours: number;
} {
  const hours = tasks.reduce((s, t) => s + t.estimatedHours, 0);
  return { labor: Math.round(hours * 25), hours };
}