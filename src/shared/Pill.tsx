import React, { useMemo } from 'react';
import { View, Text, ViewProps } from 'react-native';
import { useTheme } from './theme';

/**
 * Pill
 * Reusable for costs, points, trades, status badges, filters.
 * Variants via props or style override. Preserves visual language from
 * existing pointsPill, costPill, trade chips, worker filters.
 * Phase 1: theme aware.
 */
interface PillProps extends ViewProps {
  children?: React.ReactNode;
  label?: string;
  /** 'accent' | 'success' | 'neutral' | 'trade' | 'done' etc */
  variant?: 'accent' | 'success' | 'neutral' | 'trade' | 'done';
  textStyle?: any;
}

export default function Pill({
  children,
  label,
  variant = 'neutral',
  style,
  textStyle,
  ...rest
}: PillProps) {
  const t = useTheme();

  const getPillStyle = () => {
    switch (variant) {
      case 'accent':
        return { backgroundColor: t.colors.accent };
      case 'success':
        return { backgroundColor: t.colors.successLight, borderWidth: 1, borderColor: t.colors.success };
      case 'done':
        return { backgroundColor: t.colors.successLight, borderWidth: 1, borderColor: t.colors.success };
      case 'trade':
        return { backgroundColor: '#111' };
      case 'neutral':
      default:
        return { backgroundColor: t.colors.backgroundAlt, borderWidth: 1, borderColor: t.colors.border };
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'accent':
        return { color: '#fff' };
      case 'success':
      case 'done':
        return { color: t.colors.success };
      case 'trade':
        return { color: '#fff' };
      case 'neutral':
      default:
        return { color: t.colors.textPrimary};
    }
  };

  const textContent = useMemo(() => {
    if (label != null && label !== '') {
      return label;
    }

    const parts = React.Children.toArray(children).filter((child) => child != null);

    if (parts.length === 0) {
      return null;
    }

    if (parts.every((part) => typeof part === 'string' || typeof part === 'number')) {
      return parts.map(String).join('');
    }

    return null;
  }, [label, children]);

  return (
    <View
      style={[{ paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999, alignItems: 'center', justifyContent: 'center' }, getPillStyle(), style]}
      {...rest}
    >
      {textContent != null ? (
        <Text style={[{ fontSize: 12, fontWeight: '700' }, getTextStyle(), textStyle]}>
          {textContent}
        </Text>
      ) : children != null ? (
        <Text style={[{ fontSize: 12, fontWeight: '700' }, getTextStyle(), textStyle]}>
          {children}
        </Text>
      ) : null}
    </View>
  );
}
