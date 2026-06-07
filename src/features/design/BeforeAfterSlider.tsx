import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  PanResponder,
  Animated,
  Easing,
  Image,
  Platform,
  type ImageStyle,
} from 'react-native';
import { getImageSource } from '../../shared/media';

const IDLE_MIN_RATIO = 0.4;
const IDLE_MAX_RATIO = 0.6;
const IDLE_LEG_MS = 3600;
const IS_WEB = Platform.OS === 'web';

interface BeforeAfterSliderProps {
  before: string;
  after: string;
  height?: number;
  style?: any;
  idleAnimate?: boolean;
  showHint?: boolean;
  showHandle?: boolean;
  followCursor?: boolean;
  interactive?: boolean;
  onPositionChange?: (x: number) => void;
  positionX?: number;
}

export default function BeforeAfterSlider({
  before,
  after,
  height = 420,
  style,
  idleAnimate = false,
  showHint = true,
  showHandle = false,
  followCursor = false,
  interactive = true,
  onPositionChange,
  positionX,
}: BeforeAfterSliderProps) {
  const containerRef = useRef<View>(null);
  const boundsRef = useRef({ x: 0, width: 0 });
  const containerWidthRef = useRef(0);
  const initializedRef = useRef(false);
  const isDraggingRef = useRef(false);
  const onPositionChangeRef = useRef(onPositionChange);
  const [containerWidth, setContainerWidth] = useState(0);
  const sliderRatio = useRef(new Animated.Value(0.5)).current;
  const animRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef = useRef<number | null>(null);

  onPositionChangeRef.current = onPositionChange;

  const notifyPosition = useCallback((ratio: number) => {
    const width = boundsRef.current.width;
    if (width <= 0) return;
    if (rafRef.current != null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      onPositionChangeRef.current?.(ratio * width);
    });
  }, []);

  const setSliderRatio = useCallback(
    (ratio: number, notify = true) => {
      const clamped = Math.max(0, Math.min(ratio, 1));
      sliderRatio.setValue(clamped);
      if (notify) notifyPosition(clamped);
    },
    [notifyPosition, sliderRatio],
  );

  const setSliderFromClientX = useCallback(
    (clientX: number) => {
      if (isDraggingRef.current) return;
      const { x, width } = boundsRef.current;
      if (width <= 0) return;
      setSliderRatio((clientX - x) / width);
    },
    [setSliderRatio],
  );

  const updateBounds = useCallback(() => {
    if (!IS_WEB || !containerRef.current) return;

    const node = containerRef.current as unknown as HTMLElement;
    const rect = node.getBoundingClientRect?.();
    if (!rect || rect.width <= 0) return;

    boundsRef.current = { x: rect.left, width: rect.width };
    if (containerWidthRef.current !== rect.width) {
      containerWidthRef.current = rect.width;
      setContainerWidth(rect.width);
    }
  }, []);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => interactive,
        onMoveShouldSetPanResponder: () => interactive,
        onPanResponderGrant: (evt) => {
          isDraggingRef.current = true;
          updateBounds();
          if (animRef.current) {
            clearTimeout(animRef.current);
            animRef.current = null;
          }
          sliderRatio.stopAnimation();
          const { x, width } = boundsRef.current;
          if (width > 0) {
            const nativeEvent = evt.nativeEvent as { clientX?: number; pageX?: number };
            const clientX = nativeEvent.clientX ?? nativeEvent.pageX ?? 0;
            setSliderRatio((clientX - x) / width, false);
          }
        },
        onPanResponderMove: (evt) => {
          const { x, width } = boundsRef.current;
          if (width <= 0) return;
          const nativeEvent = evt.nativeEvent as { clientX?: number; pageX?: number };
          const clientX = nativeEvent.clientX ?? nativeEvent.pageX ?? 0;
          setSliderRatio((clientX - x) / width);
        },
        onPanResponderRelease: () => {
          isDraggingRef.current = false;
        },
        onPanResponderTerminate: () => {
          isDraggingRef.current = false;
        },
      }),
    [interactive, setSliderRatio, sliderRatio, updateBounds],
  );

  const handleLayout = useCallback(
    (width: number) => {
      if (width <= 0) return;

      boundsRef.current = { ...boundsRef.current, width };
      containerWidthRef.current = width;
      setContainerWidth(width);
      updateBounds();

      if (!initializedRef.current) {
        initializedRef.current = true;
        const initialRatio =
          positionX != null && width > 0 ? positionX / width : 0.5;
        const clamped = Math.max(0, Math.min(initialRatio, 1));
        sliderRatio.setValue(clamped);
        notifyPosition(clamped);
      }
    },
    [notifyPosition, positionX, sliderRatio, updateBounds],
  );

  useEffect(() => {
    if (!idleAnimate || containerWidth === 0) return undefined;

    const listenerId = sliderRatio.addListener(({ value }) => {
      notifyPosition(value);
    });

    let cancelled = false;

    const timingConfig = (toValue: number) => ({
      toValue,
      duration: IDLE_LEG_MS,
      easing: Easing.inOut(Easing.sin),
      useNativeDriver: false as const,
    });

    const animate = () => {
      if (cancelled) return;

      Animated.sequence([
        Animated.timing(sliderRatio, timingConfig(IDLE_MAX_RATIO)),
        Animated.timing(sliderRatio, timingConfig(IDLE_MIN_RATIO)),
      ]).start(({ finished }) => {
        if (finished && !cancelled) {
          animate();
        }
      });
    };

    const start = setTimeout(animate, 400);

    return () => {
      cancelled = true;
      clearTimeout(start);
      if (animRef.current) clearTimeout(animRef.current);
      sliderRatio.stopAnimation();
      sliderRatio.removeListener(listenerId);
    };
  }, [idleAnimate, containerWidth, sliderRatio, notifyPosition]);

  useEffect(() => {
    if (idleAnimate || positionX == null || containerWidth === 0) return;
    const ratio = Math.max(0, Math.min(positionX / containerWidth, 1));
    sliderRatio.setValue(ratio);
  }, [idleAnimate, positionX, containerWidth, sliderRatio]);

  useEffect(() => {
    if (!followCursor || !interactive || !IS_WEB) return undefined;

    updateBounds();

    const handleMouseMove = (event: MouseEvent) => {
      setSliderFromClientX(event.clientX);
    };

    const handleResize = () => updateBounds();

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
    };
  }, [followCursor, interactive, setSliderFromClientX, updateBounds]);

  useEffect(
    () => () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    },
    [],
  );

  const dividerLeft = useMemo(() => {
    if (containerWidth <= 0) return 0;
    return Animated.subtract(Animated.multiply(sliderRatio, containerWidth), 1);
  }, [containerWidth, sliderRatio]);

  const revealLayerStyle = useMemo(() => {
    if (containerWidth <= 0) return [styles.revealLayer, styles.revealLayerHidden];

    if (IS_WEB) {
      return [
        styles.revealLayer,
        {
          width: containerWidth,
          clipPath: sliderRatio.interpolate({
            inputRange: [0, 1],
            outputRange: ['inset(0 100% 0 0)', 'inset(0 0% 0 0)'],
          }),
        },
      ];
    }

    return [
      styles.revealLayer,
      { width: Animated.multiply(sliderRatio, containerWidth) },
    ];
  }, [containerWidth, sliderRatio]);

  const revealImageStyle = useMemo<ImageStyle | null>(
    () => (containerWidth > 0 ? { width: containerWidth, height } : null),
    [containerWidth, height],
  );

  return (
    <View style={[styles.container, style]}>
      <View
        ref={containerRef}
        style={[
          styles.imageContainer,
          { height, cursor: interactive ? ('col-resize' as any) : undefined },
        ]}
        onLayout={(e) => handleLayout(e.nativeEvent.layout.width)}
        {...(interactive ? panResponder.panHandlers : {})}
      >
        <Image source={getImageSource(before)} style={styles.baseImage} resizeMode="cover" />

        <Animated.View style={revealLayerStyle}>
          <Image
            source={getImageSource(after)}
            style={[styles.revealImage, revealImageStyle]}
            resizeMode="cover"
          />
        </Animated.View>

        <Animated.View style={[styles.slider, { left: dividerLeft }]}>
          {showHandle ? <View style={styles.handle} /> : null}
        </Animated.View>
      </View>
      {showHint ? <Text style={styles.hint}>Drag to compare before & after</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 28,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    overflow: 'hidden',
    backgroundColor: '#111',
  },
  baseImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  revealLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  revealLayerHidden: {
    width: 0,
  },
  revealImage: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  slider: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: 'rgba(255,255,255,0.92)',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 0 },
  },
  handle: {
    position: 'absolute',
    top: '50%',
    left: -10,
    width: 24,
    height: 24,
    marginTop: -12,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 3,
    borderColor: '#000',
  },
  hint: {
    textAlign: 'center',
    color: '#888',
    fontSize: 12,
    marginTop: 6,
  },
});