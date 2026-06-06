import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { View, Text, StyleSheet } from 'react-native';
import SourcingScreen from '../features/sourcing/SourcingScreen';
import ScopingScreen from '../features/scoping/ScopingScreen';
import LaborSchedulerScreen from '../features/labor/LaborSchedulerScreen';

// Real Tab.Navigator for owner phases (Sourcing / Scoping / Scheduling).
// Replaces the previous custom TouchableOpacity + state tabBar in App.tsx.
// See DEVELOPMENT_PLAN.md Phase 1. Uses bottom tabs (standard RN pattern; works via RNW on web).
// Initial route set to Scoping to match previous default state.
// Labels preserve the recent custom tab labels (with emojis) per request.
// Header disabled for clean look matching the prior top-bar tabs implementation.
// NavigationContainer is local here (owner-only usage); safe for role switching since component mounts/unmounts.
const Tab = createBottomTabNavigator();

export default function MainTabNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        initialRouteName="Scoping"
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
            fontSize: 12,
            fontWeight: '600',
          },
        }}
      >
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
    </NavigationContainer>
  );
}

// Legacy icon styles retained from stub (for potential future icon-based tabs or reference).
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
