import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import Svg, { Line, Path, Circle, Text as SvgText } from 'react-native-svg';
import { useDeltaStore } from '../../store/useDeltaStore';
import { DesignVersion } from '../design/types';
import {
  ConstrainedView,
  PrimaryButton,
  SecondaryButton,
  Card,
  ScopeCard,
  SectionHeader,
  Pill,
  EmptyState,
} from '../../shared';
import { sharedStyles, COLORS, SPACING, TYPOGRAPHY, RADII } from '../../shared';
import { getImageSource } from '../../shared/media';
import {
  DEMO_SCOPE_TREE,
  scopeTreeFromLaborTasks,
  type ScopeTradeGroup,
} from './scopeFromLabor';

/**
 * ScopingScreen (refactored for Phase 1 shared styling foundation).
 *
 * IMPORTANT: 
 * - Selected design hero (approvedDesign) is shown first — unchanged.
 * - Scope tree: broken down by trade, with story points assigned to each subtask (Scrum style).
 * - Interactive: tap to complete subtasks → burns points.
 * - Burndown chart: SVG line chart (ideal dashed vs actual solid) trending toward 0 points remaining.
 * - Ties into existing laborTasks (for scheduling) and store.
 */

const MAX_PERIODS = 10;

export default function ScopingScreen() {
  const {
    approvedDesign,
    setApprovedDesign,
    laborTasks,
    setLaborTasks,
    scopeCompleted,
    scopeBurnSeries,
    toggleScopeItem,
    setScopeCompleted,
    setScopeBurnSeries,
    resetScopeProgress,
  } = useDeltaStore();

  const completed = scopeCompleted;
  const burnSeries = scopeBurnSeries;

  // Prefer live scope from laborTasks (Sourcing → Scheduling path); fall back to rich demo tree.
  const scopeTree: ScopeTradeGroup[] = useMemo(() => {
    const fromLabor = scopeTreeFromLaborTasks(laborTasks || []);
    return fromLabor.length > 0 ? fromLabor : DEMO_SCOPE_TREE;
  }, [laborTasks]);

  const scopeSource = (laborTasks || []).length > 0 ? 'labor' : 'demo';

  const allSubtasks = useMemo(
    () => scopeTree.flatMap((g) => g.items),
    [scopeTree]
  );

  const totalPoints = useMemo(
    () => allSubtasks.reduce((sum, s) => sum + s.points, 0),
    [allSubtasks]
  );

  const completedPoints = useMemo(() => {
    return allSubtasks
      .filter((s) => completed[s.id])
      .reduce((sum, s) => sum + s.points, 0);
  }, [allSubtasks, completed]);

  const remainingPoints = Math.max(0, totalPoints - completedPoints);

  // Keep burnSeries in sync with current remaining (append on meaningful change)
  // Seed a little initial trend when we first have a total
  React.useEffect(() => {
    if (totalPoints > 0 && burnSeries.length === 0) {
      const seed = [totalPoints, Math.round(totalPoints * 0.92), Math.round(totalPoints * 0.85)];
      setScopeBurnSeries(seed);
    }
  }, [totalPoints, burnSeries.length, setScopeBurnSeries]);

  // When remaining changes via user action, append to series (for the chart trend)
  React.useEffect(() => {
    if (burnSeries.length > 0) {
      const last = burnSeries[burnSeries.length - 1];
      if (last !== remainingPoints) {
        const next = [...burnSeries, remainingPoints];
        setScopeBurnSeries(
          next.length > MAX_PERIODS * 2 ? next.slice(next.length - MAX_PERIODS) : next,
        );
      }
    }
  }, [remainingPoints, burnSeries, setScopeBurnSeries]);

  const percentBurned = totalPoints > 0 ? Math.round((completedPoints / totalPoints) * 100) : 0;

  const toggleComplete = (id: string) => {
    toggleScopeItem(id);
  };

  const resetBurndown = () => {
    resetScopeProgress();
    const seed = [totalPoints, Math.round(totalPoints * 0.9)];
    setScopeBurnSeries(seed);
  };

  const simulateProgress = () => {
    if (remainingPoints <= 0) return;
    const burn = Math.min(remainingPoints, 5 + Math.floor(Math.random() * 4)); // 5-8 pts
    // Pick some not-yet-completed to mark done until we burned enough
    const notDone = allSubtasks.filter((s) => !completed[s.id]);
    let toBurn = burn;
    const updates: Record<string, boolean> = {};
    for (const s of notDone) {
      if (toBurn <= 0) break;
      updates[s.id] = true;
      toBurn -= s.points;
    }
    setScopeCompleted({ ...completed, ...updates });
    // series append happens via the remaining effect
  };

  const completeAll = () => {
    const allDone: Record<string, boolean> = {};
    allSubtasks.forEach((s) => {
      allDone[s.id] = true;
    });
    setScopeCompleted(allDone);
  };

  // Derive groups with current completion + subtotals
  const groupsWithState = useMemo(() => {
    return scopeTree.map((group) => {
      const items = group.items.map((item) => ({
        ...item,
        done: !!completed[item.id],
      }));
      const groupDone = items.filter((i) => i.done).reduce((s, i) => s + i.points, 0);
      const groupTotal = items.reduce((s, i) => s + i.points, 0);
      return { ...group, items, groupTotal, groupDone };
    });
  }, [scopeTree, completed]);

  // Load example (sets the selected design first + seeds laborTasks so Scheduling + scope are coherent)
  const loadExampleForScope = () => {
    const exDesign: DesignVersion = {
      id: 'ex-v1',
      imageUri: '/ai-room-1.jpg',
      prompt: 'Modern minimalist kitchen with warm oak, huge island, and tons of natural light',
      tweaks: { style: 'Modern', colorPalette: 'Warm neutrals', layout: 'Open plan' },
      createdAt: new Date().toISOString(),
    };
    setApprovedDesign(exDesign);

    // Seed labor tasks from the scope (so "Scheduling" tab has real data immediately)
    const seededTasks = allSubtasks.map((s, i) => ({
      id: `scope-${s.id}`,
      name: s.name,
      estimatedHours: Math.max(2, Math.round(s.points * 1.2)), // points → hours (rough; $25/hr math stays in scheduler)
      category: scopeTree.find((g) => g.items.some((it) => it.id === s.id))?.trade.toLowerCase(),
    }));
    setLaborTasks(seededTasks);

    resetScopeProgress();
    const seed = [totalPoints, Math.round(totalPoints * 0.88)];
    setScopeBurnSeries(seed);

    Alert.alert(
      'Selected design loaded',
      'Oak Street House selected design is now active. Scope tree + burndown ready. Labor tasks synced for Scheduling.'
    );
  };

  // Optional: sync current scope subtasks into laborTasks (owner can do this to update Scheduling)
  const syncToLabor = () => {
    const tasksFromScope = allSubtasks.map((s, i) => ({
      id: `scope-${s.id}`,
      name: s.name,
      estimatedHours: Math.max(2, Math.round(s.points * 1.2)),
      category: scopeTree.find((g) => g.items.some((it) => it.id === s.id))?.trade.toLowerCase(),
    }));
    setLaborTasks(tasksFromScope);
    Alert.alert('Synced', 'Scope subtasks pushed to laborTasks. Check Scheduling tab for updated plan.');
  };

  // Burndown chart (pure RN SVG, cross-platform) — **COMPLETELY UNCHANGED** for hero + burndown fidelity
  const renderBurndown = () => {
    const width = 640;
    const height = 210;
    const pad = 36;
    const chartW = width - pad * 2;
    const chartH = height - pad * 2;

    const series = burnSeries.length > 0 ? burnSeries : [totalPoints, remainingPoints];
    const steps = Math.max(1, series.length - 1);
    const maxX = Math.max(steps, MAX_PERIODS);

    const xAt = (step: number) => pad + (step / maxX) * chartW;
    const yAt = (pts: number) => pad + (1 - pts / Math.max(1, totalPoints)) * chartH; // 0 pts = bottom

    // Ideal line (plan): straight from (0, total) to (maxX, 0)
    const idealD = `M ${xAt(0)} ${yAt(totalPoints)} L ${xAt(maxX)} ${yAt(0)}`;

    // Actual line from the series
    let actualD = '';
    series.forEach((rem, idx) => {
      const x = xAt(idx);
      const y = yAt(rem);
      actualD += idx === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
    });

    return (
      <View style={{ alignItems: 'center', marginTop: 8 }}>
        <Svg width={width} height={height}>
          {/* Axes */}
          <Line x1={pad} y1={pad} x2={pad} y2={pad + chartH} stroke="#ccc" strokeWidth="1" />
          <Line x1={pad} y1={pad + chartH} x2={pad + chartW} y2={pad + chartH} stroke="#ccc" strokeWidth="1" />

          {/* Y ticks + labels (0, half, total) */}
          {[0, 0.5, 1].map((f, i) => {
            const pts = Math.round(totalPoints * (1 - f));
            const y = yAt(pts);
            return (
              <React.Fragment key={i}>
                <Line x1={pad - 4} y1={y} x2={pad} y2={y} stroke="#999" strokeWidth="1" />
                <SvgText x={pad - 8} y={y + 4} fontSize="11" fill="#666" textAnchor="end">
                  {pts}
                </SvgText>
              </React.Fragment>
            );
          })}

          {/* X ticks (iterations / "sprint days") */}
          {[0, Math.floor(maxX / 2), maxX].map((s, i) => (
            <React.Fragment key={i}>
              <Line x1={xAt(s)} y1={pad + chartH} x2={xAt(s)} y2={pad + chartH + 4} stroke="#999" strokeWidth="1" />
              <SvgText x={xAt(s)} y={pad + chartH + 16} fontSize="11" fill="#666" textAnchor="middle">
                {s}
              </SvgText>
            </React.Fragment>
          ))}

          {/* Ideal (dashed) */}
          <Path d={idealD} stroke="#888" strokeWidth="2" strokeDasharray="5,4" fill="none" />

          {/* Actual (solid, trending to 0) */}
          <Path d={actualD} stroke="#FF385C" strokeWidth="3.5" fill="none" />

          {/* Dots for actual progress points */}
          {series.map((rem, idx) => (
            <Circle
              key={idx}
              cx={xAt(idx)}
              cy={yAt(rem)}
              r={4.5}
              fill="#FF385C"
              stroke="#fff"
              strokeWidth="1.5"
            />
          ))}

          {/* Axis titles */}
          <SvgText x={12} y={pad + chartH / 2} fontSize="10" fill="#666" transform={`rotate(-90, 12, ${pad + chartH / 2})`}>
            Points remaining
          </SvgText>
          <SvgText x={pad + chartW / 2} y={height - 4} fontSize="11" fill="#666" textAnchor="middle">
            Sprint periods (iterations)
          </SvgText>
        </Svg>

        <View style={{ flexDirection: 'row', marginTop: 6, gap: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ width: 18, height: 3, backgroundColor: '#888', marginRight: 6 }} />
            <Text style={{ fontSize: 12, color: '#666' }}>Ideal plan</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ width: 18, height: 3, backgroundColor: '#FF385C', marginRight: 6 }} />
            <Text style={{ fontSize: 12, color: '#666' }}>Actual (burning to 0)</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <ConstrainedView style={{ paddingTop: SPACING.lg, paddingBottom: 80 }}>
        <Text style={TYPOGRAPHY.title}>Scoping</Text>
        <Text style={[TYPOGRAPHY.subtitle, { marginTop: 4, marginBottom: SPACING.sm }]}>
          Scrum scope tree by trade + burndown for the selected design. Points → 0 remaining.
        </Text>
        <Pill
          label={scopeSource === 'labor' ? '● Live scope from labor tasks' : '○ Demo scope (load example or generate labor)'}
          variant={scopeSource === 'labor' ? 'success' : 'neutral'}
          style={{ marginBottom: SPACING.lg, alignSelf: 'flex-start' }}
        />

        {/* Selected design hero (prioritized, mirrors DesignStudio "selected first" pattern) — UNCHANGED */}
        {approvedDesign ? (
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 13, fontWeight: 700, color: COLORS.success, marginBottom: 6 }}>
              SELECTED DESIGN
            </Text>
            <View style={sharedStyles.heroWrap}>
              <Image source={getImageSource(approvedDesign.imageUri)} style={styles.heroImage} resizeMode="cover" />
            </View>
            <Text style={{ fontSize: 15, fontWeight: '600', color: COLORS.textPrimary, marginTop: 6 }}>
              {approvedDesign.prompt}
            </Text>
            <Text style={{ color: COLORS.textSecondary, fontSize: 13, marginTop: 2 }}>
              {approvedDesign.tweaks.style} • {approvedDesign.tweaks.colorPalette} • {approvedDesign.tweaks.layout}
            </Text>
          </View>
        ) : (
          <EmptyState
            title="No selected design yet"
            subtitle="Load the example project to populate the approved design + full scope tree."
            actionLabel="Load Example Project (Oak Street House)"
            onAction={loadExampleForScope}
          />
        )}

        {/* Scope summary + actions */}
        {approvedDesign && (
          <>
            <Card style={styles.summaryBar}>
              <View>
                <Text style={{ fontSize: 13, color: COLORS.textSecondary }}>Total Scope</Text>
                <Text style={{ fontSize: 28, fontWeight: '800', color: COLORS.textPrimary }}>{totalPoints} pts</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ fontSize: 13, color: COLORS.textSecondary }}>Remaining (burndown target)</Text>
                <Text style={{ fontSize: 28, fontWeight: '800', color: remainingPoints === 0 ? COLORS.success : COLORS.accent }}>
                  {remainingPoints} pts
                </Text>
                <Text style={{ color: COLORS.success, fontWeight: '600' }}>{percentBurned}% burned</Text>
              </View>
            </Card>

            <View style={{ flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.md }}>
              <SecondaryButton
                title="Simulate day progress (−5-8 pts)"
                onPress={simulateProgress}
                style={{ flex: 1 }}
              />
              <TouchableOpacity
                style={[sharedStyles.secondaryButton, { backgroundColor: COLORS.dark }]}
                onPress={completeAll}
              >
                <Text style={sharedStyles.secondaryButtonText}>Complete all</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[sharedStyles.subtleButton]}
                onPress={resetBurndown}
              >
                <Text style={sharedStyles.subtleButtonText}>Reset</Text>
              </TouchableOpacity>
            </View>

            {/* Scope tree by trade */}
            <SectionHeader>Scope Tree by Trade (Story Points)</SectionHeader>
            <Text style={{ color: COLORS.textSecondary, marginBottom: SPACING.sm, fontSize: 13 }}>
              Subtasks with points assigned. Tap "Complete" to burn down the chart. (Scrum-style breakdown of the selected design.)
            </Text>

            {groupsWithState.map((group) => (
              <ScopeCard key={group.trade} style={styles.tradeGroup}>
                <View style={styles.tradeHeader}>
                  <Text style={styles.tradeTitle}>{group.trade}</Text>
                  <Pill
                    variant="accent"
                    style={{ paddingHorizontal: 8, paddingVertical: 2 }}
                    label={`${group.groupDone}/${group.groupTotal} pts`}
                  />
                </View>
                {group.items.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.subtaskRow, item.done && styles.subtaskDone]}
                    onPress={() => toggleComplete(item.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.subtaskName, item.done && { textDecorationLine: 'line-through', color: '#888' }]}>
                      • {item.name}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Pill
                        variant={item.done ? 'done' : 'success'}
                        style={item.done ? undefined : { backgroundColor: '#fff', borderColor: COLORS.accent }}
                        label={`${item.points} pts`}
                      />
                      <Text style={{ color: item.done ? COLORS.success : COLORS.accent, fontWeight: 700, fontSize: 13 }}>
                        {item.done ? '✓ Done' : 'Complete'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScopeCard>
            ))}

            <PrimaryButton
              onPress={syncToLabor}
              style={styles.syncBtn}
            >
              <Text style={styles.syncText}>Sync scope subtasks → Labor tasks (update Scheduling)</Text>
            </PrimaryButton>

            {/* Burndown Chart — UNCHANGED internals */}
            <SectionHeader style={{ marginTop: SPACING.xl }}>Scrum Burndown Chart</SectionHeader>
            <Text style={{ color: COLORS.textSecondary, marginBottom: SPACING.sm, fontSize: 13 }}>
              Line chart: full scope of work (total points) trending to 0 remaining. Ideal plan (dashed) vs. actual progress (solid).
              Complete subtasks above to move the red line toward the goal.
            </Text>

            {renderBurndown()}

            <Text style={{ fontSize: 12, color: COLORS.textMuted, marginTop: SPACING.sm, marginBottom: 24 }}>
              {laborTasks.length > 0
                ? `${laborTasks.length} labor tasks currently in store (from scope / sourcing). See Scheduling tab for $25/hr day-by-day plan.`
                : 'Load example or sync scope to populate labor tasks for the Scheduling view.'}
            </Text>
          </>
        )}

        {!approvedDesign && (
          <View style={{ marginTop: SPACING.lg }}>
            <Text style={{ color: COLORS.textMuted, fontSize: 13 }}>
              Once a design is selected, the scope tree (by trade) and live burndown will appear here.
            </Text>
          </View>
        )}
      </ConstrainedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.backgroundAlt },
  // constrained now handled by <ConstrainedView />
  heroImage: {
    width: '100%',
    height: 220,
    backgroundColor: '#ddd',
  },
  summaryBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    // Card base provides bg/radius/border/pad; small overrides
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  tradeGroup: {
    marginBottom: SPACING.sm,
    // ScopeCard/Card base + override
    padding: 0,
    overflow: 'hidden',
  },
  tradeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: COLORS.backgroundAlt,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tradeTitle: { fontWeight: 700, color: COLORS.textPrimary, fontSize: 15 },
  subtaskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  subtaskDone: { backgroundColor: '#f0fdf4' },
  subtaskName: { flex: 1, color: COLORS.gray, fontSize: 14, paddingRight: 8 },
  syncBtn: {
    marginTop: SPACING.sm,
    backgroundColor: '#e8f0fe',
    paddingVertical: 10,
    borderRadius: RADII.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#90caf9',
  },
  syncText: { color: '#1565c0', fontWeight: '600', fontSize: 14 },
});
