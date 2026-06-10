import type { Task } from '../labor/types';

export type ScopeSubtask = {
  id: string;
  name: string;
  points: number;
};

export type ScopeTradeGroup = {
  trade: string;
  items: ScopeSubtask[];
};

const CATEGORY_TO_TRADE: Record<string, string> = {
  demo: 'Demolition',
  demolition: 'Demolition',
  electrical: 'Electrical',
  flooring: 'Flooring',
  painting: 'Painting',
  finish: 'Carpentry',
  carpentry: 'Carpentry',
  plumbing: 'Plumbing',
  general: 'General',
};

/** Map labor task hours to Scrum story points (Fibonacci-ish, 2–13). */
export function hoursToStoryPoints(hours: number): number {
  const raw = Math.round(hours * 0.75);
  const fib = [2, 3, 5, 8, 13];
  return fib.reduce((best, f) => (Math.abs(f - raw) < Math.abs(best - raw) ? f : best), fib[0]);
}

/** Build a trade-grouped scope tree from owner labor tasks (Scheduling → Scoping sync). */
export function scopeTreeFromLaborTasks(tasks: Task[]): ScopeTradeGroup[] {
  if (!tasks || tasks.length === 0) return [];

  const tradeMap: Record<string, ScopeSubtask[]> = {};

  tasks.forEach((task, i) => {
    const cat = (task.category || 'general').toLowerCase();
    const trade =
      CATEGORY_TO_TRADE[cat] ||
      (cat ? cat.charAt(0).toUpperCase() + cat.slice(1) : 'General');
    if (!tradeMap[trade]) tradeMap[trade] = [];
    tradeMap[trade].push({
      id: task.id || `lt-${i}`,
      name: task.name,
      points: hoursToStoryPoints(task.estimatedHours || 2),
    });
  });

  return Object.entries(tradeMap)
    .map(([trade, items]) => ({ trade, items }))
    .sort((a, b) => a.trade.localeCompare(b.trade));
}

/** Demo scope tree for the Oak Street example (when no labor tasks yet). */
export const DEMO_SCOPE_TREE: ScopeTradeGroup[] = [
  {
    trade: 'Carpentry',
    items: [
      { id: 'c1', name: 'Install new base & upper cabinets (soft-close)', points: 8 },
      { id: 'c2', name: 'Build & install custom kitchen island w/ seating', points: 13 },
      { id: 'c3', name: 'Hang pantry shelving + cabinet organizers', points: 5 },
      { id: 'c4', name: 'Crown molding, baseboards, window casings', points: 5 },
    ],
  },
  {
    trade: 'Electrical',
    items: [
      { id: 'e1', name: 'Run 20A circuits for appliances + island', points: 5 },
      { id: 'e2', name: 'Install boxes + wiring for 8 recessed lights', points: 3 },
      { id: 'e3', name: 'GFCI + dedicated circuits (dishwasher/fridge)', points: 3 },
      { id: 'e4', name: 'Outlets, switches, under-cabinet lighting rough-in', points: 3 },
    ],
  },
  {
    trade: 'Painting',
    items: [
      { id: 'p1', name: 'Prep walls, patch, sand smooth', points: 3 },
      { id: 'p2', name: 'Prime + 2 coats warm white on walls', points: 5 },
      { id: 'p3', name: 'Cut-in + paint trim, doors, built-ins', points: 5 },
      { id: 'p4', name: 'Durable cabinet paint (kitchen)', points: 3 },
    ],
  },
  {
    trade: 'Flooring',
    items: [
      { id: 'f1', name: 'Remove old vinyl + prep subfloor', points: 3 },
      { id: 'f2', name: 'Install LVP luxury vinyl plank + underlayment', points: 8 },
      { id: 'f3', name: 'Waterproof baseboards + door casings', points: 3 },
      { id: 'f4', name: 'Cut/fit flooring around vanity + toilet', points: 2 },
    ],
  },
  {
    trade: 'Demolition',
    items: [
      { id: 'd1', name: 'Careful demo old kitchen + non-load wall', points: 5 },
      { id: 'd2', name: 'Remove/dispose cabinets, counters, flooring', points: 3 },
      { id: 'd3', name: 'Frame new pass-through + island opening', points: 5 },
      { id: 'd4', name: 'Temp supports + debris haul', points: 2 },
    ],
  },
  {
    trade: 'Plumbing',
    items: [
      { id: 'pl1', name: 'Relocate drain lines for double vanity', points: 5 },
      { id: 'pl2', name: 'New P-traps, supplies, shutoffs', points: 3 },
      { id: 'pl3', name: 'Rough-in freestanding tub + shower valve', points: 5 },
      { id: 'pl4', name: 'Leak test all new lines pre-drywall', points: 2 },
    ],
  },
];