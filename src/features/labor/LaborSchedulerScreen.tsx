import React, { useState } from 'react';
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
      <Text style={styles.title}>Labor Scheduler</Text>
      <Text style={styles.subtitle}>8-hour days • Built-in breaks • $25/hr guaranteed</Text>
      {laborTasks.length > 0 && <Text style={{ color: '#2e7d32', marginBottom: 8 }}>Using tasks from Sourcing</Text>}

      <TextInput
        style={styles.input}
        multiline
        value={tasksInput}
        onChangeText={setTasksInput}
        placeholder="Task name: estimated hours"
      />

      <TouchableOpacity 
        onPress={runSchedule}
        style={styles.generateBtn}>
        <Text style={styles.generateText}>Generate Schedule</Text>
      </TouchableOpacity>

      {result && (
        <View style={styles.result}>
          <Text style={styles.summary}>{result.summary}</Text>
          <Text style={{ marginBottom: 12, color: '#555' }}>
            Total labor cost: ${result.totalCost} • {result.totalDays} day(s)
          </Text>

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
                    • {st.task.name} ({st.durationHours}h) — {st.startTime} to {st.endTime}
                  </Text>
                ))}
              </View>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 36, fontWeight: '700', color: '#222', letterSpacing: -1, marginBottom: 4 },
  subtitle: { fontSize: 20, color: '#666', marginTop: 4, marginBottom: 16 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 12, height: 120, marginBottom: 12, fontSize: 16 },
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