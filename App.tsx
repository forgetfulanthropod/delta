/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import { StatusBar, StyleSheet, useColorScheme, View, Button } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import LaborSchedulerScreen from './src/features/labor/LaborSchedulerScreen';
import DesignStudioScreen from './src/features/design/DesignStudioScreen';
import SourcingScreen from './src/features/sourcing/SourcingScreen';

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
  const [tab, setTab] = React.useState<'design' | 'sourcing' | 'labor'>('design');

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
