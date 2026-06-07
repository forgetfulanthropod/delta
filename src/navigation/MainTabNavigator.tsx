/**
 * Compatibility shim for previous imports of MainTabNavigator.
 * Real implementation lives in TabNavigator.tsx (bottom tabs) + AppNavigator.tsx (root stack).
 * Phase 1 structure requested: AppNavigator.tsx, TabNavigator.tsx, + types.
 *
 * Safe to remove once all references are updated to the new names.
 */
export { default } from './TabNavigator';
export type { TabParamList, RootStackParamList } from './types';
