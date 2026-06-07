import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
  Platform,
} from 'react-native';
import BeforeAfterSlider from '../features/design/BeforeAfterSlider';
import { getImageSource } from '../shared/media';

const TRIANGLE_WIDTH = Math.round(1072 * 1.3 * 1.3);
const TRIANGLE_HEIGHT = 252;
const TRIANGLE_TOP = -96;

const DeltaTriangle = ({
  width = TRIANGLE_WIDTH,
  height = TRIANGLE_HEIGHT,
  style,
  upsideDown = false,
  opacity = 0.42,
}: {
  width?: number;
  height?: number;
  style?: any;
  upsideDown?: boolean;
  opacity?: number;
}) => {
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
    svg.style.pointerEvents = 'none';

    const defs = doc.createElementNS(svgNS, 'defs');
    const grad = doc.createElementNS(svgNS, 'linearGradient');
    grad.setAttribute('id', 'deltaFluid');
    grad.setAttribute('x1', '0%');
    grad.setAttribute('y1', '0%');
    grad.setAttribute('x2', '100%');
    grad.setAttribute('y2', '100%');

    const stopDefs = [
      ['0%', '#ffe8ee', '0.78'],
      ['35%', '#fff0e0', '0.72'],
      ['65%', '#f0e8ff', '0.68'],
      ['100%', '#e4f9ff', '0.75'],
    ];
    stopDefs.forEach(([offset, color, stopOpacity]) => {
      const s = doc.createElementNS(svgNS, 'stop');
      s.setAttribute('offset', offset);
      s.setAttribute('stop-color', color);
      s.setAttribute('stop-opacity', stopOpacity);
      grad.appendChild(s);
    });
    defs.appendChild(grad);
    svg.appendChild(defs);

    const poly = doc.createElementNS(svgNS, 'polygon');
    poly.setAttribute(
      'points',
      upsideDown ? '50,92 92,14 8,14' : '50,8 95,90 5,90',
    );
    poly.setAttribute('fill', 'url(#deltaFluid)');
    poly.setAttribute('stroke', 'rgba(255,255,255,0.42)');
    poly.setAttribute('stroke-width', '1.5');
    svg.appendChild(poly);

    container.appendChild(svg);
  }, [width, height, upsideDown, opacity]);

  return (
    <View
      ref={containerRef}
      style={[
        {
          width,
          height,
          opacity,
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
  const screenWidth = Dimensions.get('window').width;
  const isWeb = Platform.OS === 'web';
  const [dividerX, setDividerX] = useState(screenWidth * 0.5);
  const [isHoveringAction, setIsHoveringAction] = useState(false);
  const sliderFollowsCursor = isWeb && !isHoveringAction;
  const handleSliderPosition = useCallback((x: number) => {
    setDividerX(x);
  }, []);
  const sliderStyle = useMemo(
    () => ({ marginBottom: 0, flex: 1, width: '100%', height: '100%' }),
    [],
  );

  const webActionHoverHandlers = isWeb
    ? ({
        onMouseEnter: () => setIsHoveringAction(true),
        onMouseLeave: () => setIsHoveringAction(false),
      } as any)
    : {};

  return (
    <View style={styles.screen}>
      <View style={styles.sliderBackground}>
        {isWeb ? (
          <BeforeAfterSlider
            before="/test-images/before-after/before-1.jpg"
            after="/test-images/before-after/after-1.jpg"
            height={screenHeight}
            idleAnimate={isHoveringAction}
            showHint={false}
            showHandle={false}
            followCursor={sliderFollowsCursor}
            interactive
            onPositionChange={handleSliderPosition}
            style={sliderStyle}
          />
        ) : (
          <Image
            source={getImageSource('/test-images/before-after/after-1.jpg')}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
          />
        )}
      </View>

      <View style={styles.overlay} pointerEvents="box-none">
        {isWeb ? (
          <View
            pointerEvents="none"
            style={[styles.topFadeLayer, styles.topFadeBlur, { height: screenHeight / 3 }]}
          />
        ) : null}
        <View style={styles.topBar} pointerEvents="none">
          {!isWeb ? (
            <View
              style={[
                styles.triangleMarker,
                {
                  top: TRIANGLE_TOP,
                  left: screenWidth * 0.5 - TRIANGLE_WIDTH / 2,
                },
              ]}
            >
              <DeltaTriangle width={TRIANGLE_WIDTH} height={TRIANGLE_HEIGHT} upsideDown opacity={1} />
            </View>
          ) : null}
          <View style={styles.brandRow}>
            <Image
              source={getImageSource('/rivur-logo.webp')}
              style={styles.rivurLogo}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.tagline}>Transform the built environment</Text>
        </View>

        <View style={styles.spacer} pointerEvents="none" />

        <View style={styles.actionsWrap} pointerEvents="box-none">
          <View style={styles.actionsRow} {...webActionHoverHandlers}>
            <TouchableOpacity
              style={[styles.actionButton, styles.ownerAction]}
              onPress={() => onSelectRole('owner')}
              activeOpacity={0.85}
            >
              <Text style={[styles.actionTitle, styles.ownerActionTitle]}>Remodel my space</Text>
              <Text style={[styles.actionSubtitle, styles.ownerActionSubtitle]}>
                Reimagine with AI • Make it real
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.workerAction]}
              onPress={() => onSelectRole('worker')}
              activeOpacity={0.85}
            >
              <Text style={[styles.actionTitle, styles.workerActionTitle]}>Work on spaces</Text>
              <Text style={[styles.actionSubtitle, styles.workerActionSubtitle]}>
                Get paid $25 an hour guaranteed
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {isWeb ? (
        <View pointerEvents="none" style={styles.triangleClipLayer}>
          <View
            style={[
              styles.triangleMarker,
              {
                top: 44 + TRIANGLE_TOP,
                left: dividerX - TRIANGLE_WIDTH / 2,
              },
            ]}
          >
            <DeltaTriangle width={TRIANGLE_WIDTH} height={TRIANGLE_HEIGHT} upsideDown opacity={1} />
          </View>
        </View>
      ) : null}
    </View>
  );
}

