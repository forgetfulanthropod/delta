import React from 'react';
import { View, Image, Text, StyleSheet, type ViewStyle } from 'react-native';
import { getImageSource } from './media';
import { useTheme } from './theme';
import { MILKY_INK, milkyFill } from './milkyGradients';

interface ElegantImageProps {
  uri: string;
  label?: string;
  caption?: string;
  aspectRatio?: number;
  style?: ViewStyle;
  testID?: string;
}

/** Simple full-bleed card image for the guided flow. */
export default function ElegantImage({
  uri,
  label,
  caption,
  aspectRatio = 16 / 10,
  style,
  testID,
}: ElegantImageProps) {
  const t = useTheme();

  return (
    <View
      testID={testID}
      style={[
        styles.wrap,
        {
          backgroundColor: t.colors.surfaceAlt,
          borderColor: t.colors.border,
        },
        style,
      ]}
    >
      {label ? (
        <View style={[styles.labelChip, milkyFill('labelChip', '#C4B5FD')]}>
          <Text style={styles.labelText}>{label}</Text>
        </View>
      ) : null}
      <Image
        source={getImageSource(uri)}
        style={[styles.image, { aspectRatio }]}
        resizeMode="cover"
      />
      {caption ? (
        <Text style={[styles.caption, { color: t.colors.textSecondary }]}>{caption}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    marginVertical: 12,
  },
  labelChip: {
    position: 'absolute',
    top: 12,
    left: 12,
    zIndex: 2,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  labelText: {
    color: MILKY_INK,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  image: {
    width: '100%',
  },
  caption: {
    fontSize: 13,
    paddingHorizontal: 14,
    paddingVertical: 10,
    textAlign: 'center',
  },
});