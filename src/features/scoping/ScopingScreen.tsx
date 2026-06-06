import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import Svg, { Line, Path, Circle, Text as SvgText } from 'react-native-svg';
import { useDeltaStore } from '../../store/useDeltaStore';
import { DesignVersion } from '../design/types';

/**
 * ScopingScreen
 * - Shows the *selected design* (approvedDesign) hero first (per recent owner polish).
 * - Scope tree: broken down by trade, with story points assigned to each subtask (Scrum style).
 * - Interactive: tap to complete subtasks → burns points.
 * - Burndown chart: SVG line chart (ideal dashed vs actual solid) trending toward 0 points remaining.
 * - Ties into existing laborTasks (for scheduling) and store.
 */

type ScopeSubtask = {
  id: string;
  name: string;
  points: number;
};

type ScopeTradeGroup = {
  trade: string;
  items: ScopeSubtask[];
};

const MAX_PERIODS = 10;

export default function ScopingScreen() {
  const { approvedDesign, setApprovedDesign, laborTasks, setLaborTasks } = useDeltaStore();

  // Local interactive state for Scrum burndown (demo; not persisted to keep store shape respected)
  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  const [burnSeries, setBurnSeries] = useState<number[]>([]); // remaining points over "iterations"

  // Rich demo scope tree for the selected design (Oak Street House kitchen + whole-home remodel coherence)
  // Points use light Scrum/Fib-ish values. Real impl could derive from AI prompt + laborTasks.
  const scopeTree: ScopeTradeGroup[] = useMemo(
    () => [
      {
        trade: 'Carpentry',
        items: [
          { id: 'c1', name: 'Install new base & upper cabinets (soft-close)', points: 8 },
          { id: 'c2', name: 'Build & install custom kitchen island w/ seating', points: 13 },
          { id: 'c3', name: 'Hang pantry shelving + cabinet organizers', points: 5 },
          { id: 'c4', name: 'Crown molding, baseboards, window casings', points: 5 },
        ],
      },
      {
        trade: 'Electrical',
        items: [
          { id: 'e1', name: 'Run 20A circuits for appliances + island', points: 5 },
          { id: 'e2', name: 'Install boxes + wiring for 8 recessed lights', points: 3 },
          { id: 'e3', name: 'GFCI + dedicated circuits (dishwasher/fridge)', points: 3 },
          { id: 'e4', name: 'Outlets, switches, under-cabinet lighting rough-in', points: 3 },
        ],
      },
      {
        trade: 'Painting',
        items: [
          { id: 'p1', name: 'Prep walls, patch, sand smooth', points: 3 },
          { id: 'p2', name: 'Prime + 2 coats warm white on walls', points: 5 },
          { id: 'p3', name: 'Cut-in + paint trim, doors, built-ins', points: 5 },
          { id: 'p4', name: 'Durable cabinet paint (kitchen)', points: 3 },
        ],
      },
      {
        trade: 'Flooring',
        items: [
          { id: 'f1', name: 'Remove old vinyl + prep subfloor', points: 3 },
          { id: 'f2', name: 'Install LVP luxury vinyl plank + underlayment', points: 8 },
          { id: 'f3', name: 'Waterproof baseboards + door casings', points: 3 },
          { id: 'f4', name: 'Cut/fit flooring around vanity + toilet', points: 2 },
        ],
      },
      {
        trade: 'Demolition',
        items: [
          { id: 'd1', name: 'Careful demo old kitchen + non-load wall', points: 5 },
          { id: 'd2', name: 'Remove/dispose cabinets, counters, flooring', points: 3 },
          { id: 'd3', name: 'Frame new pass-through + island opening', points: 5 },
          { id: 'd4', name: 'Temp supports + debris haul', points: 2 },
        ],
      },
      {
        trade: 'Plumbing',
        items: [
          { id: 'pl1', name: 'Relocate drain lines for double vanity', points: 5 },
          { id: 'pl2', name: 'New P-traps, supplies, shutoffs', points: 3 },
          { id: 'pl3', name: 'Rough-in freestanding tub + shower valve', points: 5 },
          { id: 'pl4', name: 'Leak test all new lines pre-drywall', points: 2 },
        ],
      },
    ],
    []
  );

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
      // Seed: started full, small early burn (demo "some progress already logged")
      const seed = [totalPoints, Math.round(totalPoints * 0.92), Math.round(totalPoints * 0.85)];
      setBurnSeries(seed);
    }
  }, [totalPoints, burnSeries.length]);

  // When remaining changes via user action, append to series (for the chart trend)
  React.useEffect(() => {
    if (burnSeries.length > 0) {
      const last = burnSeries[burnSeries.length - 1];
      if (last !== remainingPoints) {
        setBurnSeries((prev) => {
          const next = [...prev, remainingPoints];
          // Keep it from growing unbounded; trim old if > 2x periods for viz clarity
          return next.length > MAX_PERIODS * 2 ? next.slice(next.length - MAX_PERIODS) : next;
        });
      }
    }
  }, [remainingPoints]); // eslint-disable-line react-hooks/exhaustive-deps

  const percentBurned = totalPoints > 0 ? Math.round((completedPoints / totalPoints) * 100) : 0;

  const toggleComplete = (id: string) => {
    setCompleted((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const resetBurndown = () => {
    setCompleted({});
    // Re-seed a fresh small trend
    const seed = [totalPoints, Math.round(totalPoints * 0.9)];
    setBurnSeries(seed);
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
    setCompleted((prev) => ({ ...prev, ...updates }));
    // series append happens via the remaining effect
  };

  const completeAll = () => {
    const allDone: Record<string, boolean> = {};
    allSubtasks.forEach((s) => {
      allDone[s.id] = true;
    });
    setCompleted(allDone);
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

    // Reset local burndown for the fresh scope
    setCompleted({});
    const seed = [totalPoints, Math.round(totalPoints * 0.88)];
    setBurnSeries(seed);

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

  // Burndown chart (pure RN SVG, cross-platform)
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
      <View style={styles.constrained}>
        <Text style={styles.title}>Scoping</Text>
        <Text style={styles.subtitle}>
          Scrum scope tree by trade + burndown for the selected design. Points → 0 remaining.
        </Text>

        {/* Selected design hero (prioritized, mirrors DesignStudio "selected first" pattern) */}
        {approvedDesign ? (
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 13, fontWeight: '700', color: '#2e7d32', marginBottom: 6 }}>
              SELECTED DESIGN
            </Text>
            <View style={styles.heroWrap}>
              <Image source={{ uri: approvedDesign.imageUri }} style={styles.heroImage} resizeMode="cover" />
            </View>
            <Text style={{ fontSize: 15, fontWeight: '600', color: '#222', marginTop: 6 }}>
              {approvedDesign.prompt}
            </Text>
            <Text style={{ color: '#666', fontSize: 13, marginTop: 2 }}>
              {approvedDesign.tweaks.style} • {approvedDesign.tweaks.colorPalette} • {approvedDesign.tweaks.layout}
            </Text>
          </View>
        ) : (
          <View style={styles.emptyDesign}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#222' }}>No selected design yet</Text>
            <Text style={{ color: '#666', marginTop: 4, marginBottom: 12 }}>
              Load the example project to populate the approved design + full scope tree.
            </Text>
            <TouchableOpacity style={styles.primaryBtn} onPress={loadExampleForScope}>
              <Text style={styles.primaryBtnText}>Load Example Project (Oak Street House)</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Scope summary + actions */}
        {approvedDesign && (
          <>
            <View style={styles.summaryBar}>
              <View>
                <Text style={{ fontSize: 13, color: '#666' }}>Total Scope</Text>
                <Text style={{ fontSize: 28, fontWeight: '800', color: '#222' }}>{totalPoints} pts</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ fontSize: 13, color: '#666' }}>Remaining (burndown target)</Text>
                <Text style={{ fontSize: 28, fontWeight: '800', color: remainingPoints === 0 ? '#2e7d32' : '#FF385C' }}>
                  {remainingPoints} pts
                </Text>
                <Text style={{ color: '#2e7d32', fontWeight: '600' }}>{percentBurned}% burned</Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
              <TouchableOpacity style={styles.actionBtn} onPress={simulateProgress}>
                <Text style={styles.actionText}>Simulate day progress (−5-8 pts)</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#222' }]} onPress={completeAll}>
                <Text style={[styles.actionText, { color: '#fff' }]}>Complete all</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#eee' }]} onPress={resetBurndown}>
                <Text style={[styles.actionText, { color: '#333' }]}>Reset</Text>
              </TouchableOpacity>
            </View>

            {/* Scope tree by trade */}
            <Text style={styles.sectionHeader}>Scope Tree by Trade (Story Points)</Text>
            <Text style={{ color: '#666', marginBottom: 8, fontSize: 13 }}>
              Subtasks with points assigned. Tap "Complete" to burn down the chart. (Scrum-style breakdown of the selected design.)
            </Text>

            {groupsWithState.map((group) => (
              <View key={group.trade} style={styles.tradeGroup}>
                <View style={styles.tradeHeader}>
                  <Text style={styles.tradeTitle}>{group.trade}</Text>
                  <Text style={styles.tradePoints}>
                    {group.groupDone}/{group.groupTotal} pts
                  </Text>
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
                      <View style={[styles.pointsPill, item.done && styles.pointsPillDone]}>
                        <Text style={[styles.pointsText, item.done && { color: '#2e7d32' }]}>{item.points} pts</Text>
                      </View>
                      <Text style={{ color: item.done ? '#2e7d32' : '#FF385C', fontWeight: '700', fontSize: 13 }}>
                        {item.done ? '✓ Done' : 'Complete'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ))}

            <TouchableOpacity style={[styles.syncBtn]} onPress={syncToLabor}>
              <Text style={styles.syncText}>Sync scope subtasks → Labor tasks (update Scheduling)</Text>
            </TouchableOpacity>

            {/* Burndown Chart */}
            <Text style={[styles.sectionHeader, { marginTop: 20 }]}>Scrum Burndown Chart</Text>
            <Text style={{ color: '#666', marginBottom: 6, fontSize: 13 }}>
              Line chart: full scope of work (total points) trending to 0 remaining. Ideal plan (dashed) vs. actual progress (solid).
              Complete subtasks above to move the red line toward the goal.
            </Text>

            {renderBurndown()}

            <Text style={{ fontSize: 12, color: '#888', marginTop: 8, marginBottom: 24 }}>
              {laborTasks.length > 0
                ? `${laborTasks.length} labor tasks currently in store (from scope / sourcing). See Scheduling tab for $25/hr day-by-day plan.`
                : 'Load example or sync scope to populate labor tasks for the Scheduling view.'}
            </Text>
          </>
        )}

        {!approvedDesign && (
          <View style={{ marginTop: 20 }}>
            <Text style={{ color: '#888', fontSize: 13 }}>
              Once a design is selected, the scope tree (by trade) and live burndown will appear here.
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8' },
  constrained: {
    maxWidth: 720,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 80,
  },
  title: { fontSize: 32, fontWeight: '700', color: '#222', letterSpacing: -1 },
  subtitle: { fontSize: 16, color: '#666', marginTop: 4, marginBottom: 16 },
  heroWrap: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#eee',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  heroImage: {
    width: '100%',
    height: 220,
    backgroundColor: '#ddd',
  },
  emptyDesign: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#eee',
    marginBottom: 12,
    alignItems: 'center',
  },
  primaryBtn: {
    backgroundColor: '#FF385C',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  primaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  summaryBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  sectionHeader: { fontSize: 18, fontWeight: '700', color: '#222', marginBottom: 6 },
  tradeGroup: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee',
    overflow: 'hidden',
  },
  tradeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f8f8f8',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  tradeTitle: { fontWeight: '700', color: '#222', fontSize: 15 },
  tradePoints: { color: '#FF385C', fontWeight: '700' },
  subtaskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  subtaskDone: { backgroundColor: '#f0fdf4' },
  subtaskName: { flex: 1, color: '#333', fontSize: 14, paddingRight: 8 },
  pointsPill: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#FF385C',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  pointsPillDone: { borderColor: '#2e7d32', backgroundColor: '#e8f5e9' },
  pointsText: { fontSize: 12, fontWeight: '700', color: '#FF385C' },
  actionBtn: {
    flex: 1,
    backgroundColor: '#111',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  actionText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  syncBtn: {
    marginTop: 8,
    backgroundColor: '#e8f0fe',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#90caf9',
  },
  syncText: { color: '#1565c0', fontWeight: '600', fontSize: 14 },
});