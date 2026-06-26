import type { DesignVersion } from '../design/types';
import type { SourcingItem } from '../sourcing/types';
import type { Task } from '../labor/types';

/** Build starter sourcing list from an approved design (same heuristics as Design Studio). */
export function buildSourcingSuggestions(version: DesignVersion): SourcingItem[] {
  const base = Date.now();
  const p = (version.prompt + ' ' + Object.values(version.tweaks).join(' ')).toLowerCase();
  const items: SourcingItem[] = [];

  const push = (name: string, retailer: SourcingItem['retailer'], price: number, qty: number) => {
    items.push({
      id: String(base + items.length),
      name,
      retailer,
      price,
      quantity: qty,
      approved: false,
      url: retailer === "Lowe's" ? 'https://www.lowes.com' : 'https://www.amazon.com',
    });
  };

  if (p.includes('kitchen') || p.includes('cabinet')) {
    push('Shaker Cabinet Set', "Lowe's", 189, 12);
    push('Quartz Countertop Slab', "Lowe's", 62, 28);
  }
  if (p.includes('floor') || p.includes('living') || p.includes('modern')) {
    push('Engineered Oak Flooring', "Lowe's", 4.29, 180);
  }
  if (p.includes('light') || p.includes('electrical') || version.tweaks.style === 'Modern') {
    push('Recessed LED Kit (6-pack)', 'Amazon', 89, 2);
  }
  if (p.includes('paint') || p.includes('wall')) {
    push('Interior Paint - Eggshell', "Lowe's", 42, 6);
  }
  if (items.length === 0) {
    push('LVP Flooring - Oak', "Lowe's", 3.49, 120);
    push('Interior Paint Set', 'Amazon', 38, 4);
    push('Modern Light Fixture', 'Amazon', 129, 2);
  }
  return items;
}

export function laborTasksFromSourcing(approved: SourcingItem[]): Task[] {
  return approved.map((item, index) => ({
    id: `labor-${index}`,
    name: `Install ${item.name}`,
    estimatedHours: Math.max(2, Math.ceil(item.quantity / 40)),
    category: inferCategory(item.name),
  }));
}

function inferCategory(name: string): string {
  const n = name.toLowerCase();
  if (n.includes('cabinet') || n.includes('floor')) return 'carpentry';
  if (n.includes('light') || n.includes('electrical')) return 'electrical';
  if (n.includes('paint')) return 'painting';
  if (n.includes('counter')) return 'plumbing';
  return 'general';
}