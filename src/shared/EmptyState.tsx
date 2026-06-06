import React from 'react';
import { View, Text } from 'react-native';
import { sharedStyles, COLORS, SPACING } from './theme';
import PrimaryButton from './PrimaryButton';

/**
 * EmptyState
 * Reusable for "no selected design", "no assigned jobs", "no sourcing items" etc.
 * Consistent card + messaging. Optional action button.
 */
interface EmptyStateProps {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: any;
}

export default function EmptyState({ title, subtitle, actionLabel, onAction, style }: EmptyStateProps) {
  return (
    <View style={[sharedStyles.emptyState, style]}>
      <Text style={{ fontSize: 16, fontWeight: '600', color: COLORS.textPrimary, textAlign: 'center' }}>
        {title}
      </Text>
      {subtitle ? (
        <Text style={{ color: COLORS.textSecondary, marginTop: SPACING.sm, marginBottom: onAction ? SPACING.md : 0, textAlign: 'center' }}>
          {subtitle}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <PrimaryButton title={actionLabel} onPress={onAction} />
      ) : null}
    </View>
  );
}
