import React from 'react';
import { View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import DesignStudioScreen from '../features/design/DesignStudioScreen';
import SourcingScreen from '../features/sourcing/SourcingScreen';
import ScopingScreen from '../features/scoping/ScopingScreen';
import LaborSchedulerScreen from '../features/labor/LaborSchedulerScreen';
import OwnerHeader from '../shared/OwnerHeader';
import ProjectPipelineBar from '../shared/ProjectPipelineBar';
import { useTheme } from '../shared/theme';
import type { TabParamList } from './types';

const Tab = createBottomTabNavigator<TabParamList>();

function TabRoutes() {
  const t = useTheme();

  return (
    <Tab.Navigator
      initialRouteName="Design"
      screenOptions={{
        headerShown: false,
        sceneStyle: { flex: 1 },
        tabBarActiveTintColor: t.colors.accent,
        tabBarInactiveTintColor: t.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: t.colors.tabBarBg,
          borderTopWidth: 1,
          borderTopColor: t.colors.border,
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
        options={{ tabBarLabel: '🎨 Design' }}
      />
      <Tab.Screen
        name="Sourcing"
        component={SourcingScreen}
        options={{ tabBarLabel: '🛒 Sourcing' }}
      />
      <Tab.Screen
        name="Scoping"
        component={ScopingScreen}
        options={{ tabBarLabel: '📐 Scoping' }}
      />
      <Tab.Screen
        name="Scheduling"
        component={LaborSchedulerScreen}
        options={{ tabBarLabel: '📅 Scheduling' }}
      />
    </Tab.Navigator>
  );
}

export default function TabNavigator() {
  return (
    <View style={styles.shell}>
      <OwnerHeader />
      <ProjectPipelineBar />
      <View style={styles.tabArea}>
        <TabRoutes />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1, minHeight: 0 },
  tabArea: { flex: 1, minHeight: 0 },
});