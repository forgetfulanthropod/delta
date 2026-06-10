import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDeltaStore } from '../../store/useDeltaStore';
import { generateSchedule } from '../labor/scheduler';
import type { Task } from '../labor/types';
import { useTheme } from '../../shared/theme';
import { getImageSource } from '../../shared/media';
import { ConstrainedView } from '../../shared';
import { useAppRole } from '../../context/AppRoleContext';

const DEMO_JOBS = [
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

const TRADES = ['All', 'Carpentry', 'Electrical', 'Painting', 'Flooring', 'Demolition', 'Plumbing'];

function jobToTasks(job: any): Task[] {
  const totalHrs = Math.round(
    ((job.estimatedCost?.low || 200) + (job.estimatedCost?.high || 300)) / 50,
  );
  const n = Math.max(1, (job.tasks || []).length);
  const per = Math.max(1, Math.round(totalHrs / n));
  return (job.tasks || []).map((name: string, i: number) => ({
    id: `${job.id}-t${i}`,
    name,
    estimatedHours: per,
    category: (job.trade || 'general').toLowerCase(),
  }));
}

function PhotoCarousel({ images, height = 160 }: { images: string[]; height?: number }) {
  const t = useTheme();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={[styles.carousel, { height, backgroundColor: t.colors.surfaceAlt }]}
    >
      {(images || []).map((src, i) => (
        <Image
          key={i}
          source={getImageSource(src)}
          style={{ width: height * 1.4, height, marginRight: 4, borderRadius: 4 }}
          resizeMode="cover"
        />
      ))}
    </ScrollView>
  );
}

