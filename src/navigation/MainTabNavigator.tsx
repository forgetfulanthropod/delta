import React from 'react';
// @ts-nocheck - prepared for future; @react-navigation/* removed temporarily for web bundle stability (see plan)
// import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';
import DesignStudioScreen from '../features/design/DesignStudioScreen';
import SourcingScreen from '../features/sourcing/SourcingScreen';
import LaborSchedulerScreen from '../features/labor/LaborSchedulerScreen';

// Stub for future wiring of react-navigation (see DEVELOPMENT_PLAN.md Phase 1/4)
// When re-adding deps, uncomment and use real Tab.Navigator
export default function MainTabNavigator() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Navigation placeholder (react-nav prepared but not active - using custom tabs in App.tsx)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  iconActive: {
    // could add more
  },
  iconText: {
    fontSize: 20,
    opacity: 0.6,
  },
  iconTextActive: {
    opacity: 1,
  },
});
