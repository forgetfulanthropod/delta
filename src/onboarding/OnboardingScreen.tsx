import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image, Platform } from 'react-native';
import BeforeAfterSlider from '../features/design/BeforeAfterSlider';

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

    // Clean, sharp upward Delta (Δ) triangle - straight sides, flat base, pointed top.
    // Rounded corners come from thick rounded stroke (no weird bottom line).
    const path = doc.createElementNS(svgNS, 'path');
    path.setAttribute('d', 'M50,8 L86,80 L14,80 Z');
    path.setAttribute('fill', 'url(#deltaFluid)');
    path.setAttribute('stroke', '#ffffff');
    path.setAttribute('stroke-width', '8.5');
    path.setAttribute('stroke-linejoin', 'round');
    path.setAttribute('stroke-linecap', 'round');
    svg.appendChild(path);

    // subtle inner triangle stroke for liquid depth / highlight ring
    const inner = doc.createElementNS(svgNS, 'path');
    inner.setAttribute('d', 'M50,17 L78,73 L22,73 Z');
    inner.setAttribute('fill', 'none');
    inner.setAttribute('stroke', 'rgba(255,255,255,0.32)');
    inner.setAttribute('stroke-width', '2.5');
    inner.setAttribute('stroke-linejoin', 'round');
    svg.appendChild(inner);

    container.appendChild(svg);

    // state for interaction + fluid idle
    let targetCx = 50;
    let targetCy = 52;
    let isInteracting = false;
    let currCx = 50;
    let currCy = 52;
    let currR = 72;
    let rafId = 0;
    let stopPhase = 0;

    const onPointer = (e: any) => {
      const r = svg.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) return;
      const px = ((e.clientX - r.left) / r.width) * 100;
      const py = ((e.clientY - r.top) / r.height) * 100;
      targetCx = Math.max(20, Math.min(80, px));
      targetCy = Math.max(28, Math.min(70, py));
      isInteracting = true;
    };
    const endInteract = () => { isInteracting = false; };

    svg.addEventListener('pointerdown', onPointer);
    svg.addEventListener('pointermove', onPointer);
    svg.addEventListener('pointerup', endInteract);
    svg.addEventListener('pointerleave', endInteract);

    const loop = () => {
      const t = Date.now() / 1850;

      // organic non-circular idle - summed sines so it never feels like a simple orbiting dot
      const idleCx = 50 + Math.sin(t * 0.65) * 12 + Math.sin(t * 1.75) * 4.8 + Math.cos(t * 0.38) * 2.5;
      const idleCy = 52 + Math.cos(t * 0.52) * 10 + Math.sin(t * 2.1) * 3.8 + Math.sin(t * 0.88) * 2.0;
      const idleR = 68 + Math.sin(t * 0.92) * 12 + Math.cos(t * 0.7) * 4;

      let goalCx = idleCx;
      let goalCy = idleCy;
      let goalR = idleR;

      if (isInteracting) {
        goalCx = targetCx;
        goalCy = targetCy;
        goalR = 82; // bloom the highlight toward the pointer for fluid "color follows you" feel
      }

      // inertia lerp - sloshy, fluid response instead of direct/snappy dot
      currCx = currCx * 0.80 + goalCx * 0.20;
      currCy = currCy * 0.80 + goalCy * 0.20;
      currR = currR * 0.82 + goalR * 0.18;

      grad.setAttribute('cx', `${currCx.toFixed(1)}%`);
      grad.setAttribute('cy', `${currCy.toFixed(1)}%`);
      grad.setAttribute('r', `${currR.toFixed(1)}%`);

      // strong fluid color mixing: animate multiple stop offsets at different rates.
      // This makes the colors inside the triangle keep shifting and blending even when the
      // radial center is moving slowly - the whole fill feels alive/liquid, not a hard dot.
      stopPhase += 0.012;
      const s1 = grad.children[1] as any;
      if (s1 && s1.setAttribute) {
        const off1 = 16 + Math.sin(stopPhase * 1.4) * 8.5;
        s1.setAttribute('offset', `${off1.toFixed(1)}%`);
      }
      const s3 = grad.children[3] as any;
      if (s3 && s3.setAttribute) {
        const off3 = 62 + Math.cos(stopPhase * 0.85) * 9;
        s3.setAttribute('offset', `${off3.toFixed(1)}%`);
      }
      const s4 = grad.children[4] as any;
      if (s4 && s4.setAttribute) {
        const off4 = 88 + Math.sin(stopPhase * 1.1 + 1.2) * 5;
        s4.setAttribute('offset', `${Math.max(80, Math.min(96, off4)).toFixed(1)}%`);
      }

      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafId);
      svg.removeEventListener('pointerdown', onPointer);
      svg.removeEventListener('pointermove', onPointer);
      svg.removeEventListener('pointerup', endInteract);
      svg.removeEventListener('pointerleave', endInteract);
      if (container.contains && container.contains(svg)) container.removeChild(svg);
    };
  }, [size]);

  if (Platform.OS === 'web') {
    return (
      <View
        ref={containerRef as any}
        style={[{ width: size, height: size, overflow: 'hidden' }, style]}
      />
    );
  }

  // Native fallback (web is the primary demo target for the living logo)
  return (
    <View
      style={[
        {
          width: size,
          height: size * 0.85,
          backgroundColor: '#FF385C',
          borderWidth: 5,
          borderColor: '#fff',
          borderRadius: 6,
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
              {/* rivur logo image integrated next to Delta */}
              <Image
                source={{ uri: '/rivur-logo.webp' }}
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
    paddingBottom: 40,
    pointerEvents: 'auto',
  },
  // Constrain UI width for readability, centered
  constrained: {
    maxWidth: 720,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 20,
  },
  logo: {
    fontSize: 46,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 14,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 22,
    paddingHorizontal: 18,
    minHeight: 82,
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
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
  },
});