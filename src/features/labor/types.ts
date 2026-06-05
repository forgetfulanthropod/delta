export interface Task {
  id: string;
  name: string;
  estimatedHours: number; // total estimated time for the task
  category?: string; // e.g. "demo", "electrical", "painting"
}

export interface Laborer {
  id: string;
  name: string;
  ratePerJob: number; // $200/day default ($25/hr * 8 hours)
}

export interface DaySchedule {
  day: number;
  date?: string; // optional for future calendar integration
  tasks: ScheduledTask[];
  totalHours: number;
  productiveHours: number;
  breakHours: number;
  laborersAssigned: number;
  cost: number;
}

export interface ScheduledTask {
  task: Task;
  startTime: string; // e.g. "08:00"
  endTime: string;
  durationHours: number;
}

export interface ScheduleResult {
  days: DaySchedule[];
  totalDays: number;
  totalCost: number;
  summary: string;
}