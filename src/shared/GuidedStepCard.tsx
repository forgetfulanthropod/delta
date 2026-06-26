import React from 'react';
import { View, StyleSheet, type ViewProps } from 'react-native';
import { MILKY_BORDER, milkyFill } from './milkyGradients';

interface GuidedStepCardProps extends ViewProps {
  children: React.ReactNode;
}

/** Center-stage card that draws the eye to one question at a time. */
export default function GuidedStepCard({ children, style, ...rest }: GuidedStepCardProps) {
  return (
    <View style={styles.stage}>
      <View style={[styles.card, milkyFill('card', '#FFFFFF'), style]} {...rest}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stage: {
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
    alignItems: 'stretch',
  },
  card: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: MILKY_BORDER,
    paddingHorizontal: 28,
    paddingVertical: 32,
    shadowColor: '#9B8AB8',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 28,
    elevation: 4,
  },
});