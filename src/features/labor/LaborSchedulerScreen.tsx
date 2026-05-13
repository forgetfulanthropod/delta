import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Button, TextInput } from 'react-native';
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
      <Text className="text-4xl font-semibold tracking-tight text-[#222]">Labor Scheduler</Text>
      <Text className="text-xl text-[#666] mt-1">8-hour days • Built-in breaks • $600 per laborer</Text>
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
        className="mt-4 bg-black py-4 rounded-2xl active:bg-[#222]">
        <Text className="text-white text-center text-xl font-semibold">Generate Schedule</Text>
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
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 4 },
  subtitle: { fontSize: 13, color: '#666', marginBottom: 16 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 12, height: 120, marginBottom: 12, fontSize: 16 },
  result: { marginTop: 20 },
  summary: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
  dayCard: { backgroundColor: '#f8f8f8', padding: 14, borderRadius: 8, marginBottom: 16 },
  dayHeader: { fontSize: 18, fontWeight: '700', marginBottom: 6 },
  cost: { color: '#2e7d32', fontWeight: '600', marginTop: 4 },
  section: { marginTop: 10, fontWeight: '600', color: '#333' },
});