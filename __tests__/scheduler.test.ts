import { generateSchedule, getHalfDayProgress } from '../src/features/labor/scheduler';
import type { Task } from '../src/features/labor/types';

describe('generateSchedule', () => {
  const tasks: Task[] = [
    { id: '1', name: 'Demo kitchen', estimatedHours: 14, category: 'demo' },
    { id: '2', name: 'Install cabinets', estimatedHours: 8, category: 'carpentry' },
    { id: '3', name: 'Paint walls', estimatedHours: 5, category: 'painting' },
  ];

  it('packs tasks into days with 7 productive hours per day', () => {
    const result = generateSchedule(tasks);
    expect(result.days.length).toBeGreaterThan(0);
    result.days.forEach((day) => {
      expect(day.productiveHours).toBeLessThanOrEqual(7);
      expect(day.breakHours).toBe(1);
      expect(day.cost).toBe(200);
    });
  });

  it('sorts largest tasks first (demo kitchen should appear early)', () => {
    const result = generateSchedule(tasks);
    const firstDayNames = result.days[0].tasks.map((t) => t.task.name);
    expect(firstDayNames[0]).toBe('Demo kitchen');
  });

  it('returns a summary with total days and cost', () => {
    const result = generateSchedule(tasks);
    expect(result.summary).toMatch(/Project will take \d+ day/);
    expect(result.totalCost).toBeGreaterThan(0);
  });

  it('handles empty task list', () => {
    const result = generateSchedule([]);
    expect(result.days).toHaveLength(0);
    expect(result.totalDays).toBe(0);
  });
});

describe('getHalfDayProgress', () => {
  it('returns tasks completed by half-day mark', () => {
    const result = generateSchedule([
      { id: 'a', name: 'Big task', estimatedHours: 6, category: 'demo' },
      { id: 'b', name: 'Small task', estimatedHours: 2, category: 'paint' },
    ]);
    const day = result.days[0];
    const half = getHalfDayProgress(day);
    expect(half.length).toBeGreaterThan(0);
  });
});