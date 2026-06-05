/**
 * Delta - AI-powered home remodeling assistant
 * Cross-platform (RN + Web) prototype
 */

import React, { useState } from 'react';
import { StatusBar, StyleSheet, View, TouchableOpacity, Text, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import OnboardingScreen from './src/onboarding/OnboardingScreen';
import DesignStudioScreen from './src/features/design/DesignStudioScreen';
import SourcingScreen from './src/features/sourcing/SourcingScreen';
import LaborSchedulerScreen from './src/features/labor/LaborSchedulerScreen';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <AppContent />
    </SafeAreaProvider>
  );
}

function AppContent() {
  const [role, setRole] = useState<'owner' | 'worker' | null>(null);
  const [tab, setTab] = useState<'design' | 'sourcing' | 'labor'>('design');

  if (!role) {
    return <OnboardingScreen onSelectRole={setRole} />;
  }

  if (role === 'worker') {
    // Phase 1 placeholder for worker role (expand in later phases)
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
        <Text style={{ fontSize: 28, fontWeight: '700' }}>Worker Dashboard</Text>
        <Text style={{ marginTop: 12, color: '#666', textAlign: 'center' }}>
          Join jobs, view assigned tasks, and manage your schedule.{'\n'}(Full UI coming in later phases)
        </Text>
        <TouchableOpacity onPress={() => setRole(null)} style={{ marginTop: 24, padding: 12, backgroundColor: '#000', borderRadius: 8 }}>
          <Text style={{ color: '#fff' }}>Switch Role / Restart</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Phase 1 improved custom tab bar (styled, icon-ish). Full react-nav prepared in src/navigation/ for later.
  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, tab === 'design' && styles.tabActive]}
          onPress={() => setTab('design')}
        >
          <Text style={[styles.tabText, tab === 'design' && styles.tabTextActive]}>🎨 Design</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === 'sourcing' && styles.tabActive]}
          onPress={() => setTab('sourcing')}
        >
          <Text style={[styles.tabText, tab === 'sourcing' && styles.tabTextActive]}>🛒 Sourcing</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === 'labor' && styles.tabActive]}
          onPress={() => setTab('labor')}
        >
          <Text style={[styles.tabText, tab === 'labor' && styles.tabTextActive]}>👷 Labor</Text>
        </TouchableOpacity>
      </View>

      {tab === 'design' && <DesignStudioScreen />}
      {tab === 'sourcing' && <SourcingScreen />}
      {tab === 'labor' && <LaborSchedulerScreen />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  tabActive: {
    borderBottomWidth: 3,
    borderBottomColor: '#FF385C',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#FF385C',
    fontWeight: '700',
  },
});

export default App;
