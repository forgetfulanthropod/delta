import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';
import DesignStudioScreen from '../features/design/DesignStudioScreen';
import SourcingScreen from '../features/sourcing/SourcingScreen';
import LaborSchedulerScreen from '../features/labor/LaborSchedulerScreen';

const Tab = createBottomTabNavigator();

function TabBarIcon({ name, focused }: { name: string; focused: boolean }) {
  return (
    <View style={[styles.iconContainer, focused && styles.iconActive]}>
      <Text style={[styles.iconText, focused && styles.iconTextActive]}>
        {name === 'Design' ? '🎨' : name === 'Sourcing' ? '🛒' : '👷'}
      </Text>
    </View>
  );
}

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => (
          <TabBarIcon name={route.name} focused={focused} />
        ),
        tabBarActiveTintColor: '#FF385C',
        tabBarInactiveTintColor: '#888',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#eee',
          paddingBottom: 4,
          height: 60,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Design" component={DesignStudioScreen} />
      <Tab.Screen name="Sourcing" component={SourcingScreen} />
      <Tab.Screen name="Labor" component={LaborSchedulerScreen} />
    </Tab.Navigator>
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
