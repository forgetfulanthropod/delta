import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from './theme';

interface ReadyToGoCostPillProps {
  total: number;
  materials?: number;
  labor?: number;
  hours?: number;
  compact?: boolean;
  style?: any;
}

/**
 * Extracted common "ready to go" cost pill pattern (Phase 1 Consistency).
 * Previously duplicated inline in DesignStudioScreen (version cards + costSummaryPanel).
 * Now theme-aware (light/dark), used in Design + can be used in Scoping/worker for consistency.
 * Preserves exact visual language: green accent, "Ready to go — Est. Project Cost", breakdown.
 */
export default function ReadyToGoCostPill({
  total,
  materials,
  labor,
  hours,
  compact = false,
  style,
}: ReadyToGoCostPillProps) {
  const t = useTheme();
  const styles = createStyles(t, compact);

  return (
    <View style={[styles.pill, style]}>
      <Text style={styles.title}>Ready to go — Est. Project Cost</Text>
      <Text style={styles.main}>Total ${total}</Text>
      {(materials != null || labor != null) && (
        <Text style={styles.breakdown}>
          {materials != null ? `Materials $${materials}` : ''}
          {materials != null && labor != null ? ' + ' : ''}
          {labor != null ? `Labor $${labor}` : ''}
          {hours != null ? ` (${hours}h)` : ''}
        </Text>
      )}
    </View>
  );
}

function createStyles(t: any, compact: boolean) {
  return StyleSheet.create({
    pill: {
      marginTop: compact ? 6 : 8,
      backgroundColor: t.colors.pillBg,
      borderWidth: 1,
      borderColor: t.colors.pillBorder,
      borderRadius: 10,
      paddingVertical: compact ? 6 : 8,
      paddingHorizontal: compact ? 10 : 12,
      alignItems: 'flex-start',
    },
    title: {
      fontSize: 11,
      color: t.colors.success,
      fontWeight: '700',
      letterSpacing: 0.3,
    },
    main: {
      fontSize: compact ? 16 : 18,
      fontWeight: '800',
      color: t.colors.success,
      marginTop: 2,
    },
    breakdown: {
      fontSize: 12,
      color: t.colors.success,
      marginTop: 1,
    },
  });
}
