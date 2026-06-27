import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme, PrimaryButton } from '../../shared';
import { scopeTreeFromLaborTasks } from '../scoping/scopeFromLabor';
import type { Task } from '../labor/types';

interface GuidedScopeStepProps {
  laborTasks: Task[];
  scopeCompleted: Record<string, boolean>;
  onToggle: (taskId: string) => void;
  onGenerateTasks: () => void;
}

export default function GuidedScopeStep({
  laborTasks,
  scopeCompleted,
  onToggle,
  onGenerateTasks,
}: GuidedScopeStepProps) {
  const t = useTheme();
  const scopeTree = useMemo(() => scopeTreeFromLaborTasks(laborTasks), [laborTasks]);

  const totalPoints = useMemo(
    () => scopeTree.flatMap((g) => g.items).reduce((s, i) => s + i.points, 0),
    [scopeTree],
  );
  const donePoints = useMemo(
    () =>
      scopeTree
        .flatMap((g) => g.items)
        .filter((i) => scopeCompleted[i.id])
        .reduce((s, i) => s + i.points, 0),
    [scopeTree, scopeCompleted],
  );

  if (laborTasks.length === 0) {
    return (
      <PrimaryButton
        testID="guided-generate-scope"
        title="Generate labor tasks from materials"
        onPress={onGenerateTasks}
      />
    );
  }

  return (
    <View testID="guided-scope-step">
      <Text style={[styles.summary, { color: t.colors.textSecondary }]}>
        {donePoints} of {totalPoints} story points scoped
      </Text>
      {scopeTree.map((group) => (
        <View key={group.trade} style={styles.tradeBlock}>
          <Text style={[styles.tradeLabel, { color: t.colors.text }]}>{group.trade}</Text>
          {group.items.map((item) => {
            const done = !!scopeCompleted[item.id];
            return (
              <TouchableOpacity
                key={item.id}
                testID={`guided-scope-item-${item.id}`}
                onPress={() => onToggle(item.id)}
                style={[styles.itemRow, { borderColor: t.colors.border }]}
              >
                <Text style={{ color: done ? t.colors.success : t.colors.text, flex: 1 }}>
                  {done ? '✓ ' : '○ '}
                  {item.name}
                </Text>
                <Text style={{ color: t.colors.textMuted, fontWeight: '600' }}>{item.points} pts</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  summary: { fontSize: 13, fontWeight: '600', marginBottom: 12, textAlign: 'center' },
  tradeBlock: { marginBottom: 12 },
  tradeLabel: { fontSize: 13, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 6 },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    gap: 8,
  },
});