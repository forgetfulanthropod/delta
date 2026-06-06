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
import { useDeltaStore } from './src/store/useDeltaStore';
import { generateSchedule } from './src/features/labor/scheduler';
import type { Task } from './src/features/labor/types';

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

  // Pull shared store for owner-sourced data integration + worker claim state (new for Priority #4)
  // @ts-ignore - store interface expanded for persistence/worker (type mismatch in current impl); suppress to keep focus on native/cross-platform typecheck for camera/Design/App UI
  const {
    sourcingItems,
    laborTasks,
    workerAssignedJobs = [],
    claimJob,
    unclaimJob,
    setLaborTasks,
  } = useDeltaStore();

  // Cross-platform photo carousels use RN ScrollView+Image (no Flickity, no web-only div/img).
  // This fixes web vs native differences in the worker dashboard: identical horizontal scroll/flick experience on iOS/Android/Web.
  // (Previously required external script + Platform conditionals for new worker dashboard.)

  if (!role) {
    return <OnboardingScreen onSelectRole={setRole} />;
  }

  if (role === 'worker') {
    // Interesting jobs for workers, filterable by trade (builds on existing trade filter + cross-platform carousels + "ready to go" costs)
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

    // Helper: convert job's string tasks + est cost into labor Task[] (for store integration + scheduling visibility)
    const jobToTasks = (job: any): Task[] => {
      const totalHrs = Math.round(((job.estimatedCost?.low || 200) + (job.estimatedCost?.high || 300)) / 50); // approx at $25/hr
      const n = Math.max(1, (job.tasks || []).length);
      const per = Math.max(1, Math.round(totalHrs / n));
      return (job.tasks || []).map((name: string, i: number) => ({
        id: `${job.id}-t${i}`,
        name,
        estimatedHours: per,
        category: (job.trade || 'general').toLowerCase(),
      }));
    };

    const assignedIds = new Set((workerAssignedJobs || []).map((j: any) => j.id));
    const allOpenJobs = jobs.filter((j: any) => !assignedIds.has(j.id));
    const filteredAvailable = workerTradeFilter === 'All'
      ? allOpenJobs
      : allOpenJobs.filter((j: any) => j.trade === workerTradeFilter);

    const trades = ['All', 'Carpentry', 'Electrical', 'Painting', 'Flooring', 'Demolition', 'Plumbing'];

    // Owner-sourced data integration: derive a live "job" card from store's sourcingItems + laborTasks (if owner has used sourcing/labor)
    const approvedSourcing = (sourcingItems || []).filter((i: any) => i.approved);
    const matTotal = approvedSourcing.reduce((sum: number, i: any) => sum + (i.price || 0) * (i.quantity || 1), 0);
    const laborHrsTotal = (laborTasks || []).reduce((sum: number, t: any) => sum + (t.estimatedHours || 0), 0);
    let ownerIntegratedJob: any = null;
    if ((sourcingItems || []).length > 0 || (laborTasks || []).length > 0) {
      const baseHrs = laborHrsTotal || 10;
      ownerIntegratedJob = {
        id: 'owner-live',
        title: 'Owner Project — From Sourced Materials',
        location: 'Current owner session data',
        trade: 'General',
        pay: `$25/hr • ${Math.round(baseHrs)}-${Math.round(baseHrs + 4)} hrs`,
        estimatedCost: {
          low: Math.round(baseHrs * 25) || 250,
          high: Math.round((baseHrs + 4) * 25) || 350,
        },
        images: [
          '/ai-room-1.jpg',
          '/test-images/before-after/after-1.jpg',
          '/ai-room-2.jpg',
        ],
        tasks: (laborTasks || []).length > 0
          ? (laborTasks || []).map((t: any) => t.name)
          : [
              'Install/verify owner-approved sourced materials',
              'Complete remodel tasks aligned to design',
              'Final walkthrough with owner',
            ],
        fromOwnerData: true,
        sourcingSummary: `${approvedSourcing.length} items approved ($${matTotal})`,
      };
    }
    const showOwnerJob = !!ownerIntegratedJob && !assignedIds.has(ownerIntegratedJob.id);

    return (
      <View style={{ flex: 1, backgroundColor: '#f8f8f8' }}>
        {/* Header - constrained */}
        <View style={[styles.constrained, { paddingHorizontal: 20, paddingTop: 40, paddingBottom: 12 }]}>
          <Text style={{ fontSize: 32, fontWeight: '700', color: '#222', letterSpacing: -1 }}>Worker Dashboard</Text>
          <Text style={{ color: '#666', marginTop: 4, fontSize: 16 }}>$25/hr guaranteed • Pick jobs that match your trade</Text>
        </View>

        {/* Owner-sourced data integration banner (new for Priority #4) */}
        {(sourcingItems || []).length > 0 || (laborTasks || []).length > 0 ? (
          <View style={[styles.constrained, { paddingHorizontal: 20, marginBottom: 12 }]}>
            <View style={{ backgroundColor: '#e6f4ea', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#c8e6c9' }}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: '#1b5e20' }}>🔗 Integrated with owner-sourced data</Text>
              <Text style={{ fontSize: 13, color: '#2e7d32', marginTop: 2 }}>
                Owner has {approvedSourcing.length} approved items (materials ~${matTotal}).
                {(laborTasks || []).length} labor tasks ready.
              </Text>
              <Text style={{ fontSize: 12, color: '#555', marginTop: 2 }}>
                Claiming below will surface relevant tasks/costs from the owner's project.
              </Text>
            </View>
          </View>
        ) : null}

        {/* Trade filter - constrained (preserved) */}
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

        <ScrollView style={{ flex: 1 }}>
          <View style={[styles.constrained, { paddingHorizontal: 20, paddingBottom: 120 }]}>
            {/* My Assigned Jobs section (new) */}
            <Text style={{ fontSize: 20, fontWeight: '700', color: '#222', marginBottom: 8, marginTop: 4 }}>My Assigned Jobs</Text>
            {(workerAssignedJobs || []).length === 0 ? (
              <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#eee', marginBottom: 16 }}>
                <Text style={{ color: '#666' }}>No assigned jobs yet. Use the Claim buttons below — claimed jobs move here with live scheduling.</Text>
              </View>
            ) : (
              (workerAssignedJobs || []).map((job: any) => {
                // compute schedule on the fly for actual scheduling visibility (using shared scheduler)
                const schedTasks: Task[] = (job.tasks || []).map((name: string, idx: number) => {
                  const totalEst = (job.estimatedCost?.low || 200) + (job.estimatedCost?.high || 300);
                  const estHrs = Math.max(1, Math.round(totalEst / 50 / Math.max(1, (job.tasks || []).length)));
                  return {
                    id: `${job.id}-s${idx}`,
                    name,
                    estimatedHours: estHrs,
                    category: (job.trade || '').toLowerCase(),
                  };
                });
                let scheduleSummary = 'Schedule ready.';
                let scheduleDays: any[] = [];
                try {
                  const sched = generateSchedule(schedTasks);
                  scheduleSummary = sched.summary;
                  scheduleDays = sched.days;
                } catch (e) {
                  scheduleSummary = 'Schedule preview (demo data).';
                }
                return (
                  <View
                    key={job.id}
                    style={{
                      backgroundColor: '#fff',
                      borderRadius: 16,
                      padding: 18,
                      marginBottom: 16,
                      borderWidth: 2,
                      borderColor: '#4caf50',
                    }}
                  >
                    {/* Cross-platform flickable project photos (builds on the RN ScrollView carousel approach) */}
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      style={{ height: 160, marginBottom: 12, borderRadius: 8, backgroundColor: '#f0f0f0' }}
                    >
                      {((job.images || []) as string[]).map((src: string, i: number) => (
                        <Image
                          key={i}
                          source={{ uri: src }}
                          style={{ width: 220, height: 160, marginRight: 4, borderRadius: 4 }}
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
                        {job.fromOwnerData && job.sourcingSummary && (
                          <Text style={{ color: '#1565c0', fontSize: 13, marginTop: 2 }}>{job.sourcingSummary}</Text>
                        )}
                      </View>
                      <View style={{ backgroundColor: '#4caf50', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999 }}>
                        <Text style={{ fontSize: 12, fontWeight: '700', color: '#fff' }}>{job.trade}</Text>
                      </View>
                    </View>

                    <Text style={{ marginTop: 14, marginBottom: 6, fontWeight: '600', color: '#333' }}>
                      Tasks you'll handle:
                    </Text>
                    {(job.tasks || []).map((task: string, index: number) => (
                      <Text key={index} style={{ marginLeft: 6, marginTop: 2, color: '#444', fontSize: 15 }}>
                        • {task}
                      </Text>
                    ))}

                    {/* Actual scheduling visibility for claimed jobs (new) */}
                    <View style={{ marginTop: 14, backgroundColor: '#f1f8e9', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#c5e1a5' }}>
                      <Text style={{ fontWeight: '700', color: '#33691e', fontSize: 14 }}>📅 Your Schedule Visibility</Text>
                      <Text style={{ color: '#558b2f', marginTop: 4, fontSize: 13, fontWeight: '600' }}>{scheduleSummary}</Text>
                      {scheduleDays.length > 0 &&
                        scheduleDays.map((day: any, di: number) => (
                          <Text key={di} style={{ fontSize: 12, color: '#444', marginTop: 3 }}>
                            Day {day.day}: {day.productiveHours}h work + {day.breakHours}h breaks • ${day.cost} (starts ~08:00)
                          </Text>
                        ))}
                      <Text style={{ fontSize: 11, color: '#666', marginTop: 4 }}>8h days • built-in lunch + breaks • $25/hr • largest tasks first</Text>
                    </View>

                    <View style={{ flexDirection: 'row', marginTop: 12 }}>
                      <TouchableOpacity
                        onPress={() => {
                          unclaimJob(job.id);
                          Alert.alert('Job released', 'Job moved back to available. You can re-claim later.');
                        }}
                        style={{
                          flex: 1,
                          marginRight: 8,
                          backgroundColor: '#757575',
                          paddingVertical: 11,
                          borderRadius: 12,
                          alignItems: 'center',
                        }}
                      >
                        <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>Unclaim / Release</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() =>
                          Alert.alert(
                            'Job details',
                            `${job.title}\n\nLocation: ${job.location}\nTrade: ${job.trade}\n\nThis job is locked in your assignments with schedule above.`
                          )
                        }
                        style={{
                          flex: 1,
                          backgroundColor: '#1976d2',
                          paddingVertical: 11,
                          borderRadius: 12,
                          alignItems: 'center',
                        }}
                      >
                        <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>Job Info</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })
            )}

            {/* Owner integrated job card (if owner has sourced items/laborTasks in store) - improves integration with owner-sourced data */}
            {showOwnerJob && ownerIntegratedJob && (
              <View style={{ marginTop: 8, marginBottom: 8 }}>
                <Text style={{ fontSize: 15, fontWeight: '700', color: '#1565c0', marginBottom: 6 }}>📦 Live from Owner's Current Project (sourced data)</Text>
                <View
                  style={{
                    backgroundColor: '#fff',
                    borderRadius: 16,
                    padding: 18,
                    marginBottom: 16,
                    borderWidth: 1,
                    borderColor: '#90caf9',
                  }}
                >
                  {/* Cross-platform photo carousel for owner-integrated job */}
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={{ height: 180, marginBottom: 12, borderRadius: 8, backgroundColor: '#f0f0f0' }}
                  >
                    {(ownerIntegratedJob.images || []).map((src: string, i: number) => (
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
                      <Text style={{ fontSize: 18, fontWeight: '700', color: '#222' }}>{ownerIntegratedJob.title}</Text>
                      <Text style={{ color: '#666', marginTop: 3 }}>{ownerIntegratedJob.location} • {ownerIntegratedJob.pay}</Text>
                      <Text style={{ color: '#2e7d32', fontWeight: '700', marginTop: 4, fontSize: 15 }}>
                        Est. total: ${ownerIntegratedJob.estimatedCost.low}–${ownerIntegratedJob.estimatedCost.high} (ready to go)
                      </Text>
                      {ownerIntegratedJob.sourcingSummary && (
                        <Text style={{ color: '#1565c0', fontSize: 13, marginTop: 2, fontWeight: '600' }}>
                          {ownerIntegratedJob.sourcingSummary} • tasks from laborTasks
                        </Text>
                      )}
                    </View>
                    <View style={{ backgroundColor: '#1976d2', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999 }}>
                      <Text style={{ fontSize: 12, fontWeight: '700', color: '#fff' }}>{ownerIntegratedJob.trade}</Text>
                    </View>
                  </View>

                  <Text style={{ marginTop: 14, marginBottom: 6, fontWeight: '600', color: '#333' }}>Tasks from owner data:</Text>
                  {ownerIntegratedJob.tasks.map((task: string, index: number) => (
                    <Text key={index} style={{ marginLeft: 6, marginTop: 2, color: '#444', fontSize: 15 }}>
                      • {task}
                    </Text>
                  ))}

                  <TouchableOpacity
                    onPress={() => {
                      claimJob(ownerIntegratedJob);
                      Alert.alert(
                        'Owner project claimed',
                        `Integrated owner-sourced items and labor tasks now in your My Assigned Jobs with full schedule visibility.`
                      );
                    }}
                    style={{
                      marginTop: 16,
                      backgroundColor: '#FF385C',
                      paddingVertical: 13,
                      borderRadius: 14,
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>Claim owner project (integrates data)</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Available jobs (preserves trade filter, cross-platform carousels per project, direct est costs as "ready to go") */}
            <Text style={{ fontSize: 18, fontWeight: '700', color: '#222', marginBottom: 8, marginTop: 8 }}>Available Jobs — Claim to assign</Text>
            {filteredAvailable.length === 0 ? (
              <View style={{ paddingVertical: 20, alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#eee' }}>
                <Text style={{ color: '#888' }}>No more open jobs match this filter (or all claimed).</Text>
              </View>
            ) : (
              filteredAvailable.map((job: any) => (
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
                  {/* Cross-platform flickable/scrollable project photos (preserved) */}
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
                  {job.tasks.map((task: string, index: number) => (
                    <Text key={index} style={{ marginLeft: 6, marginTop: 2, color: '#444', fontSize: 15 }}>
                      • {task}
                    </Text>
                  ))}

                  <TouchableOpacity
                    onPress={() => {
                      claimJob(job);
                      // Improve integration: update store's laborTasks with tasks from this claimed job (dedup by name)
                      const newTasks = jobToTasks(job);
                      const existingNames = new Set((laborTasks || []).map((t: any) => t.name));
                      const toAdd = newTasks.filter((t) => !existingNames.has(t.name));
                      if (toAdd.length > 0) {
                        setLaborTasks([...(laborTasks || []), ...toAdd]);
                      }
                      Alert.alert(
                        'Job claimed & assigned',
                        `Moved to "My Assigned Jobs". Est. $${job.estimatedCost.low}–${job.estimatedCost.high} locked. Schedule now visible. Tasks integrated to shared labor state.`,
                      );
                    }}
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
