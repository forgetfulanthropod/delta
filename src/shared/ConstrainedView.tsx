import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { sharedStyles } from './theme';

/**
 * ConstrainedView
 * Reusable wrapper enforcing the desktop-readable constrained layout:
 * maxWidth:720, width:100%, alignSelf:'center' + optional extra padding/overrides.
 * Use in place of ad-hoc <View style={[styles.constrained, ...]}> across screens.
 * Preserves all existing flows and allows per-screen padding overrides via style prop.
 */
interface ConstrainedViewProps extends ViewProps {
  children: React.ReactNode;
  /** Additional padding overrides etc. Merged after base constrained. */
  style?: any;
}

export default function ConstrainedView({ children, style, ...rest }: ConstrainedViewProps) {
  return (
    <View style={[sharedStyles.constrained, style]} {...rest}>
      {children}
    </View>
  );
}
