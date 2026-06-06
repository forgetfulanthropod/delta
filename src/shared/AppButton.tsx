import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from './theme';

interface AppButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost';
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

/**
 * Theme-aware basic Button replacement for shared use (Phase 1).
 * Prevents future duplication of button styles. Consistent padding/typography.
 * Can expand; for now simple + used optionally in updated screens.
 */
export default function AppButton({
  children,
  onPress,
  variant = 'primary',
  disabled,
  style,
  textStyle,
}: AppButtonProps) {
  const t = useTheme();
  const styles = createStyles(t);

  const getBg = () => {
    if (disabled) return '#666';
    switch (variant) {
      case 'accent': return t.colors.accent;
      case 'secondary': return t.colors.backgroundAlt || t.colors.background
      case 'ghost': return 'transparent';
      default: return '#222';
    }
  };

  const getTextColor = () => {
    if (disabled) return '#ccc';
    if (variant === 'secondary') return t.colors.textPrimary
    if (variant === 'ghost') return t.colors.accent;
    return '#fff';
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.base,
        { backgroundColor: getBg() },
        variant === 'ghost' && { borderWidth: 1, borderColor: t.colors.accent },
        style,
      ]}
      activeOpacity={0.85}
    >
      <Text style={[styles.text, { color: getTextColor() }, textStyle]}>
        {children}
      </Text>
    </TouchableOpacity>
  );
}

function createStyles(t: any) {
  return StyleSheet.create({
    base: {
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    text: {
      fontWeight: '600',
      fontSize: 15,
    },
  });
}
