import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput } from 'react-native';
import { generateSchedule, getHalfDayProgress } from './scheduler';
import { Task } from './types';
import { useDeltaStore } from '../../store/useDeltaStore';
import { ConstrainedView, PrimaryButton, Card } from '../../shared';
import { sharedStyles, COLORS, SPACING, TYPOGRAPHY, RADII } from '../../shared';

/**
 * LaborSchedulerScreen (Phase 1).
 * Shared components + constrained. Scheduler + $25/hr math intact.
 */
export default function LaborSchedulerScreen() {
  const [tasksInput, setTasksInput] = useState('Demo walls: 6\nPaint living room: 5\nInstall flooring: 8\nElectrical rough-in: 4');
  const [result, setResult] = useState<any>(null);
  const { laborTasks, setLaborTasks } = useDeltaStore();

  useEffect(() => {
    if (laborTasks.length > 0) {
      setTasksInput(laborTasks.map((t: Task) => `${t.name}: ${t.estimatedHours}`).join('\n'));
    }
  }, [laborTasks]);

  const runSchedule = () => {
    const tasksToUse = laborTasks.length > 0 ? laborTasks : tasksInput.split('\n').filter(Boolean).map((line, index) => {
      const [name, hours] = line.split(':').map(s => s.trim());
      return { id: `t${index}`, name, estimatedHours: parseFloat(hours) || 2 };
    });
    setResult(generateSchedule(tasksToUse));
  };

  return (
    <ScrollView style={sharedStyles.screen}>
      <ConstrainedView style={{ paddingTop: SPACING.lg, paddingBottom: 60 }}>
        <Text style={TYPOGRAPHY.titleLarge}>Scheduling</Text>
        <Text style={[TYPOGRAPHY.subtitleLarge, { marginTop: SPACING.sm, marginBottom: SPACING.md }]}>8-hour days • Built-in breaks • $25/hr guaranteed • From scoped work</Text>
        {laborTasks.length > 0 && <Text style={{ color: COLORS.success, marginBottom: SPACING.sm }}>Using tasks from Sourcing / Scoping</Text>}
        <TextInput style={styles.input} multiline value={tasksInput} onChangeText={setTasksInput} placeholder="Task name: estimated hours" editable={laborTasks.length === 0} />
        <PrimaryButton title="Generate Schedule" onPress={runSchedule} style={{ marginTop: SPACING.lg }} />
        {result && (
          <View style={styles.result}>
            <Text style={styles.summary}>{result.summary}</Text>
            {result.days.map((day: any, idx: number) => {
              const halfDone = getHalfDayProgress(day);
              return (
                <Card key={idx} style={styles.dayCard}>
                  <Text style={styles.dayHeader}>Day {day.day}</Text>
                  <Text style={{ color: COLORS.textSecondary }}>Productive: {day.productiveHours}h | Breaks: {day.breakHours}h | Total: {day.totalHours}h</Text>
                  <Text style={styles.cost}>Cost: ${day.cost}</Text>
                  <Text style={styles.section}>By 11:30 AM (half day):</Text>
                  {halfDone.map((t: string, i: number) => <Text key={i} style={{ color: COLORS.textSecondary }}>• {t}</Text>)}
                  <Text style={styles.section}>By end of day (5 PM):</Text>
                  {day.tasks.map((st: any, i: number) => <Text key={i} style={{ color: COLORS.textSecondary }}>• {st.task.name} ({st.durationHours}h) — {st.startTime} to {st.endTime}{st.laborerName ? ` (${st.laborerName})` : ''}</Text>)}
                </Card>
              );
            })}
          </View>
        )}
      </ConstrainedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  input: { borderWidth: 1, borderColor: COLORS.borderDark, padding: SPACING.md, minHeight: 100, marginBottom: SPACING.md, fontSize: 16, borderRadius: RADII.md, backgroundColor: COLORS.background, color: COLORS.textPrimary },
  result: { marginTop: SPACING.lg },
  summary: { fontSize: 16, fontWeight: '600', marginBottom: SPACING.md, color: COLORS.textPrimary },
  dayCard: { backgroundColor: COLORS.backgroundAlt, padding: SPACING.md, borderRadius: RADII.sm, marginBottom: SPACING.md },
  dayHeader: { fontSize: 18, fontWeight: '700', marginBottom: SPACING.sm, color: COLORS.textPrimary },
  cost: { color: COLORS.success, fontWeight: '600', marginTop: SPACING.sm },
  section: { marginTop: SPACING.md, fontWeight: '600', color: COLORS.gray },
});
