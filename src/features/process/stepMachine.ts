import { type GuidedStepId, type GuidedStepMeta, GUIDED_STEP_ORDER } from './types';
import { getStepIndex } from './projectProgress';

const STEP_COPY: Record<
  GuidedStepId,
  { title: string; subtitle: string; question: string; phase: GuidedStepMeta['phase'] }
> = {
  welcome: {
    phase: 'intro',
    title: 'Welcome',
    subtitle: 'Let’s remodel your space, one step at a time.',
    question: 'What should we call this project?',
  },
  capture_photo: {
    phase: 'design',
    title: 'Your space',
    subtitle: 'A clear photo helps AI understand the room.',
    question: 'Show us the space you want to transform.',
  },
  describe_vision: {
    phase: 'design',
    title: 'Your hope',
    subtitle: 'Picture the finished space — how you want it to feel when you walk in.',
    question: 'Describe your best hope for the outcome.',
  },
  review_design: {
    phase: 'design',
    title: 'AI concepts',
    subtitle: 'Compare two directions — regenerate both or keep one and refresh the other.',
    question: 'Does this direction feel right?',
  },
  approve_design: {
    phase: 'design',
    title: 'Approve design',
    subtitle: 'Lock in your chosen concept.',
    question: 'Ready to approve this design for sourcing?',
  },
  review_sourcing: {
    phase: 'sourcing',
    title: 'Materials list',
    subtitle: 'Retailer suggestions from your design.',
    question: 'Review the materials we found for you.',
  },
  approve_materials: {
    phase: 'sourcing',
    title: 'Approve materials',
    subtitle: 'Confirm what to buy before scoping labor.',
    question: 'Approve each item you want to include.',
  },
  confirm_scope: {
    phase: 'scoping',
    title: 'Scope of work',
    subtitle: 'Break the remodel into trades and tasks.',
    question: 'Confirm scope items for scheduling.',
  },
  build_schedule: {
    phase: 'scheduling',
    title: 'Labor schedule',
    subtitle: 'Day-by-day plan with breaks and costs.',
    question: 'Build your crew schedule.',
  },
  project_complete: {
    phase: 'done',
    title: 'You’re set',
    subtitle: 'Design, sourcing, scope, and schedule are in place.',
    question: 'Your project is ready to execute.',
  },
};

export function getStepMeta(stepId: GuidedStepId): GuidedStepMeta {
  const copy = STEP_COPY[stepId];
  const stepIndex = getStepIndex(stepId);
  return {
    id: stepId,
    phase: copy.phase,
    title: copy.title,
    subtitle: copy.subtitle,
    question: copy.question,
    stepIndex: stepIndex + 1,
    totalSteps: GUIDED_STEP_ORDER.length,
  };
}

/** Legacy picker steps removed from wizard — map to describe_vision if still referenced. */
const REMOVED_STEPS = new Set(['pick_style', 'pick_palette', 'pick_layout']);

export function normalizeGuidedStep(step?: string | null): GuidedStepId | undefined {
  if (!step) return undefined;
  if (REMOVED_STEPS.has(step)) return 'describe_vision';
  if ((GUIDED_STEP_ORDER as string[]).includes(step)) return step as GuidedStepId;
  return undefined;
}