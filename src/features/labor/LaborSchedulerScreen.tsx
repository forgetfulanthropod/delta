import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Button, TextInput, TouchableOpacity, Alert } from 'react-native';
import { generateSchedule, getHalfDayProgress } from './scheduler';
import { Task } from './types';
import { useDeltaStore } from '../../store/useDeltaStore';

export default function LaborSchedulerScreen() {
  const [tasksInput, setTasksInput] = useState(
    'Demo walls: 6\nPaint living room: 5\nInstall flooring: 8\nElectrical rough-in: 4'
  );
  const [result, setResult] = useState<any>(null);

  const { laborTasks, setLaborTasks } = useDeltaStore();

  // Sync the input display when tasks come from Sourcing (so it shows the real items/hours instead of stale demo text)
  useEffect(() => {
    if (laborTasks.length > 0) {
      const formatted = laborTasks
        .map((t) => `${t.name}: ${t.estimatedHours}`)
        .join('\n');
      setTasksInput(formatted);
    }
  }, [laborTasks]);

  const runSchedule = () => {
    const tasksToUse = laborTasks.length > 0 ? laborTasks : tasksInput
      .split('\n')
      .filter(Boolean)
      .map((line, index) => {
        const [name, hours] = line.split(':').map(s => s.trim());
        return {
          id: `t${index}`,
          name,
          estimatedHours: parseFloat(hours) || 2,
        };
      });

    const schedule = generateSchedule(tasksToUse);
    setResult(schedule);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.constrained}>
        <Text style={styles.title}>Scheduling</Text>
        <Text style={styles.subtitle}>8-hour days • Built-in breaks • $25/hr guaranteed • From scoped work</Text>
        {laborTasks.length > 0 && <Text style={{ color: '#2e7d32', marginBottom: 8 }}>Using tasks from Sourcing</Text>}

        <TextInput
          style={styles.input}
          multiline
          value={tasksInput}
          onChangeText={setTasksInput}
          placeholder="Task name: estimated hours"
          editable={laborTasks.length === 0}
        />

        <TouchableOpacity 
          onPress={runSchedule}
          style={styles.generateBtn}>
          <Text style={styles.generateText}>Generate Schedule</Text>
        </TouchableOpacity>

        {result && (
          <View style={styles.result}>
            <Text style={styles.summary}>{result.summary}</Text>

            {result.days.map((day: any, idx: number) => {
              const halfDone = getHalfDayProgress(day);
              return (
                <View key={idx} style={styles.dayCard}>
                  <Text style={styles.dayHeader}>Day {day.day}</Text>
                  <Text>Productive: {day.productiveHours}h | Breaks: {day.breakHours}h | Total: {day.totalHours}h</Text>
                  <Text style={styles.cost}>Cost: ${day.cost}</Text>

                  <Text style={styles.section}>By 11:30 AM (half day):</Text>
                  {halfDone.map((t, i) => (
                    <Text key={i}>• {t}</Text>
                  ))}

                  <Text style={styles.section}>By end of day (5 PM):</Text>
                  {day.tasks.map((st: any, i: number) => (
                    <Text key={i}>
                      • {st.task.name} ({st.durationHours}h) — {st.startTime} to {st.endTime}{st.laborerName ? ` (${st.laborerName})` : ''}
                    </Text>
                  ))}
                </View>
              );
            })}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  constrained: {
    maxWidth: 720,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 60,
  },
  title: { fontSize: 36, fontWeight: '700', color: '#222', letterSpacing: -1, marginBottom: 4 },
  subtitle: { fontSize: 20, color: '#666', marginTop: 4, marginBottom: 16 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 12, minHeight: 100, marginBottom: 12, fontSize: 16, borderRadius: 8 },
  generateBtn: {
    marginTop: 16,
    backgroundColor: '#000',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  generateText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  result: { marginTop: 20 },
  summary: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
  dayCard: { backgroundColor: '#f8f8f8', padding: 14, borderRadius: 8, marginBottom: 16 },
  dayHeader: { fontSize: 18, fontWeight: '700', marginBottom: 6 },
  cost: { color: '#2e7d32', fontWeight: '600', marginTop: 4 },
  section: { marginTop: 10, fontWeight: '600', color: '#333' },
});