import React from 'react';
import { View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import DesignStudioScreen from '../features/design/DesignStudioScreen';
import SourcingScreen from '../features/sourcing/SourcingScreen';
import ScopingScreen from '../features/scoping/ScopingScreen';
import LaborSchedulerScreen from '../features/labor/LaborSchedulerScreen';
import OwnerHeader from '../shared/OwnerHeader';
import ProjectPipelineBar from '../shared/ProjectPipelineBar';
import type { TabParamList } from './types';

// Typed bottom tab navigator for the three core owner phases.
// Matches the requested top-bar nav: Sourcing / Scoping / Scheduling.
// Scoping is the initial route (per design priority: selected design + scope tree + burndown visible first).
// Emoji labels preserved from the prior custom tab implementation for visual continuity.
// headerShown: false keeps the clean full-screen content area (ConstrainedView + shared components handle internal layout).
// Tab bar styling is minimal and cross-platform (RNW renders a usable web bar; native is native).

const Tab = createBottomTabNavigator<TabParamList>();

export default function TabNavigator() {
  return (
    <View style={{ flex: 1 }}>
      <OwnerHeader />
      <ProjectPipelineBar />
      <Tab.Navigator
        initialRouteName="Design"
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#FF385C',
          tabBarInactiveTintColor: '#666',
          tabBarStyle: {
            backgroundColor: '#fff',
            borderTopWidth: 1,
            borderTopColor: '#eee',
            paddingVertical: 4,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
          },
        }}
      >
        <Tab.Screen
          name="Design"
          component={DesignStudioScreen}
          options={{
            tabBarLabel: '🎨 Design',
          }}
        />
        <Tab.Screen
          name="Sourcing"
          component={SourcingScreen}
          options={{
            tabBarLabel: '🛒 Sourcing',
          }}
        />
        <Tab.Screen
          name="Scoping"
          component={ScopingScreen}
          options={{
            tabBarLabel: '📐 Scoping',
          }}
        />
        <Tab.Screen
          name="Scheduling"
          component={LaborSchedulerScreen}
          options={{
            tabBarLabel: '📅 Scheduling',
          }}
        />
      </Tab.Navigator>
    </View>
  );
}
