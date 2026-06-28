import type { DesignVersion } from '../design/types';
import type { SourcingItem, Retailer } from '../sourcing/types';
import type { Task } from '../labor/types';
import type { RoomAnalysis } from '../design/analyzeRoom';

/** Retailer search deep link (not bare homepage). */
export function retailerDeepLink(name: string, retailer: Retailer): string {
  const term = encodeURIComponent(name.trim());
  switch (retailer) {
    case "Lowe's":
      return `https://www.lowes.com/search?searchTerm=${term}`;
    case 'Amazon':
      return `https://www.amazon.com/s?k=${term}`;
    case 'Home Depot':
      return `https://www.homedepot.com/s/${term}`;
    default:
      return `https://www.google.com/search?q=${term}+${encodeURIComponent(retailer)}`;
  }
}

const MATERIAL_LABELS: Record<string, { name: string; retailer: Retailer; price: number; qty: number }> = {
  cabinet_hardware: { name: 'Cabinet Hardware Set', retailer: "Lowe's", price: 89, qty: 1 },
  countertop_quartz: { name: 'Quartz Countertop Slab', retailer: "Lowe's", price: 62, qty: 28 },
  backsplash_tile: { name: 'Subway Backsplash Tile', retailer: "Lowe's", price: 4.5, qty: 80 },
  pendant_lighting: { name: 'Pendant Light Fixture', retailer: 'Amazon', price: 129, qty: 2 },
  sink_faucet: { name: 'Kitchen Sink & Faucet Combo', retailer: "Lowe's", price: 349, qty: 1 },
  vanity: { name: 'Bathroom Vanity 36in', retailer: "Lowe's", price: 420, qty: 1 },
  tile: { name: 'Porcelain Floor Tile', retailer: "Lowe's", price: 3.2, qty: 120 },
  shower_fixture: { name: 'Shower Fixture Kit', retailer: 'Amazon', price: 189, qty: 1 },
  mirror_lighting: { name: 'Vanity Mirror Light Bar', retailer: 'Amazon', price: 79, qty: 1 },
  closet_system: { name: 'Closet Organizer Kit', retailer: 'Amazon', price: 249, qty: 1 },
  interior_paint: { name: 'Interior Paint - Eggshell', retailer: "Lowe's", price: 42, qty: 6 },
  flooring_lvp: { name: 'LVP Flooring - Oak', retailer: "Lowe's", price: 3.49, qty: 120 },
  trim_molding: { name: 'Baseboard & Trim Molding', retailer: "Lowe's", price: 2.8, qty: 200 },
  recessed_lighting: { name: 'Recessed LED Kit (6-pack)', retailer: 'Amazon', price: 89, qty: 2 },
  matte_black_fixtures: { name: 'Matte Black Fixture Set', retailer: 'Amazon', price: 119, qty: 1 },
  oak_flooring: { name: 'Engineered Oak Flooring', retailer: "Lowe's", price: 4.29, qty: 180 },
  statement_lighting: { name: 'Statement Chandelier', retailer: 'Amazon', price: 199, qty: 1 },
  cabinets: { name: 'Shaker Cabinet Set', retailer: "Lowe's", price: 189, qty: 12 },
  countertop: { name: 'Quartz Countertop Slab', retailer: "Lowe's", price: 62, qty: 28 },
  lighting: { name: 'Recessed LED Kit (6-pack)', retailer: 'Amazon', price: 89, qty: 2 },
  paint: { name: 'Interior Paint Set', retailer: 'Amazon', price: 38, qty: 4 },
  flooring: { name: 'Engineered Oak Flooring', retailer: "Lowe's", price: 4.29, qty: 180 },
};

function pushItem(
  items: SourcingItem[],
  base: number,
  name: string,
  retailer: Retailer,
  price: number,
  qty: number,
) {
  items.push({
    id: String(base + items.length),
    name,
    retailer,
    price,
    quantity: qty,
    approved: false,
    url: retailerDeepLink(name, retailer),
  });
}

/** Build starter sourcing list from an approved design (same heuristics as Design Studio). */
export function buildSourcingSuggestions(version: DesignVersion): SourcingItem[] {
  const base = Date.now();
  const p = (version.prompt + ' ' + Object.values(version.tweaks).join(' ')).toLowerCase();
  const items: SourcingItem[] = [];

  if (p.includes('kitchen') || p.includes('cabinet')) {
    pushItem(items, base, 'Shaker Cabinet Set', "Lowe's", 189, 12);
    pushItem(items, base, 'Quartz Countertop Slab', "Lowe's", 62, 28);
  }
  if (p.includes('floor') || p.includes('living') || p.includes('modern')) {
    pushItem(items, base, 'Engineered Oak Flooring', "Lowe's", 4.29, 180);
  }
  if (p.includes('light') || p.includes('electrical') || version.tweaks.style === 'Modern') {
    pushItem(items, base, 'Recessed LED Kit (6-pack)', 'Amazon', 89, 2);
  }
  if (p.includes('paint') || p.includes('wall')) {
    pushItem(items, base, 'Interior Paint - Eggshell', "Lowe's", 42, 6);
  }
  if (items.length === 0) {
    pushItem(items, base, 'LVP Flooring - Oak', "Lowe's", 3.49, 120);
    pushItem(items, base, 'Interior Paint Set', 'Amazon', 38, 4);
    pushItem(items, base, 'Modern Light Fixture', 'Amazon', 129, 2);
  }
  return items;
}

/** Fold /api/analyze outputs into sourcing list (dedupe by name). */
export function enrichSourcingFromAnalysis(
  baseItems: SourcingItem[],
  analysis: RoomAnalysis | null,
): SourcingItem[] {
  if (!analysis) return baseItems;

  const seen = new Set(baseItems.map((i) => i.name.toLowerCase()));
  const merged = [...baseItems];
  const base = Date.now() + 1000;

  for (const key of analysis.suggestedMaterials || []) {
    const spec = MATERIAL_LABELS[key] || MATERIAL_LABELS[key.replace(/_/g, ' ')];
    const label = spec?.name || key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    if (seen.has(label.toLowerCase())) continue;
    seen.add(label.toLowerCase());
    const retailer: Retailer = spec?.retailer || 'Amazon';
    const price = spec?.price ?? 49;
    const qty = spec?.qty ?? 1;
    pushItem(merged, base, label, retailer, price, qty);
  }

  return merged;
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