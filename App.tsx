/**
 * Delta - AI-powered home remodeling assistant
 * Cross-platform (RN + Web) prototype
 */

import React, { useState } from 'react';
import { StatusBar, StyleSheet, View, TouchableOpacity, Text, useColorScheme, Alert, ScrollView, Image } from 'react-native';
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
  const [workerTradeFilter, setWorkerTradeFilter] = useState<'All' | string>('All');

  // Cross-platform photo carousels use RN ScrollView+Image (no Flickity, no web-only div/img).
  // This fixes web vs native differences in the worker dashboard: identical horizontal scroll/flick experience on iOS/Android/Web.
  // (Previously required external script + Platform conditionals for new worker dashboard.)

  if (!role) {
    return <OnboardingScreen onSelectRole={setRole} />;
  }

  if (role === 'worker') {
    // Interesting jobs for workers, filterable by trade
    const jobs = [
      {
        id: 'job1',
        title: 'Oak Street House - Kitchen Remodel',
        location: '123 Oak Street',
        trade: 'Carpentry',
        pay: '$25/hr • 10-14 hrs',
        estimatedCost: { low: 250, high: 350 },
        images: [
          '/test-images/before-after/before-1.jpg',
          '/test-images/before-after/after-1.jpg',
          '/ai-room-1.jpg',
          '/ai-room-2.jpg',
        ],
        tasks: [
          'Install new base and upper cabinets with soft-close hardware',
          'Build and install custom kitchen island with seating',
          'Hang pantry shelving and cabinet organizers',
          'Install crown molding, baseboards, and window casings',
        ],
      },
      {
        id: 'job2',
        title: 'Oak Street House - Electrical Rough-in',
        location: '123 Oak Street',
        trade: 'Electrical',
        pay: '$25/hr • 6-9 hrs',
        estimatedCost: { low: 150, high: 225 },
        images: [
          '/test-images/before-after/before-1.jpg',
          '/test-images/before-after/after-1.jpg',
          '/ai-room-2.jpg',
          '/ai-room-3.jpg',
        ],
        tasks: [
          'Run new 20A circuits for kitchen appliances and island',
          'Install boxes and wiring for 8 recessed lights',
          'Add GFCI protection and dedicated circuits for dishwasher & fridge',
          'Rough-in outlets, switches, and under-cabinet lighting',
        ],
      },
      {
        id: 'job3',
        title: 'Maple Ave - Full Interior Paint',
        location: '456 Maple Avenue',
        trade: 'Painting',
        pay: '$25/hr • 12-16 hrs',
        estimatedCost: { low: 300, high: 400 },
        images: [
          '/test-images/before-after/before-2.jpg',
          '/test-images/before-after/after-2.jpg',
          '/ai-room-1.jpg',
          '/ai-room-3.jpg',
        ],
        tasks: [
          'Prep walls, patch holes, and sand smooth',
          'Prime and paint all walls in warm white',
          'Cut in and paint trim, doors, and built-ins',
          'Apply two coats of durable cabinet paint in kitchen',
        ],
      },
      {
        id: 'job4',
        title: 'Riverside Bathroom - Flooring & Trim',
        location: '789 Riverside Drive',
        trade: 'Flooring',
        pay: '$25/hr • 7-10 hrs',
        estimatedCost: { low: 175, high: 250 },
        images: [
          '/test-images/before-after/before-2.jpg',
          '/test-images/before-after/after-2.jpg',
          '/ai-room-1.jpg',
          '/ai-room-2.jpg',
        ],
        tasks: [
          'Remove old vinyl and prep subfloor',
          'Install new luxury vinyl plank (LVP) with underlayment',
          'Install waterproof baseboards and door casings',
          'Cut and fit flooring around vanity and toilet',
        ],
      },
      {
        id: 'job5',
        title: 'Downtown Loft - Demo & Framing',
        location: '22 Main Street #3B',
        trade: 'Demolition',
        pay: '$25/hr • 8-11 hrs',
        estimatedCost: { low: 200, high: 275 },
        images: [
          '/test-images/before-after/before-3.jpg',
          '/test-images/before-after/after-3.jpg',
          '/ai-room-2.jpg',
          '/ai-room-3.jpg',
        ],
        tasks: [
          'Carefully demo old kitchen and non-load-bearing wall',
          'Remove and dispose of old cabinets, counters, and flooring',
          'Frame new opening for pass-through and island',
          'Build temporary supports and haul debris',
        ],
      },
      {
        id: 'job6',
        title: 'Cedar Lane - Master Bath Plumbing',
        location: '101 Cedar Lane',
        trade: 'Plumbing',
        pay: '$25/hr • 5-8 hrs',
        estimatedCost: { low: 125, high: 200 },
        images: [
          '/test-images/before-after/before-3.jpg',
          '/test-images/before-after/after-3.jpg',
          '/ai-room-1.jpg',
          '/ai-room-3.jpg',
        ],
        tasks: [
          'Relocate drain lines for new double vanity',
          'Install new P-traps, supply lines, and shutoff valves',
          'Rough-in for freestanding tub and shower valve',
          'Test all new lines for leaks before drywall',
        ],
      },
    ];

    const filteredJobs = workerTradeFilter === 'All'
      ? jobs
      : jobs.filter((j) => j.trade === workerTradeFilter);

    const trades = ['All', 'Carpentry', 'Electrical', 'Painting', 'Flooring', 'Demolition', 'Plumbing'];

    return (
      <View style={{ flex: 1, backgroundColor: '#f8f8f8' }}>
        {/* Header - constrained */}
        <View style={[styles.constrained, { paddingHorizontal: 20, paddingTop: 40, paddingBottom: 12 }]}>
          <Text style={{ fontSize: 32, fontWeight: '700', color: '#222', letterSpacing: -1 }}>Worker Dashboard</Text>
          <Text style={{ color: '#666', marginTop: 4, fontSize: 16 }}>$25/hr guaranteed • Pick jobs that match your trade</Text>
        </View>

        {/* Trade filter - constrained */}
        <View style={[styles.constrained, { paddingHorizontal: 20, marginBottom: 12 }]}>
          <Text style={{ fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 6 }}>Filter by trade</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {trades.map((trade) => (
              <TouchableOpacity
                key={trade}
                onPress={() => setWorkerTradeFilter(trade)}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  backgroundColor: workerTradeFilter === trade ? '#111' : '#fff',
                  borderRadius: 999,
                  marginRight: 8,
                  borderWidth: 1,
                  borderColor: workerTradeFilter === trade ? '#111' : '#eee',
                }}
              >
                <Text
                  style={{
                    color: workerTradeFilter === trade ? '#fff' : '#333',
                    fontWeight: '600',
                    fontSize: 14,
                  }}
                >
                  {trade}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Job list - constrained content width + flickable photos per project (cross-platform ScrollView) */}
        <ScrollView style={{ flex: 1 }}>
          <View style={[styles.constrained, { paddingHorizontal: 20, paddingBottom: 120 }]}>
            {filteredJobs.length === 0 ? (
              <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                <Text style={{ color: '#888' }}>No jobs match this filter right now.</Text>
              </View>
            ) : (
              filteredJobs.map((job) => (
                <View
                  key={job.id}
                  style={{
                    backgroundColor: '#fff',
                    borderRadius: 16,
                    padding: 18,
                    marginBottom: 16,
                    borderWidth: 1,
                    borderColor: '#eee',
                  }}
                >
                  {/* Cross-platform flickable/scrollable project photos (consistent iOS / Android / Web via RN primitives).
                       Horizontal scroll provides flick experience everywhere; no web-only DOM or external carousel lib. */}
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={{ height: 180, marginBottom: 12, borderRadius: 8, backgroundColor: '#f0f0f0' }}
                  >
                    {((job as any).images || []).map((src: string, i: number) => (
                      <Image
                        key={i}
                        source={{ uri: src }}
                        style={{ width: 240, height: 180, marginRight: 4, borderRadius: 4 }}
                        resizeMode="cover"
                      />
                    ))}
                  </ScrollView>

                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <View style={{ flex: 1, paddingRight: 12 }}>
                      <Text style={{ fontSize: 18, fontWeight: '700', color: '#222' }}>{job.title}</Text>
                      <Text style={{ color: '#666', marginTop: 3 }}>{job.location} • {job.pay}</Text>
                      <Text style={{ color: '#2e7d32', fontWeight: '700', marginTop: 4, fontSize: 15 }}>
                        Est. total: ${job.estimatedCost.low}–${job.estimatedCost.high} (ready to go)
                      </Text>
                    </View>
                    <View
                      style={{
                        backgroundColor: '#f1f1f1',
                        paddingHorizontal: 10,
                        paddingVertical: 3,
                        borderRadius: 999,
                      }}
                    >
                      <Text style={{ fontSize: 12, fontWeight: '700', color: '#333' }}>{job.trade}</Text>
                    </View>
                  </View>

                  <Text style={{ marginTop: 14, marginBottom: 6, fontWeight: '600', color: '#333' }}>
                    Tasks you'll handle:
                  </Text>
                  {job.tasks.map((task, index) => (
                    <Text key={index} style={{ marginLeft: 6, marginTop: 2, color: '#444', fontSize: 15 }}>
                      • {task}
                    </Text>
                  ))}

                  <TouchableOpacity
                    onPress={() =>
                      Alert.alert(
                        'Estimated cost locked in',
                        `Est. total pay ready: $${job.estimatedCost.low}–$${job.estimatedCost.high} at $25/hr.\n\nThanks! The owner has been notified. This job is ready to go.`,
                      )
                    }
                    style={{
                      marginTop: 16,
                      backgroundColor: '#FF385C',
                      paddingVertical: 13,
                      borderRadius: 14,
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>Claim job (cost ready)</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        </ScrollView>

        <View style={[styles.constrained, { paddingHorizontal: 20 }]}>
          <TouchableOpacity
            onPress={() => setRole(null)}
            style={{ marginTop: 8, padding: 14, backgroundColor: '#000', borderRadius: 12, alignItems: 'center' }}
          >
            <Text style={{ color: '#fff', fontWeight: '600' }}>Switch Role / Restart</Text>
          </TouchableOpacity>
        </View>
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
  constrained: {
    maxWidth: 720,
    width: '100%',
    alignSelf: 'center',
  },
});

export default App;
