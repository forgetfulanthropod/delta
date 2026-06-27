import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme, PrimaryButton, ReadyToGoCostPill } from '../../shared';
import type { ScheduleResult } from '../labor/types';

interface GuidedScheduleStepProps {
  schedule: ScheduleResult | null;
  laborHours: number;
  materialsTotal: number;
  onBuild: () => void;
}

export default function GuidedScheduleStep({
  schedule,
  laborHours,
  materialsTotal,
  onBuild,
}: GuidedScheduleStepProps) {
  const t = useTheme();

  if (!schedule) {
    return (
      <View>
        <ReadyToGoCostPill
          total={materialsTotal + laborHours * 25}
          materials={materialsTotal}
          labor={laborHours * 25}
          hours={laborHours}
        />
        <PrimaryButton testID="guided-build-schedule" title="Build schedule" onPress={onBuild} style={{ marginTop: 12 }} />
      </View>
    );
  }

  return (
    <View testID="guided-schedule-step">
      <Text style={[styles.summary, { color: t.colors.success, fontWeight: '700' }]}>
        {schedule.summary}
      </Text>
      {schedule.days.slice(0, 3).map((day) => (
        <View
          key={day.day}
          style={[styles.dayCard, { backgroundColor: t.colors.surfaceAlt, borderColor: t.colors.border }]}
        >
          <Text style={[styles.dayTitle, { color: t.colors.text }]}>Day {day.day}</Text>
          <Text style={{ color: t.colors.textSecondary, fontSize: 13 }}>
            {day.productiveHours}h productive · {day.breakHours}h breaks · ${day.cost}
          </Text>
          {day.tasks.map((st, i) => (
            <Text key={i} style={{ color: t.colors.textSecondary, fontSize: 12, marginTop: 4 }}>
              • {st.task.name} ({st.durationHours}h) {st.startTime}–{st.endTime}
            </Text>
          ))}
        </View>
      ))}
      {schedule.days.length > 3 ? (
        <Text style={{ color: t.colors.textMuted, fontSize: 12, marginTop: 8, textAlign: 'center' }}>
          +{schedule.days.length - 3} more day{schedule.days.length - 3 > 1 ? 's' : ''} in your plan
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  summary: { fontSize: 14, marginBottom: 12, textAlign: 'center', lineHeight: 20 },
  dayCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  dayTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
});