import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useDeltaStore } from '../store/useDeltaStore';
import { useTheme } from './theme';

type StoreSnapshot = ReturnType<typeof useDeltaStore.getState>;

const STEPS: { key: string; label: string; check: (s: StoreSnapshot) => boolean }[] = [
  { key: 'design', label: 'Design', check: (s) => !!s.approvedDesign },
  { key: 'sourcing', label: 'Sourcing', check: (s) => (s.sourcingItems || []).some((i: { approved?: boolean }) => i.approved) },
  { key: 'scoping', label: 'Scoping', check: (s) => (s.laborTasks || []).length > 0 },
  { key: 'scheduling', label: 'Schedule', check: (s) => (s.laborTasks || []).length > 0 },
];

/**
 * Visual pipeline progress: Design → Sourcing → Scoping → Scheduling.
 * Surfaces "ready to go" journey state across owner tabs.
 */
export default function ProjectPipelineBar() {
  const t = useTheme();
  const store = useDeltaStore();

  const completed = STEPS.filter((step) => step.check(store)).length;
  const totalCost = estimateReadyCost(store);

  return (
    <View style={[styles.wrap, { backgroundColor: t.colors.surfaceAlt, borderColor: t.colors.border }]}>
      <View style={styles.steps}>
        {STEPS.map((step, i) => {
          const done = step.check(store);
          return (
            <React.Fragment key={step.key}>
              <View style={styles.step}>
                <View
                  style={[
                    styles.dot,
                    {
                      backgroundColor: done ? t.colors.accent : t.colors.border,
                    },
                  ]}
                >
                  <Text style={{ color: done ? '#fff' : t.colors.textMuted, fontSize: 10, fontWeight: '700' }}>
                    {done ? '✓' : i + 1}
                  </Text>
                </View>
                <Text style={{ fontSize: 10, fontWeight: '600', color: done ? t.colors.text : t.colors.textMuted }}>
                  {step.label}
                </Text>
              </View>
              {i < STEPS.length - 1 && (
                <View style={[styles.line, { backgroundColor: done ? t.colors.accent : t.colors.border }]} />
              )}
            </React.Fragment>
          );
        })}
      </View>
      {totalCost > 0 && (
        <Text style={{ fontSize: 12, fontWeight: '700', color: t.colors.success, marginTop: 8, textAlign: 'center' }}>
          Est. project total: ${totalCost.toLocaleString()} (ready to go)
        </Text>
      )}
      <Text style={{ fontSize: 10, color: t.colors.textMuted, marginTop: 4, textAlign: 'center' }}>
        {completed}/{STEPS.length} phases active
      </Text>
    </View>
  );
}

function estimateReadyCost(store: ReturnType<typeof useDeltaStore.getState>): number {
  const approved = (store.sourcingItems || []).filter((i) => i.approved);
  const mat = approved.reduce((s, i) => s + i.price * i.quantity, 0);
  const hrs = (store.laborTasks || []).reduce((s, t) => s + (t.estimatedHours || 0), 0);
  const labor = hrs * 25;
  if (mat === 0 && labor === 0 && store.approvedDesign) {
    return 4500; // design-only rough estimate placeholder
  }
  return mat + labor;
}

const styles = StyleSheet.create({
  wrap: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  steps: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  step: { alignItems: 'center', minWidth: 56 },
  dot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  line: { width: 20, height: 2, marginBottom: 14 },
});