import { scopeTreeFromLaborTasks, DEMO_SCOPE_TREE } from '../scoping/scopeFromLabor';
import {
  type AreaFlag,
  type AttentionLevel,
  type GuidedStepId,
  type ProjectSnapshot,
  GUIDED_STEP_ORDER,
} from './types';

function effectivePrompt(s: ProjectSnapshot): string {
  return (
    s.prompt?.trim() ||
    s.versions[0]?.prompt?.trim() ||
    s.approvedDesign?.prompt?.trim() ||
    ''
  );
}

function effectiveTweaks(s: ProjectSnapshot): ProjectSnapshot['tweaks'] {
  const t = s.tweaks;
  if (t && (t.style || t.colorPalette || t.layout)) return t;
  return s.versions[0]?.tweaks || s.approvedDesign?.tweaks;
}

function hasPhoto(s: ProjectSnapshot): boolean {
  return !!(
    s.baseImage ||
    s.versions.length > 0 ||
    s.approvedDesign?.imageUri
  );
}

function hasVision(s: ProjectSnapshot): boolean {
  return effectivePrompt(s).length > 3;
}

function hasTweaks(s: ProjectSnapshot): boolean {
  const t = effectiveTweaks(s);
  return !!(t?.style && t?.colorPalette && t?.layout);
}

function hasGeneratedDesign(s: ProjectSnapshot): boolean {
  return s.versions.length > 0;
}

function approvedSourcingCount(s: ProjectSnapshot): number {
  return (s.sourcingItems || []).filter((i) => i.approved).length;
}

function scopeSubtaskIds(s: ProjectSnapshot): string[] {
  const fromLabor = scopeTreeFromLaborTasks(s.laborTasks || []);
  const tree = fromLabor.length > 0 ? fromLabor : DEMO_SCOPE_TREE;
  return tree.flatMap((g) => g.items.map((i) => i.id));
}

function scopeCompletedCount(s: ProjectSnapshot): number {
  const ids = scopeSubtaskIds(s);
  return ids.filter((id) => s.scopeCompleted?.[id]).length;
}

function designPercent(s: ProjectSnapshot): number {
  if (s.approvedDesign) return 100;
  let n = 0;
  if (s.projectName?.trim()) n += 15;
  if (hasPhoto(s)) n += 20;
  if (hasVision(s)) n += 15;
  if (hasTweaks(s)) n += 15;
  if (hasGeneratedDesign(s)) n += 20;
  return Math.min(100, n);
}

function sourcingPercent(s: ProjectSnapshot): number {
  const items = s.sourcingItems || [];
  if (items.length === 0) return s.approvedDesign ? 10 : 0;
  const approved = approvedSourcingCount(s);
  return Math.round((approved / items.length) * 100);
}

function scopingPercent(s: ProjectSnapshot): number {
  if ((s.laborTasks || []).length === 0) return 0;
  const ids = scopeSubtaskIds(s);
  if (ids.length === 0) return 50;
  return Math.round((scopeCompletedCount(s) / ids.length) * 100);
}

function schedulingPercent(s: ProjectSnapshot): number {
  if ((s.laborTasks || []).length === 0) return 0;
  return s.hasSchedule ? 100 : 40;
}

function levelFromPercent(p: number, started: boolean): AttentionLevel {
  if (p >= 100) return 'complete';
  if (p > 0) return 'in_progress';
  if (started) return 'needs_attention';
  return 'not_started';
}

/** TurboTax-style area flags from real project data. */
export function computeAreaFlags(snapshot: ProjectSnapshot): AreaFlag[] {
  const designStarted = !!(snapshot.projectName || hasPhoto(snapshot));
  const designPct = designPercent(snapshot);
  const designStatus: AttentionLevel =
    snapshot.approvedDesign
      ? 'complete'
      : hasGeneratedDesign(snapshot)
        ? 'needs_attention'
        : designStarted
          ? 'in_progress'
          : 'not_started';

  const sourcingItems = snapshot.sourcingItems || [];
  const sourcingStarted = sourcingItems.length > 0 || !!snapshot.approvedDesign;
  const sourcingPct = sourcingPercent(snapshot);
  let sourcingStatus: AttentionLevel = 'not_started';
  if (sourcingPct >= 100 && sourcingItems.length > 0) sourcingStatus = 'complete';
  else if (sourcingItems.length > 0 && approvedSourcingCount(snapshot) === 0)
    sourcingStatus = 'needs_attention';
  else if (sourcingStarted) sourcingStatus = 'in_progress';

  const laborLen = (snapshot.laborTasks || []).length;
  const scopePct = scopingPercent(snapshot);
  let scopingStatus: AttentionLevel = 'not_started';
  if (laborLen > 0 && scopePct >= 100) scopingStatus = 'complete';
  else if (laborLen > 0 && scopePct < 100) scopingStatus = 'in_progress';
  else if (laborLen === 0 && approvedSourcingCount(snapshot) > 0) scopingStatus = 'needs_attention';

  const schedPct = schedulingPercent(snapshot);
  let schedulingStatus: AttentionLevel = 'not_started';
  if (schedPct >= 100) schedulingStatus = 'complete';
  else if (laborLen > 0) schedulingStatus = 'in_progress';
  else if (scopePct > 0) schedulingStatus = 'needs_attention';

  return [
    {
      area: 'design',
      label: 'Design your space',
      status: designStatus,
      message: designMessage(snapshot, designStatus),
      percentComplete: designPct,
      stepId: snapshot.approvedDesign ? 'review_design' : 'capture_photo',
    },
    {
      area: 'sourcing',
      label: 'Source materials',
      status: sourcingStatus,
      message: sourcingMessage(snapshot, sourcingStatus),
      percentComplete: sourcingPct,
      stepId: 'approve_materials',
    },
    {
      area: 'scoping',
      label: 'Scope the work',
      status: scopingStatus,
      message: scopingMessage(snapshot, scopingStatus),
      percentComplete: scopePct,
      stepId: 'confirm_scope',
    },
    {
      area: 'scheduling',
      label: 'Schedule labor',
      status: schedulingStatus,
      message: schedulingMessage(snapshot, schedulingStatus),
      percentComplete: schedPct,
      stepId: 'build_schedule',
    },
  ];
}

