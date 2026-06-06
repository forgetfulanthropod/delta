import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { useTheme } from './theme';

/**
 * SectionHeader
 * Consistent section titles (e.g. "Scope Tree by Trade", "My Assigned Jobs").
 * Phase 1: theme aware.
 */
interface SectionHeaderProps extends TextProps {
  children: React.ReactNode;
}

export default function SectionHeader({ children, style, ...rest }: SectionHeaderProps) {
  const t = useTheme();
  return (
    <Text 
      style={[{ fontSize: 18, fontWeight: 700, color: t.colors.text, marginBottom: 6 }, style]} 
      {...rest}
    >
      {children}
    </Text>
  );
}
