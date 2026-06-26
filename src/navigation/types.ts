/**
 * Navigation types for Delta (React Navigation v6+ / v7 compatible).
 * Root stack + Bottom tabs for the owner flow (Sourcing / Scoping / Scheduling).
 * Worker dashboard remains outside the navigator for Phase 1 (role switch at App level).
 *
 * Usage:
 *   import type { TabParamList, RootStackParamList } from '../navigation/types';
 *   const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
 *   navigation.navigate('MainTabs');
 */

export type TabParamList = {
  Design: undefined;
  Sourcing: undefined;
  Scoping: undefined;
  Scheduling: undefined;
};

export type RootStackParamList = {
  MainTabs: undefined;
  // Future Phase 1/2 stack screens (modals, details, DesignStudio, Camera, JobDetail, etc.)
  // DesignStudio: { projectId?: string } | undefined;
  // JobDetail: { jobId: string };
};

/** Guided owner flow (primary path — replaces tabs). */
export type ProcessStackParamList = {
  GuidedProcess: { step?: import('../features/process/types').GuidedStepId } | undefined;
  ProjectProgress: undefined;
};

export type RootStackScreenProps<T extends keyof RootStackParamList> =
  import('@react-navigation/native-stack').NativeStackScreenProps<RootStackParamList, T>;

export type TabScreenProps<T extends keyof TabParamList> =
  import('@react-navigation/bottom-tabs').BottomTabScreenProps<TabParamList, T>;

// Convenience re-exports for typed hooks (optional, keeps consumers simple)
export type { NativeStackNavigationProp } from '@react-navigation/native-stack';
export type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
