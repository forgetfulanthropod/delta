import React from 'react';
import { TouchableOpacity, Text, TouchableOpacityProps, StyleSheet } from 'react-native';
import { sharedStyles, COLORS, RADII, SPACING } from './theme';

/**
 * PrimaryButton
 * Standardized primary action (accent #FF385C fill).
 * Uses RN TouchableOpacity + Text. Consistent padding/radius across app.
 * Preserves existing $25/hr flows, no behavior change.
 */
interface PrimaryButtonProps extends TouchableOpacityProps {
  children?: React.ReactNode;
  title?: string;
  /** Optional text override style */
  textStyle?: any;
}

export default function PrimaryButton({
  children,
  title,
  style,
  textStyle,
  ...rest
}: PrimaryButtonProps) {
  return (
    <TouchableOpacity
      style={[sharedStyles.primaryButton, style]}
      activeOpacity={0.85}
      {...rest}
    >
      {title ? (
        <Text style={[sharedStyles.primaryButtonText, textStyle]}>{title}</Text>
      ) : (
        children
      )}
    </TouchableOpacity>
  );
}
