import React from 'react';
import { TouchableOpacity, Text, TouchableOpacityProps } from 'react-native';
import { sharedStyles } from './theme';

/**
 * SecondaryButton
 * Neutral/dark primary alternative (e.g. "Complete all", generate).
 * Consistent with theme.
 */
interface SecondaryButtonProps extends TouchableOpacityProps {
  children?: React.ReactNode;
  title?: string;
  textStyle?: any;
}

export default function SecondaryButton({
  children,
  title,
  style,
  textStyle,
  ...rest
}: SecondaryButtonProps) {
  return (
    <TouchableOpacity
      style={[sharedStyles.secondaryButton, style]}
      activeOpacity={0.85}
      {...rest}
    >
      {title ? (
        <Text style={[sharedStyles.secondaryButtonText, textStyle]}>{title}</Text>
      ) : (
        children
      )}
    </TouchableOpacity>
  );
}