function designMessage(s: ProjectSnapshot, status: AttentionLevel): string {
  if (status === 'complete') return 'Design approved — ready for sourcing.';
  if (!hasPhoto(s)) return 'Add a photo of your space to get started.';
  if (!hasGeneratedDesign(s)) return 'Describe your vision and generate an AI concept.';
  if (!s.approvedDesign) return 'Review your design and approve a version.';
  return 'Continue shaping your design.';
}

function sourcingMessage(s: ProjectSnapshot, status: AttentionLevel): string {
  const n = (s.sourcingItems || []).length;
  const a = approvedSourcingCount(s);
  if (status === 'complete') return `All ${n} materials approved.`;
  if (n === 0) return 'Send your approved design to populate retailer suggestions.';
  if (a === 0) return `${n} items waiting — approve materials to continue.`;
  return `${a} of ${n} materials approved.`;
}

function scopingMessage(s: ProjectSnapshot, status: AttentionLevel): string {
  const ids = scopeSubtaskIds(s);
  const done = scopeCompletedCount(s);
  if (status === 'complete') return 'Scope complete — ready to schedule.';
  if ((s.laborTasks || []).length === 0) return 'Generate labor tasks from approved materials.';
  return `${done} of ${ids.length} scope items complete.`;
}

function schedulingMessage(s: ProjectSnapshot, status: AttentionLevel): string {
  if (status === 'complete') return 'Schedule built — project ready to execute.';
  if ((s.laborTasks || []).length === 0) return 'Complete scoping before scheduling.';
  return 'Build your day-by-day labor schedule.';
}

/** First step that still needs user action (TurboTax resume point). */
export function getRecommendedStep(snapshot: ProjectSnapshot): GuidedStepId {
  if (!snapshot.projectName?.trim()) return 'welcome';
  if (!hasPhoto(snapshot)) return 'capture_photo';
  if (!hasVision(snapshot)) return 'describe_vision';
  if (!snapshot.tweaks?.style) return 'pick_style';
  if (!snapshot.tweaks?.colorPalette) return 'pick_palette';
  if (!snapshot.tweaks?.layout) return 'pick_layout';
  if (!hasGeneratedDesign(snapshot)) return 'review_design';
  if (!snapshot.approvedDesign) return 'approve_design';
  if ((snapshot.sourcingItems || []).length === 0) return 'review_sourcing';
  if (approvedSourcingCount(snapshot) < (snapshot.sourcingItems || []).length) return 'approve_materials';
  if ((snapshot.laborTasks || []).length === 0) return 'confirm_scope';
  const scopeIds = scopeSubtaskIds(snapshot);
  if (scopeCompletedCount(snapshot) < scopeIds.length) return 'confirm_scope';
  if (!snapshot.hasSchedule) return 'build_schedule';
  return 'project_complete';
}

export function getStepIndex(stepId: GuidedStepId): number {
  return GUIDED_STEP_ORDER.indexOf(stepId);
}

export function getNextStep(current: GuidedStepId): GuidedStepId | null {
  const i = getStepIndex(current);
  if (i < 0 || i >= GUIDED_STEP_ORDER.length - 1) return null;
  return GUIDED_STEP_ORDER[i + 1];
}

export function getPreviousStep(current: GuidedStepId): GuidedStepId | null {
  const i = getStepIndex(current);
  if (i <= 0) return null;
  return GUIDED_STEP_ORDER[i - 1];
}

export function canAdvanceFromStep(stepId: GuidedStepId, snapshot: ProjectSnapshot): boolean {
  switch (stepId) {
    case 'welcome':
      return !!(snapshot.projectName?.trim());
    case 'capture_photo':
      return hasPhoto(snapshot);
    case 'describe_vision':
      return hasVision(snapshot);
    case 'pick_style':
      return !!snapshot.tweaks?.style;
    case 'pick_palette':
      return !!snapshot.tweaks?.colorPalette;
    case 'pick_layout':
      return !!snapshot.tweaks?.layout;
    case 'review_design':
      return hasGeneratedDesign(snapshot);
    case 'approve_design':
      return !!snapshot.approvedDesign;
    case 'review_sourcing':
      return (snapshot.sourcingItems || []).length > 0;
    case 'approve_materials':
      return (
        (snapshot.sourcingItems || []).length > 0 &&
        approvedSourcingCount(snapshot) === (snapshot.sourcingItems || []).length
      );
    case 'confirm_scope':
      return (snapshot.laborTasks || []).length > 0;
    case 'build_schedule':
      return !!snapshot.hasSchedule;
    case 'project_complete':
      return true;
    default:
      return false;
  }
}

export function overallProgressPercent(flags: AreaFlag[]): number {
  if (flags.length === 0) return 0;
  const sum = flags.reduce((s, f) => s + f.percentComplete, 0);
  return Math.round(sum / flags.length);
}

export function flagsNeedingAttention(flags: AreaFlag[]): AreaFlag[] {
  return flags.filter((f) => f.status === 'needs_attention' || f.status === 'in_progress');
}