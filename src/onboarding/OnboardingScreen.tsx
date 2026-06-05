import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image } from 'react-native';
import Svg, { Defs, RadialGradient, Stop, Polygon, Path } from 'react-native-svg';
import BeforeAfterSlider from '../features/design/BeforeAfterSlider';

const AnimatedDeltaTriangle = ({ size = 32, style }: { size?: number; style?: any }) => {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    let frame: number;
    const animate = (t = 0) => {
      setPhase((t / 1800) % (Math.PI * 2)); // slow ~1.8s cycle
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);

  // Moving radial center - circular motion inside the triangle
  const cx = 50 + 18 * Math.cos(phase);
  const cy = 48 + 14 * Math.sin(phase * 0.8);

  // Rounded triangle path (upward delta △ with rounded corners)
  const trianglePath =
    'M50,6 Q72,18 80,68 Q68,86 50,80 Q32,86 20,68 Q28,18 50,6 Z';

  return (
    <View style={[{ width: size, height: size * 0.95 }, style]}>
      <Svg width="100%" height="100%" viewBox="0 0 100 95">
        <Defs>
          <RadialGradient
            id="deltaGrad"
            cx={`${cx}%`}
            cy={`${cy}%`}
            r="55%"
            fx="50%"
            fy="45%"
          >
            <Stop offset="0%" stopColor="#00E5FF" stopOpacity="1" />
            <Stop offset="25%" stopColor="#7C4DFF" stopOpacity="1" />
            <Stop offset="55%" stopColor="#FF1A8C" stopOpacity="1" />
            <Stop offset="80%" stopColor="#FF4D00" stopOpacity="0.95" />
            <Stop offset="100%" stopColor="#FF1744" stopOpacity="0.9" />
          </RadialGradient>
        </Defs>

        {/* Main triangle (rounded corners via path) with moving radial gradient */}
        <Path
          d="M50,6 Q70,16 82,65 Q72,82 50,78 Q28,82 18,65 Q30,16 50,6 Z"
          fill="url(#deltaGrad)"
          stroke="#fff"
          strokeWidth="8"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Subtle inner highlight for depth and rounded feel */}
        <Path
          d="M50,11 Q66,19 76,62 Q68,76 50,73 Q32,76 24,62 Q34,19 50,11 Z"
          fill="none"
          stroke="rgba(255,255,255,0.3)"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
};

interface Props {
  onSelectRole: (role: 'owner' | 'worker') => void;
}

export default function OnboardingScreen({ onSelectRole }: Props) {
  const screenHeight = Dimensions.get('window').height;

  return (
    <View style={styles.screen}>
      {/* Full screen before/after slider as background */}
      <View style={styles.sliderBackground}>
        <BeforeAfterSlider
          before="/test-images/before-after/before-1.jpg"
          after="/test-images/before-after/after-1.jpg"
          height={screenHeight}
          idleAnimate={true}
          showHint={false}
        />
      </View>

      {/* Semitransparent UI overlayed on top */}
      <View style={styles.overlay}>
        {/* Top branding bar - semitransparent */}
        <View style={styles.topBar}>
          <View style={styles.constrained}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              {/* rivur logo image integrated next to Delta */}
              <Image
                source={{ uri: '/rivur-logo.webp' }}
                style={{ width: 72, height: 28, marginRight: 10 }}
                resizeMode="contain"
              />
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.logo}>Delta</Text>
                {/* Animated Delta triangle with moving radial gradient + white rounded border */}
                <AnimatedDeltaTriangle size={26} style={{ marginLeft: 6 }} />
              </View>
            </View>
            <Text style={styles.tagline}>Transforming the built environment</Text>
          </View>
        </View>

        {/* Spacer to push bottom UI down */}
        <View style={{ flex: 1 }} />

        {/* Bottom action buttons - large, semitransparent, overlayed */}
        <View style={styles.bottomBar}>
          <View style={styles.constrained}>
            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={[styles.actionButton, styles.ownerAction]}
                onPress={() => onSelectRole('owner')}
                activeOpacity={0.85}
              >
                <Text style={styles.actionTitle}>Remodel my space</Text>
                <Text style={styles.actionSubtitle}>Reimagine with AI • Make it real</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.workerAction]}
                onPress={() => onSelectRole('worker')}
                activeOpacity={0.85}
              >
                <Text style={styles.actionTitle}>Work on spaces</Text>
                <Text style={styles.actionSubtitle}>Get paid $25 an hour guaranteed</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const ACCENT = '#FF385C';

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#000', // full bleed dark
  },
  // Full screen slider background
  sliderBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  // Overlay container for all UI on top of the full screen slider
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
    justifyContent: 'space-between',
  },
  // Top semitransparent bar
  topBar: {
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingTop: 48,
    paddingBottom: 12,
  },
  // Bottom semitransparent bar
  bottomBar: {
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingTop: 12,
    paddingBottom: 40,
  },
  // Constrain UI width for readability, centered
  constrained: {
    maxWidth: 720,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 20,
  },
  logo: {
    fontSize: 26,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 14,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 20,
    paddingHorizontal: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ownerAction: {
    backgroundColor: 'rgba(255, 56, 92, 0.25)',
    borderColor: 'rgba(255, 56, 92, 0.5)',
  },
  workerAction: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderColor: 'rgba(255,255,255,0.25)',
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
  },
});