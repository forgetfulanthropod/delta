import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, PanResponder, Animated, Image, Dimensions } from 'react-native';

interface Props {
  before: string;
  after: string;
  autoAnimate?: boolean;   // legacy wide auto-oscillation (for design demos)
  height?: number;
  idleAnimate?: boolean;   // subtle slow animation 40%-60% when idle (for landing)
}

const { width: windowWidth } = Dimensions.get('window');

export default function BeforeAfterSlider({ before, after, autoAnimate = false, height = 260, idleAnimate = false }: Props) {
  const [displayWidth, setDisplayWidth] = useState(windowWidth);
  const [containerX, setContainerX] = useState(0);
  const sliderX = useRef(new Animated.Value(windowWidth * 0.5)).current;
  const animRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isInteractingRef = useRef(false);
  const idleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Legacy wide auto-animate for design demos
  useEffect(() => {
    if (!autoAnimate) return;

    let direction = 1;
    animRef.current = setInterval(() => {
      const target = direction === 1 ? displayWidth * 0.15 : displayWidth * 0.85;
      Animated.timing(sliderX, {
        toValue: target,
        duration: 1700,
        useNativeDriver: false,
      }).start();
      direction = direction === 1 ? -1 : 1;
    }, 2100);

    return () => {
      if (animRef.current) clearInterval(animRef.current);
    };
  }, [autoAnimate, displayWidth]);

  // Idle subtle animation: slowly ease between 40% and 60% when not being interacted with
  const currentAnimRef = useRef<Animated.CompositeAnimation | null>(null);

  const startIdleAnimation = () => {
    if (!idleAnimate || isInteractingRef.current) return;

    const runCycle = () => {
      if (!idleAnimate || isInteractingRef.current) return;

      const seq = Animated.sequence([
        Animated.timing(sliderX, {
          toValue: displayWidth * 0.4,
          duration: 3800,
          easing: (t) => t * t * (3 - 2 * t), // smooth ease in out
          useNativeDriver: false,
        }),
        Animated.timing(sliderX, {
          toValue: displayWidth * 0.6,
          duration: 3800,
          easing: (t) => t * t * (3 - 2 * t),
          useNativeDriver: false,
        }),
      ]);
      currentAnimRef.current = seq;
      seq.start(() => {
        currentAnimRef.current = null;
        if (!isInteractingRef.current) {
          runCycle();
        }
      });
    };

    // Start from current position toward 40% or 60%
    const current = (sliderX as any)._value || displayWidth * 0.5;
    const target = current > displayWidth * 0.5 ? displayWidth * 0.4 : displayWidth * 0.6;

    const initialTiming = Animated.timing(sliderX, {
      toValue: target,
      duration: 2200,
      easing: (t) => t * t * (3 - 2 * t),
      useNativeDriver: false,
    });
    currentAnimRef.current = initialTiming;
    initialTiming.start(() => {
      currentAnimRef.current = null;
      if (!isInteractingRef.current) runCycle();
    });
  };

  const stopIdleAnimation = () => {
    if (idleTimeoutRef.current) {
      clearTimeout(idleTimeoutRef.current);
      idleTimeoutRef.current = null;
    }
    if (currentAnimRef.current) {
      currentAnimRef.current.stop();
      currentAnimRef.current = null;
    }
  };

  const resumeIdleAfterDelay = () => {
    stopIdleAnimation();
    idleTimeoutRef.current = setTimeout(() => {
      if (!isInteractingRef.current) {
        startIdleAnimation();
      }
    }, 1200);
  };

  // Start idle animation on mount / when enabled
  useEffect(() => {
    if (idleAnimate && displayWidth > 0) {
      // initial position in middle
      sliderX.setValue(displayWidth * 0.5);
      // start after short delay
      const t = setTimeout(startIdleAnimation, 800);
      return () => clearTimeout(t);
    }
    return () => stopIdleAnimation();
  }, [idleAnimate, displayWidth]);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderGrant: (_, gesture) => {
      isInteractingRef.current = true;
      stopIdleAnimation();
      // Support click/tap to position the slider immediately (click anywhere on the image area)
      const localX = gesture.moveX - containerX;
      const newX = Math.max(30, Math.min(displayWidth - 30, localX));
      sliderX.setValue(newX);
    },
    onPanResponderMove: (_, gesture) => {
      // Convert absolute screen position to local position within this slider
      const localX = gesture.moveX - containerX;
      const newX = Math.max(30, Math.min(displayWidth - 30, localX));
      sliderX.setValue(newX);
    },
    onPanResponderRelease: () => {
      isInteractingRef.current = false;
      resumeIdleAfterDelay();
    },
    onPanResponderTerminate: () => {
      isInteractingRef.current = false;
      resumeIdleAfterDelay();
    },
  });

  return (
    <View style={styles.container}>
      <View 
        style={[styles.imageContainer, { height, cursor: 'col-resize' as any }]}
        onLayout={(e) => {
          const { x, width: w } = e.nativeEvent.layout;
          setContainerX(x);
          setDisplayWidth(w);
          // Center the slider on first layout
          sliderX.setValue(w * 0.5);
        }}
        {...panResponder.panHandlers}
      >
        {/* Base image (Before) - fixed */}
        <Image 
          source={{ uri: before }} 
          style={styles.baseImage} 
          resizeMode="cover" 
        />

        {/* Revealing layer (After) */}
        <Animated.View 
          style={[
            styles.revealLayer, 
            { width: sliderX }
          ]}
        >
          <Image 
            source={{ uri: after }} 
            style={[styles.revealImage, { width: displayWidth, height }]} 
            resizeMode="cover" 
          />
        </Animated.View>

        {/* Slider handle (visual only; dragging works on the whole image area) */}
        <Animated.View 
          style={[styles.slider, { left: Animated.subtract(sliderX, 2) }]} 
        >
          <View style={styles.handle} />
        </Animated.View>
      </View>
      <Text style={styles.hint}>Drag to compare before & after</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 28,
  },
  imageContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#f2f2f2',
    position: 'relative',
  },
  baseImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    top: 0,
    left: 0,
  },
  revealLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    overflow: 'hidden',
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
    width: 8,  // slightly thicker for easier clicking
    backgroundColor: '#fff',
    zIndex: 20,
  },
  handle: {
    position: 'absolute',
    top: '42%',
    left: -22,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    borderWidth: 4,
    borderColor: '#FF385C',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  hint: {
    textAlign: 'center',
    color: '#888',
    marginTop: 8,
    fontSize: 13,
  },
});