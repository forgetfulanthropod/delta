/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useState } from 'react';
import { StatusBar, StyleSheet, View, Button } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import LaborSchedulerScreen from './src/features/labor/LaborSchedulerScreen';
import DesignStudioScreen from './src/features/design/DesignStudioScreen';
import SourcingScreen from './src/features/sourcing/SourcingScreen';
import OnboardingScreen from './src/onboarding/OnboardingScreen';

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

  return (
    <View style={styles.container}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-around', padding: 8, backgroundColor: '#eee' }}>
        <Button title="Design" onPress={() => setTab('design')} />
        <Button title="Sourcing" onPress={() => setTab('sourcing')} />
        <Button title="Labor" onPress={() => setTab('labor')} />
      </View>

      {tab === 'design' && <DesignStudioScreen />}
      {tab === 'sourcing' && <SourcingScreen />}
      {tab === 'labor' && <LaborSchedulerScreen />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
