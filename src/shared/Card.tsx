import React from 'react';
import { View, ViewProps } from 'react-native';
import { sharedStyles } from './theme';

/**
 * Card (generic reusable)
 * White card with border, radius, padding. Can be used for:
 * - JobCard (worker/owner jobs)
 * - ScopeCard / trade groups
 * - Summary panels, empty states (or use EmptyState)
 * Extend via style prop or composition.
 * Also exports JobCard / ScopeCard aliases for semantic use in refactors (thin wrappers).
 */
interface CardProps extends ViewProps {
  children: React.ReactNode;
}

export default function Card({ children, style, ...rest }: CardProps) {
  return (
    <View style={[sharedStyles.card, style]} {...rest}>
      {children}
    </View>
  );
}

// Semantic aliases (no extra styles; use <Card> or these for clarity in screens)
export function JobCard(props: CardProps) {
  return <Card {...props} />;
}

export function ScopeCard(props: CardProps) {
  return <Card {...props} />;
}