export default function WorkerDashboardScreen() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const { setRole } = useAppRole();
  const [tradeFilter, setTradeFilter] = useState<string>('All');

  const {
    sourcingItems,
    laborTasks,
    workerAssignedJobs = [],
    claimJob,
    unclaimJob,
    setLaborTasks,
    approvedDesign,
  } = useDeltaStore();

  const assignedIds = new Set((workerAssignedJobs || []).map((j: any) => j.id));
  const allOpenJobs = DEMO_JOBS.filter((j) => !assignedIds.has(j.id));
  const filteredAvailable =
    tradeFilter === 'All' ? allOpenJobs : allOpenJobs.filter((j) => j.trade === tradeFilter);

  const approvedSourcing = (sourcingItems || []).filter((i: any) => i.approved);
  const matTotal = approvedSourcing.reduce(
    (sum: number, i: any) => sum + (i.price || 0) * (i.quantity || 1),
    0,
  );
  const laborHrsTotal = (laborTasks || []).reduce(
    (sum: number, lt: any) => sum + (lt.estimatedHours || 0),
    0,
  );

  let ownerIntegratedJob: any = null;
  if ((sourcingItems || []).length > 0 || (laborTasks || []).length > 0) {
    const baseHrs = laborHrsTotal || 10;
    const heroImage = approvedDesign?.imageUri || '/ai-room-1.jpg';
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
      images: [heroImage, '/test-images/before-after/after-1.jpg', '/ai-room-2.jpg'],
      tasks:
        (laborTasks || []).length > 0
          ? (laborTasks || []).map((lt: any) => lt.name)
          : [
              'Install/verify owner-approved sourced materials',
              'Complete remodel tasks aligned to design',
              'Final walkthrough with owner',
            ],
      fromOwnerData: true,
      sourcingSummary: `${approvedSourcing.length} items approved ($${matTotal})`,
    };
  }

  const showOwnerJob =
    !!ownerIntegratedJob &&
    !assignedIds.has(ownerIntegratedJob.id) &&
    (tradeFilter === 'All' || ownerIntegratedJob.trade === tradeFilter);

  const renderJobCard = (job: any, opts: { assigned?: boolean; claimable?: boolean } = {}) => {
    const { assigned, claimable } = opts;
    const schedTasks: Task[] = (job.tasks || []).map((name: string, idx: number) => {
      const totalEst = (job.estimatedCost?.low || 200) + (job.estimatedCost?.high || 300);
      const estHrs = Math.max(
        1,
        Math.round(totalEst / 50 / Math.max(1, (job.tasks || []).length)),
      );
      return {
        id: `${job.id}-s${idx}`,
        name,
        estimatedHours: estHrs,
        category: (job.trade || '').toLowerCase(),
      };
    });
    let scheduleSummary = 'Schedule ready.';
    let scheduleDays: any[] = [];
    if (assigned) {
      try {
        const sched = generateSchedule(schedTasks);
        scheduleSummary = sched.summary;
        scheduleDays = sched.days;
      } catch {
        scheduleSummary = 'Schedule preview (demo data).';
      }
    }

    return (
      <View
        key={job.id}
        style={[
          styles.card,
          {
            backgroundColor: t.colors.cardBg,
            borderColor: assigned ? t.colors.workerClaim || '#4caf50' : t.colors.border,
            borderWidth: assigned ? 2 : 1,
          },
        ]}
      >
        <PhotoCarousel images={job.images} height={assigned ? 160 : 180} />

        <View style={styles.cardHeader}>
          <View style={{ flex: 1, paddingRight: 12 }}>
            <Text style={[styles.cardTitle, { color: t.colors.text }]}>{job.title}</Text>
            <Text style={{ color: t.colors.textSecondary, marginTop: 3 }}>
              {job.location} • {job.pay}
            </Text>
            <Text style={{ color: t.colors.success, fontWeight: '700', marginTop: 4, fontSize: 15 }}>
              Est. total: ${job.estimatedCost.low}–${job.estimatedCost.high} (ready to go)
            </Text>
            {job.fromOwnerData && job.sourcingSummary && (
              <Text style={{ color: '#1565c0', fontSize: 13, marginTop: 2 }}>
                {job.sourcingSummary}
              </Text>
            )}
          </View>
          <View
            style={{
              backgroundColor: assigned ? t.colors.workerClaim : t.colors.surfaceAlt,
              paddingHorizontal: 10,
              paddingVertical: 3,
              borderRadius: 999,
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: '700',
                color: assigned ? '#fff' : t.colors.text,
              }}
            >
              {job.trade}
            </Text>
          </View>
        </View>

        <Text style={[styles.tasksLabel, { color: t.colors.text }]}>Tasks you'll handle:</Text>
        {(job.tasks || []).map((task: string, index: number) => (
          <Text key={index} style={{ marginLeft: 6, marginTop: 2, color: t.colors.textSecondary, fontSize: 15 }}>
            • {task}
          </Text>
        ))}

        {assigned && (
          <View
            style={[
              styles.scheduleBox,
              {
                backgroundColor: t.colors.successLight,
                borderColor: t.colors.pillBorder,
              },
            ]}
          >
            <Text style={{ fontWeight: '700', color: t.colors.success, fontSize: 14 }}>
              📅 Your Schedule Visibility
            </Text>
            <Text style={{ color: t.colors.success, marginTop: 4, fontSize: 13, fontWeight: '600' }}>
              {scheduleSummary}
            </Text>
            {scheduleDays.map((day: any, di: number) => (
              <Text key={di} style={{ fontSize: 12, color: t.colors.textSecondary, marginTop: 3 }}>
                Day {day.day}: {day.productiveHours}h work + {day.breakHours}h breaks • ${day.cost}{' '}
                (starts ~08:00)
              </Text>
            ))}
            <Text style={{ fontSize: 11, color: t.colors.textMuted, marginTop: 4 }}>
              8h days • built-in lunch + breaks • $25/hr • largest tasks first
            </Text>
          </View>
        )}

        {assigned && (
          <View style={{ flexDirection: 'row', marginTop: 12 }}>
            <TouchableOpacity
              onPress={() => {
                unclaimJob(job.id);
                Alert.alert('Job released', 'Job moved back to available. You can re-claim later.');
              }}
              style={[styles.secondaryBtn, { backgroundColor: '#757575', marginRight: 8 }]}
            >
              <Text style={styles.btnText}>Unclaim / Release</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                Alert.alert(
                  'Job details',
                  `${job.title}\n\nLocation: ${job.location}\nTrade: ${job.trade}`,
                )
              }
              style={[styles.secondaryBtn, { backgroundColor: '#1976d2' }]}
            >
              <Text style={styles.btnText}>Job Info</Text>
            </TouchableOpacity>
          </View>
        )}

        {claimable && (
          <TouchableOpacity
            onPress={() => {
              claimJob(job);
              if (!job.fromOwnerData) {
                const newTasks = jobToTasks(job);
                const existingNames = new Set((laborTasks || []).map((lt: any) => lt.name));
                const toAdd = newTasks.filter((nt) => !existingNames.has(nt.name));
                if (toAdd.length > 0) {
                  setLaborTasks([...(laborTasks || []), ...toAdd]);
                }
              }
              Alert.alert(
                'Job claimed & assigned',
                `Moved to "My Assigned Jobs". Est. $${job.estimatedCost.low}–${job.estimatedCost.high} locked.`,
              );
            }}
            style={[styles.claimBtn, { backgroundColor: t.colors.accent }]}
          >
            <Text style={styles.btnText}>
              {job.fromOwnerData ? 'Claim owner project (integrates data)' : 'Claim job (cost ready)'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: t.colors.backgroundAlt }}>
      <ConstrainedView style={{ paddingHorizontal: 20, paddingTop: Math.max(insets.top, 16), paddingBottom: 12 }}>
        <Text style={[styles.header, { color: t.colors.text }]}>Worker Dashboard</Text>
        <Text style={{ color: t.colors.textSecondary, marginTop: 4, fontSize: 16 }}>
          $25/hr guaranteed • Pick jobs that match your trade
        </Text>
      </ConstrainedView>

      {(sourcingItems || []).length > 0 || (laborTasks || []).length > 0 ? (
        <ConstrainedView style={{ paddingHorizontal: 20, marginBottom: 12 }}>
          <View
            style={[
              styles.integrationBanner,
              {
                backgroundColor: t.colors.backgroundSuccess,
                borderColor: t.colors.successBorder,
              },
            ]}
          >
            <Text style={{ fontSize: 13, fontWeight: '700', color: '#1b5e20' }}>
              🔗 Integrated with owner-sourced data
            </Text>
            <Text style={{ fontSize: 13, color: t.colors.success, marginTop: 2 }}>
              Owner has {approvedSourcing.length} approved items (materials ~${matTotal}).{' '}
              {(laborTasks || []).length} labor tasks ready.
            </Text>
          </View>
        </ConstrainedView>
      ) : null}

      <ConstrainedView style={{ paddingHorizontal: 20, marginBottom: 12 }}>
        <Text style={{ fontSize: 13, fontWeight: '600', color: t.colors.textSecondary, marginBottom: 6 }}>
          Filter by trade
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {TRADES.map((trade) => (
            <TouchableOpacity
              key={trade}
              onPress={() => setTradeFilter(trade)}
              style={[
                styles.filterChip,
                {
                  backgroundColor: tradeFilter === trade ? t.colors.dark || '#111' : t.colors.cardBg,
                  borderColor: tradeFilter === trade ? t.colors.dark || '#111' : t.colors.border,
                },
              ]}
            >
              <Text
                style={{
                  color: tradeFilter === trade ? '#fff' : t.colors.text,
                  fontWeight: '600',
                  fontSize: 14,
                }}
              >
                {trade}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </ConstrainedView>

      <ScrollView style={{ flex: 1 }}>
        <ConstrainedView style={{ paddingHorizontal: 20, paddingBottom: 120 }}>
          <Text style={[styles.sectionTitle, { color: t.colors.text }]}>My Assigned Jobs</Text>
          {(workerAssignedJobs || []).length === 0 ? (
            <View
              style={[
                styles.emptyCard,
                { backgroundColor: t.colors.cardBg, borderColor: t.colors.border },
              ]}
            >
              <Text style={{ color: t.colors.textSecondary }}>
                No assigned jobs yet. Use the Claim buttons below — claimed jobs move here with live
                scheduling.
              </Text>
            </View>
          ) : (
            (workerAssignedJobs || []).map((job: any) => renderJobCard(job, { assigned: true }))
          )}

          {showOwnerJob && ownerIntegratedJob && (
            <View style={{ marginTop: 8, marginBottom: 8 }}>
              <Text style={{ fontSize: 15, fontWeight: '700', color: '#1565c0', marginBottom: 6 }}>
                📦 Live from Owner's Current Project (sourced data)
              </Text>
              {renderJobCard(ownerIntegratedJob, { claimable: true })}
            </View>
          )}

          <Text style={[styles.sectionTitle, { color: t.colors.text, marginTop: 8 }]}>
            Available Jobs — Claim to assign
          </Text>
          {filteredAvailable.length === 0 ? (
            <View
              style={[
                styles.emptyCard,
                { backgroundColor: t.colors.cardBg, borderColor: t.colors.border, alignItems: 'center' },
              ]}
            >
              <Text style={{ color: t.colors.textMuted }}>
                No more open jobs match this filter (or all claimed).
              </Text>
            </View>
          ) : (
            filteredAvailable.map((job) => renderJobCard(job, { claimable: true }))
          )}
        </ConstrainedView>
      </ScrollView>

      <ConstrainedView style={{ paddingHorizontal: 20, paddingBottom: Math.max(insets.bottom, 8) }}>
        <TouchableOpacity
          onPress={() => setRole(null)}
          style={[styles.switchRole, { backgroundColor: t.colors.dark || '#000' }]}
        >
          <Text style={{ color: '#fff', fontWeight: '600' }}>Switch Role / Restart</Text>
        </TouchableOpacity>
      </ConstrainedView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { fontSize: 32, fontWeight: '700', letterSpacing: -1 },
  integrationBanner: { borderRadius: 10, padding: 12, borderWidth: 1 },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    marginRight: 8,
    borderWidth: 1,
  },
  sectionTitle: { fontSize: 20, fontWeight: '700', marginBottom: 8, marginTop: 4 },
  emptyCard: { borderRadius: 12, padding: 16, borderWidth: 1, marginBottom: 16 },
  card: { borderRadius: 16, padding: 18, marginBottom: 16 },
  carousel: { marginBottom: 12, borderRadius: 8 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardTitle: { fontSize: 18, fontWeight: '700' },
  tasksLabel: { marginTop: 14, marginBottom: 6, fontWeight: '600' },
  scheduleBox: { marginTop: 14, padding: 12, borderRadius: 10, borderWidth: 1 },
  claimBtn: { marginTop: 16, paddingVertical: 13, borderRadius: 14, alignItems: 'center' },
  secondaryBtn: { flex: 1, paddingVertical: 11, borderRadius: 12, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  switchRole: { marginTop: 8, padding: 14, borderRadius: 12, alignItems: 'center' },
});