const ACCENT = '#FF385C';

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#000',
    ...(Platform.OS === 'web' ? { overflowX: 'hidden' as const } : null),
  },
  triangleClipLayer: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
    zIndex: 1,
  } as any,
  sliderBackground: {
    ...StyleSheet.absoluteFill,
    zIndex: 0,
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    zIndex: 2,
    justifyContent: 'space-between',
  },
  topFadeLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 0,
  },
  topFadeBlur: {
    backdropFilter: 'blur(18px)',
    WebkitBackdropFilter: 'blur(18px)',
    backgroundImage: 'linear-gradient(to bottom, rgba(0,0,0,0.38) 0%, rgba(0,0,0,0.12) 55%, rgba(0,0,0,0) 100%)',
    maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.65) 40%, rgba(0,0,0,0.2) 75%, rgba(0,0,0,0) 100%)',
    WebkitMaskImage:
      'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.65) 40%, rgba(0,0,0,0.2) 75%, rgba(0,0,0,0) 100%)',
  } as any,
  topBar: {
    position: 'relative',
    width: '100%',
    alignItems: 'center',
    paddingTop: 44,
    paddingBottom: 12,
    zIndex: 1,
    overflow: 'visible',
  },
  triangleMarker: {
    position: 'absolute',
    zIndex: 0,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    zIndex: 2,
  },
  rivurLogo: {
    width: 216,
    height: 82,
    zIndex: 2,
  },
  tagline: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: 15,
    marginTop: 6,
    letterSpacing: 0.2,
    textAlign: 'center',
    position: 'relative',
    zIndex: 2,
  },
  spacer: {
    flex: 1,
  },
  actionsWrap: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 48,
    paddingTop: 20,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    maxWidth: 720,
    width: '100%',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  ownerAction: {
    backgroundColor: 'rgba(255, 56, 92, 0.72)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  workerAction: {
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.45)',
  },
  actionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
  },
  ownerActionTitle: {
    color: '#fff',
  },
  actionSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.88)',
    marginTop: 4,
    textAlign: 'center',
  },
  ownerActionSubtitle: {
    color: 'rgba(255,255,255,0.88)',
  },
  workerActionTitle: {
    color: '#111',
  },
  workerActionSubtitle: {
    color: 'rgba(17,17,17,0.78)',
  },
});