import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, PanResponder, Animated, Image, Dimensions } from 'react-native';
import { getImageSource } from '../../shared/media';

interface BeforeAfterSliderProps {
  before: string;
  after: string;
  height?: number;
  style?: any;
  idleAnimate?: boolean;
  showHint?: boolean;
}

export default function BeforeAfterSlider({
  before,
  after,
  height = 420,
  style,
  idleAnimate = false,
  showHint = true,
}: BeforeAfterSliderProps) {
  const [containerX, setContainerX] = useState(0);
  const [displayWidth, setDisplayWidth] = useState(0);
  const sliderX = useRef(new Animated.Value(0)).current;
  const animRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // PanResponder for drag to reveal
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        if (animRef.current) {
          clearTimeout(animRef.current);
          animRef.current = null;
        }
      },
      onPanResponderMove: (_, gesture) => {
        const newX = Math.max(0, Math.min(gesture.moveX - containerX, displayWidth));
        sliderX.setValue(newX);
      },
      onPanResponderRelease: () => {
        // optional snap or idle resume
      },
    })
  ).current;

  // Idle auto-animate (demo polish)
  useEffect(() => {
    if (!idleAnimate || displayWidth === 0) return;

    const animate = () => {
      Animated.sequence([
        Animated.timing(sliderX, { toValue: displayWidth * 0.2, duration: 900, useNativeDriver: false }),
        Animated.timing(sliderX, { toValue: displayWidth * 0.8, duration: 1100, useNativeDriver: false }),
        Animated.timing(sliderX, { toValue: displayWidth * 0.5, duration: 700, useNativeDriver: false }),
      ]).start(() => {
        animRef.current = setTimeout(animate, 1600);
      });
    };

    // start after layout
    const start = setTimeout(animate, 800);
    return () => {
      clearTimeout(start);
      if (animRef.current) clearTimeout(animRef.current);
    };
  }, [idleAnimate, displayWidth, sliderX]);

  // Reset on prop change
  useEffect(() => {
    if (displayWidth > 0) {
      sliderX.setValue(displayWidth * 0.5);
    }
  }, [before, after, displayWidth, sliderX]);

  return (
    <View style={[styles.container, style]}>
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
        {/* Base image (Before) - fixed + normalized URI */}
        <Image 
          source={getImageSource(before)} 
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
            source={getImageSource(after)} 
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
      {showHint && <Text style={styles.hint}>Drag to compare before & after</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 28,
  },
  imageContainer: {
    position: 'relative',
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
  revealImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
  },
  slider: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: '#fff',
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
