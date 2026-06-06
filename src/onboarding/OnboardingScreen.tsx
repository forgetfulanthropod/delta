import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image, Platform } from 'react-native';
import BeforeAfterSlider from '../features/design/BeforeAfterSlider';
import { getImageSource } from '../shared/media';
import { useTheme } from '../shared/theme';

const AnimatedDeltaTriangle = ({ size = 120, style }: { size?: number; style?: any }) => {
  const containerRef = useRef<any>(null);

  useEffect(() => {
    if (Platform.OS !== 'web' || !containerRef.current) return;

    const container = containerRef.current as any;
    const svgNS = 'http://www.w3.org/2000/svg';
    const doc: any = (globalThis as any).document || null;
    if (!doc) return;

    container.innerHTML = '';

    const svg = doc.createElementNS(svgNS, 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.setAttribute('viewBox', '0 0 100 100');
    svg.style.display = 'block';
    svg.style.cursor = 'pointer';
    svg.style.touchAction = 'none';

    const defs = doc.createElementNS(svgNS, 'defs');
    const grad = doc.createElementNS(svgNS, 'radialGradient');
    grad.setAttribute('id', 'deltaFluid');
    // larger r + slightly lower cy so the fluid gradient washes across most of the triangle
    grad.setAttribute('cx', '50%');
    grad.setAttribute('cy', '52%');
    grad.setAttribute('r', '72%');

    // vibrant multi-stop for rich fluid color
    const stopDefs = [
      ['0%', '#67e8f9'],
      ['20%', '#a78bfa'],
      ['46%', '#f472b6'],
      ['70%', '#fb923c'],
      ['100%', '#f43f5e'],
    ];
    stopDefs.forEach(([offset, color]) => {
      const s = doc.createElementNS(svgNS, 'stop');
      s.setAttribute('offset', offset);
      s.setAttribute('stop-color', color);
      grad.appendChild(s);
    });
    defs.appendChild(grad);
    svg.appendChild(defs);

    const poly = doc.createElementNS(svgNS, 'polygon');
    poly.setAttribute('points', '50,8 95,90 5,90');
    poly.setAttribute('fill', 'url(#deltaFluid)');
    poly.setAttribute('stroke', '#111');
    poly.setAttribute('stroke-width', '3');
    svg.appendChild(poly);

    container.appendChild(svg);

    // simple click pulse
    const pulse = () => {
      poly.setAttribute('stroke', '#fff');
      setTimeout(() => poly.setAttribute('stroke', '#111'), 220);
    };
    svg.addEventListener('click', pulse);
    svg.addEventListener('touchstart', pulse);
  }, [size]);

  return (
    <View
      ref={containerRef}
      style={[
        {
          width: size,
          height: size,
        },
        style,
      ]}
    />
  );
};

interface Props {
  onSelectRole: (role: 'owner' | 'worker') => void;
}

export default function OnboardingScreen({ onSelectRole }: Props) {
  const screenHeight = Dimensions.get('window').height;
  const t = useTheme();

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
          style={{ marginBottom: 0, flex: 1, width: '100%', height: '100%' }}
        />
      </View>

      {/* Semitransparent UI overlayed on top */}
      <View style={styles.overlay}>
        {/* Top branding bar - semitransparent */}
        <View style={styles.topBar}>
          <View style={styles.constrained}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              {/* rivur logo image integrated next to Delta + URI normalize */}
              <Image
                source={getImageSource('/rivur-logo.webp')}
                style={{ width: 108, height: 41, marginRight: 12 }}
                resizeMode="contain"
              />
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.logo}>Delta</Text>
                {/* Animated Delta triangle - big, interactive, fluid gradient */}
                <AnimatedDeltaTriangle size={120} style={{ marginLeft: 10 }} />
              </View>
            </View>
            <Text style={styles.tagline}>Transforming the built environment</Text>
          </View>
        </View>

        {/* Spacer to push bottom UI down. pointerEvents none so middle screen area passes touches to the full-bleed slider underneath (for drag-to-compare) */}
        <View style={{ flex: 1 }} pointerEvents="none" />

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
    position: 'relative', // ensure absolute children are contained (important for web stacking + events)
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
    paddingBottom: 16,
    pointerEvents: 'auto',
  },
  // Bottom semitransparent bar
  bottomBar: {
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingTop: 12,
    paddingBottom: 24,
    pointerEvents: 'auto',
  },
  constrained: {
    maxWidth: 720,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 20,
  },
  logo: {
    fontSize: 42,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -2,
  },
  tagline: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 15,
    marginTop: 4,
    letterSpacing: 0.3,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 18,
    paddingHorizontal: 18,
    borderRadius: 16,
    alignItems: 'center',
  },
  ownerAction: {
    backgroundColor: ACCENT,
  },
  workerAction: {
    backgroundColor: 'rgba(255,255,255,0.95)',
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
  },
  actionSubtitle: {
    fontSize: 13,
    color: 'rgba(17,17,17,0.7)',
    marginTop: 2,
  },
});
