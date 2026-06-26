/**
 * Barrel for Phase 1 shared (theme + components) + pre-existing compat.
 */
export * from './theme';
export { default as theme } from './theme';

export * from './media';
export { default as ReadyToGoCostPill } from './ReadyToGoCostPill';
export { default as ProjectHero } from './ProjectHero';
export { default as AppButton } from './AppButton';

export { default as ConstrainedView } from './ConstrainedView';
export { default as PrimaryButton } from './PrimaryButton';
export { default as SecondaryButton } from './SecondaryButton';
export { default as Card } from './Card';
export { JobCard, ScopeCard } from './Card';
export { default as SectionHeader } from './SectionHeader';
export { default as Pill } from './Pill';
export { default as EmptyState } from './EmptyState';
export { default as ProjectSwitcher } from './ProjectSwitcher';
export { default as OwnerHeader } from './OwnerHeader';
export { default as ProjectPipelineBar } from './ProjectPipelineBar';
export { default as ElegantImage } from './ElegantImage';
export { useBackendHealth } from './useBackendHealth';
export { apiUrl, getApiBaseUrl } from './api';
