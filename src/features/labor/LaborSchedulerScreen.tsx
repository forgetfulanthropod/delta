import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Button, TextInput, TouchableOpacity, Alert } from 'react-native';
import { generateSchedule, getHalfDayProgress } from './scheduler';
import { Task } from './types';
import { useDeltaStore } from '../../store/useDeltaStore';
import { useTheme } from '../../shared/theme';
import { ReadyToGoCostPill } from '../../shared';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { TabParamList } from '../../navigation/types';

export default function LaborSchedulerScreen() {
  const navigation = useNavigation<BottomTabNavigationProp<TabParamList>>();
  const [tasksInput, setTasksInput] = useState(
    'Demo walls: 6\nPaint living room: 5\nInstall flooring: 8\nElectrical rough-in: 4'
  );
  const [result, setResult] = useState<any>(null);

  const { laborTasks, setLaborTasks, sourcingItems } = useDeltaStore();
  const t = useTheme();

  const approvedMat = sourcingItems.filter((i) => i.approved).reduce((s, i) => s + i.price * i.quantity, 0);
  const laborCost = laborTasks.reduce((s, lt) => s + lt.estimatedHours * 25, 0);
  const projectTotal = approvedMat + laborCost;

  // Sync the input display when tasks come from Sourcing (so it shows the real items/hours instead of stale demo text)
  useEffect(() => {
    if (laborTasks.length > 0) {
      const formatted = laborTasks
        .map((t) => `${t.name}: ${t.estimatedHours}`)
        .join('\n');
      setTasksInput(formatted);
      setResult(generateSchedule(laborTasks));
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
    <ScrollView style={{ flex: 1, backgroundColor: t.colors.background }}>
      <View style={{ maxWidth: 720, width: '100%', alignSelf: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 60 }}>
        <Text style={{ fontSize: 36, fontWeight: '700', color: t.colors.text, letterSpacing: -1, marginBottom: 4 }}>Scheduling</Text>
        <Text style={{ fontSize: 20, color: t.colors.textSecondary, marginTop: 4, marginBottom: 16 }}>8-hour days • Built-in breaks • $25/hr guaranteed • From scoped work</Text>
        {laborTasks.length > 0 && (
          <Text style={{ color: t.colors.success, marginBottom: 8 }}>
            Using {laborTasks.length} tasks from Sourcing / Scoping
          </Text>
        )}
        {laborTasks.length === 0 && (
          <TouchableOpacity onPress={() => navigation.navigate('Sourcing')} style={{ marginBottom: 12 }}>
            <Text style={{ color: t.colors.accent, fontWeight: '600' }}>
              No labor tasks yet — approve items in Sourcing first →
            </Text>
          </TouchableOpacity>
        )}
        {projectTotal > 0 && (
          <View style={{ marginBottom: 12 }}>
            <ReadyToGoCostPill
              total={projectTotal}
              materials={approvedMat}
              labor={laborCost}
              hours={laborTasks.reduce((s, lt) => s + lt.estimatedHours, 0)}
            />
          </View>
        )}

        <TextInput
          style={{ borderWidth: 1, borderColor: t.colors.border, padding: 12, minHeight: 100, marginBottom: 12, fontSize: 16, borderRadius: 8, backgroundColor: t.colors.surfaceAlt || t.colors.backgroundAlt, color: t.colors.text }}
          multiline
          value={tasksInput}
          onChangeText={setTasksInput}
          placeholder="Task name: estimated hours"
          editable={laborTasks.length === 0}
          placeholderTextColor={t.colors.textMuted}
        />

        <TouchableOpacity 
          onPress={runSchedule}
          style={{ marginTop: 16, backgroundColor: '#000', paddingVertical: 16, borderRadius: 16, alignItems: 'center' }}>
          <Text style={{ color: '#fff', fontSize: 18, fontWeight: '600' }}>Generate Schedule</Text>
        </TouchableOpacity>

        {result && (
          <View style={{ marginTop: 20 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 12, color: t.colors.text }}>{result.summary}</Text>

            {result.days.map((day: any, idx: number) => {
              const halfDone = getHalfDayProgress(day);
              return (
                <View key={idx} style={{ backgroundColor: t.colors.surfaceAlt || t.colors.backgroundAlt, padding: 14, borderRadius: 8, marginBottom: 16 }}>
                  <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 6, color: t.colors.text }}>Day {day.day}</Text>
                  <Text style={{ color: t.colors.textSecondary }}>Productive: {day.productiveHours}h | Breaks: {day.breakHours}h | Total: {day.totalHours}h</Text>
                  <Text style={{ color: t.colors.success, fontWeight: '600', marginTop: 4 }}>Cost: ${day.cost}</Text>

                  <Text style={{ marginTop: 10, fontWeight: '600', color: t.colors.text }}>By 11:30 AM (half day):</Text>
                  {halfDone.map((task: string, i: number) => (
                    <Text key={i} style={{ color: t.colors.textSecondary }}>• {task}</Text>
                  ))}

                  <Text style={{ marginTop: 10, fontWeight: '600', color: t.colors.text }}>By end of day (5 PM):</Text>
                  {day.tasks.map((st: any, i: number) => (
                    <Text key={i} style={{ color: t.colors.textSecondary }}>
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
