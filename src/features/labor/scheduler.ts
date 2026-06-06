import { Task, DaySchedule, ScheduledTask, ScheduleResult, Laborer } from './types';

const WORKDAY_HOURS = 8;
const LUNCH_BREAK = 0.75; // 45 minutes lunch
const SHORT_BREAKS = 0.25; // two 15-min breaks = 30 min total
const TOTAL_BREAKS = LUNCH_BREAK + SHORT_BREAKS; // 1.0 hour
const PRODUCTIVE_HOURS = WORKDAY_HOURS - TOTAL_BREAKS; // 7 hours

// Demo crew with individual names so the schedule can attribute items to specific laborers
const DEFAULT_LABORERS: Laborer[] = [
  { id: 'l1', name: 'L. Johnson', ratePerJob: 200 },
  { id: 'l2', name: 'M. Rivera', ratePerJob: 200 },
  { id: 'l3', name: 'T. Kim', ratePerJob: 200 },
];

export function generateSchedule(
  tasks: Task[],
  laborers: Laborer[] = DEFAULT_LABORERS
): ScheduleResult {
  // Sort tasks by size (largest first) for better packing
  const sortedTasks = [...tasks].sort((a, b) => b.estimatedHours - a.estimatedHours);

  const days: DaySchedule[] = [];
  let currentDayTasks: ScheduledTask[] = [];
  let currentDayHours = 0;
  let dayNumber = 1;

  const defaultLaborer = laborers[0];
  const costPerLaborerPerDay = defaultLaborer.ratePerJob;

  for (const task of sortedTasks) {
    let remaining = task.estimatedHours;

    while (remaining > 0) {
      const available = PRODUCTIVE_HOURS - currentDayHours;

      if (available <= 0) {
        // finish current day
        const daySchedule = createDaySchedule(dayNumber, currentDayTasks, costPerLaborerPerDay);
        days.push(daySchedule);
        currentDayTasks = [];
        currentDayHours = 0;
        dayNumber++;
      }

      const chunk = Math.min(remaining, available);
      const startHour = 8 + currentDayHours; // start at 8 AM
      const endHour = startHour + chunk;

      // Assign a laborer (cycle through the crew for demo purposes)
      const laborerName = laborers[currentDayTasks.length % laborers.length].name;

      currentDayTasks.push({
        task: { ...task, estimatedHours: chunk },
        startTime: formatTime(startHour),
        endTime: formatTime(endHour),
        durationHours: chunk,
        laborerName,
      });

      currentDayHours += chunk;
      remaining -= chunk;
    }
  }

  // push last day
  if (currentDayTasks.length > 0) {
    const daySchedule = createDaySchedule(dayNumber, currentDayTasks, costPerLaborerPerDay);
    days.push(daySchedule);
  }

  const totalCost = days.length * costPerLaborerPerDay * laborers.length;

  return {
    days,
    totalDays: days.length,
    totalCost,
    summary: buildSummary(days, totalCost),
  };
}

function createDaySchedule(
  dayNumber: number,
  scheduledTasks: ScheduledTask[],
  costPerLaborer: number
): DaySchedule {
  const totalProductive = scheduledTasks.reduce((sum, t) => sum + t.durationHours, 0);
  const totalBreak = TOTAL_BREAKS;
  const totalHours = totalProductive + totalBreak;

  return {
    day: dayNumber,
    tasks: scheduledTasks,
    totalHours: Number(totalHours.toFixed(2)),
    productiveHours: Number(totalProductive.toFixed(2)),
    breakHours: totalBreak,
    laborersAssigned: new Set(scheduledTasks.map((t) => t.laborerName).filter(Boolean)).size || 1,
    cost: costPerLaborer,
  };
}

function formatTime(hour: number): string {
  const h = Math.floor(hour);
  const m = Math.round((hour - h) * 60);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

function buildSummary(days: DaySchedule[], totalCost: number): string {
  return `Project will take ${days.length} day(s). Total labor cost: $${totalCost}.`;
}

// Helper: get what’s done by half day (roughly 3.5 productive hours)
export function getHalfDayProgress(day: DaySchedule) {
  let cumulative = 0;
  const halfDayLimit = PRODUCTIVE_HOURS / 2;
  const doneByHalf: string[] = [];

  for (const st of day.tasks) {
    const baseName = st.laborerName ? `${st.task.name} (${st.laborerName})` : st.task.name;
    if (cumulative + st.durationHours <= halfDayLimit) {
      doneByHalf.push(baseName);
      cumulative += st.durationHours;
    } else {
      const partial = halfDayLimit - cumulative;
      if (partial > 0) {
        doneByHalf.push(`${baseName} (partial ${partial.toFixed(1)}h)`);
      }
      break;
    }
  }
  return doneByHalf;
}