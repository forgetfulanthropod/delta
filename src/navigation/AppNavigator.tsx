import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TabNavigator from './TabNavigator';
import type { RootStackParamList } from './types';

// Root navigator: Stack + Bottom Tabs (per Phase 1 spec).
// - NavigationContainer lives here so owner flow has a single container.
// - A minimal stack today hosts the TabNavigator as "MainTabs".
// - This structure allows future stack screens (DesignStudio, details, modals) to be added
//   without restructuring the tabs or changing how App.tsx switches roles.
// - SafeAreaProvider remains at the true App root (in App.tsx) — standard and required for
//   react-native-safe-area-context + screens on both native and web.
//
// Worker role in App.tsx is deliberately left outside the navigator (large dashboard with
// its own filters/carousels/claiming). Role switch unmounts/remounts the owner nav tree —
// acceptable for the prototype and keeps worker code untouched.

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'default',
        }}
      >
        <Stack.Screen
          name="MainTabs"
          component={TabNavigator}
          options={{ title: 'Delta' }}
        />
        {/* Phase 1+ future stack routes go here, e.g.:
          <Stack.Screen name="DesignStudio" component={DesignStudioScreen} />
          <Stack.Screen name="JobDetail" component={JobDetailScreen} />
        */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
