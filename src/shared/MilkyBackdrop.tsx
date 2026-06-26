import React from 'react';
import { View, StyleSheet } from 'react-native';
import { MILKY_BANDS, milkyFill } from './milkyGradients';

/** Ambient milky canvas + thin rainbow band for owner guided screens. */
export default function MilkyBackdrop() {
  return (
    <View style={styles.root} pointerEvents="none">
      <View style={[styles.canvas, milkyFill('canvas', '#FDF8FF')]} />
      <View style={[styles.rainbowBand, milkyFill('rainbowBand', MILKY_BANDS[0])]} />
      <View style={styles.bandDots}>
        {MILKY_BANDS.map((color) => (
          <View key={color} style={[styles.dot, { backgroundColor: color }]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFill,
    zIndex: 0,
  },
  canvas: {
    ...StyleSheet.absoluteFill,
  },
  rainbowBand: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 5,
  },
  bandDots: {
    position: 'absolute',
    bottom: 72,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    opacity: 0.45,
  },
  dot: {
    width: 28,
    height: 4,
    borderRadius: 2,
  },
});