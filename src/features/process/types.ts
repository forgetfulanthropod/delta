import type { DesignVersion } from '../design/types';
import type { SourcingItem } from '../sourcing/types';
import type { Task } from '../labor/types';

/** Minimal store slice for pure progress / step logic (testable without React). */
export interface ProjectSnapshot {
  projectName?: string;
  baseImage?: string | null;
  prompt?: string;
  tweaks?: { style: string; colorPalette: string; layout: string };
  approvedDesign: DesignVersion | null;
  versions: DesignVersion[];
  sourcingItems: SourcingItem[];
  laborTasks: Task[];
  scopeCompleted: Record<string, boolean>;
  hasSchedule?: boolean;
}

export type ProcessArea = 'design' | 'sourcing' | 'scoping' | 'scheduling';

export type AttentionLevel = 'complete' | 'in_progress' | 'needs_attention' | 'not_started';

export interface AreaFlag {
  area: ProcessArea;
  label: string;
  status: AttentionLevel;
  message: string;
  percentComplete: number;
  stepId: GuidedStepId;
}

export type GuidedStepId =
  | 'welcome'
  | 'capture_photo'
  | 'describe_vision'
  | 'review_design'
  | 'approve_design'
  | 'review_sourcing'
  | 'approve_materials'
  | 'confirm_scope'
  | 'build_schedule'
  | 'project_complete';

export interface GuidedStepMeta {
  id: GuidedStepId;
  phase: ProcessArea | 'intro' | 'done';
  title: string;
  subtitle: string;
  question: string;
  stepIndex: number;
  totalSteps: number;
}

export const GUIDED_STEP_ORDER: GuidedStepId[] = [
  'welcome',
  'capture_photo',
  'describe_vision',
  'review_design',
  'approve_design',
  'review_sourcing',
  'approve_materials',
  'confirm_scope',
  'build_schedule',
  'project_complete',
];