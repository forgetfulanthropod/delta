import React from 'react';
import { View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import OwnerHeader from '../shared/OwnerHeader';
import GuidedProcessScreen from '../features/process/GuidedProcessScreen';
import ProjectProgressScreen from '../features/process/ProjectProgressScreen';
import type { ProcessStackParamList } from './types';

const Stack = createNativeStackNavigator<ProcessStackParamList>();

/**
 * Owner primary experience: TurboTax-style guided process (one question at a time)
 * plus a dedicated project progress overview with attention flags.
 * Replaces bottom-tab navigation for the owner role.
 */
export default function ProcessNavigator() {
  return (
    <View style={styles.root}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="GuidedProcess"
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
            contentStyle: { flex: 1 },
          }}
        >
          <Stack.Screen name="GuidedProcess" component={GuidedProcessShell} />
          <Stack.Screen name="ProjectProgress" component={ProjectProgressShell} />
        </Stack.Navigator>
      </NavigationContainer>
    </View>
  );
}

function GuidedProcessShell() {
  return (
    <View style={styles.shell}>
      <OwnerHeader />
      <View style={styles.content}>
        <GuidedProcessScreen />
      </View>
    </View>
  );
}

function ProjectProgressShell() {
  return (
    <View style={styles.shell}>
      <OwnerHeader />
      <View style={styles.content}>
        <ProjectProgressScreen />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, minHeight: 0 },
  shell: { flex: 1, minHeight: 0 },
  content: { flex: 1, minHeight: 0 },
});