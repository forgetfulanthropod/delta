/**
 * Delta - AI-powered home remodeling assistant
 * Cross-platform (RN + Web) prototype
 */

import React, { useState, useEffect } from 'react';
import { StatusBar, useColorScheme, View, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import OnboardingScreen from './src/onboarding/OnboardingScreen';
import AppNavigator from './src/navigation/AppNavigator';
import WorkerDashboardScreen from './src/features/worker/WorkerDashboardScreen';
import { AppRoleProvider, useAppRole } from './src/context/AppRoleContext';
import { useDeltaStore } from './src/store/useDeltaStore';

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const [role, setRole] = useState<'owner' | 'worker' | null>(null);

  return (
    <SafeAreaProvider style={styles.safeRoot}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <AppRoleProvider role={role} setRole={setRole}>
        <AppContent />
      </AppRoleProvider>
    </SafeAreaProvider>
  );
}

function AppContent() {
  const { role, setRole } = useAppRole();
  const { currentProjectId, createProject } = useDeltaStore();

  useEffect(() => {
    if (role === 'owner' && !currentProjectId) {
      createProject('My Remodel');
    }
  }, [role, currentProjectId, createProject]);

  if (!role) {
    return <OnboardingScreen onSelectRole={setRole} />;
  }

  if (role === 'worker') {
    return <WorkerDashboardScreen />;
  }

  return (
    <View style={styles.ownerShell}>
      <AppNavigator />
    </View>
  );
}

const styles = StyleSheet.create({
  safeRoot: { flex: 1, minHeight: 0, height: '100%' },
  ownerShell: { flex: 1, minHeight: 0, height: '100%' },
});

export default App;