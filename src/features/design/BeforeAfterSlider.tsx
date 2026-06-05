import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, PanResponder, Animated, Image, Dimensions } from 'react-native';

interface Props {
  before: string;
  after: string;
  autoAnimate?: boolean;
  height?: number;
}

const { width: windowWidth } = Dimensions.get('window');

export default function BeforeAfterSlider({ before, after, autoAnimate = false, height = 260 }: Props) {
  const [displayWidth, setDisplayWidth] = useState(windowWidth);
  const [containerX, setContainerX] = useState(0);
  const sliderX = useRef(new Animated.Value(windowWidth * 0.5)).current;
  const animRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auto-animate (uses current displayWidth)
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

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gesture) => {
      // Convert absolute screen position to local position within this slider
      const localX = gesture.moveX - containerX;
      const newX = Math.max(30, Math.min(displayWidth - 30, localX));
      sliderX.setValue(newX);
    },
  });

  return (
    <View style={styles.container}>
      <View 
        style={[styles.imageContainer, { height }]}
        onLayout={(e) => {
          const { x, width: w } = e.nativeEvent.layout;
          setContainerX(x);
          setDisplayWidth(w);
          // Center the slider on first layout
          sliderX.setValue(w * 0.5);
        }}
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

        {/* Slider handle */}
        <Animated.View 
          style={[styles.slider, { left: Animated.subtract(sliderX, 2) }]} 
          {...panResponder.panHandlers}
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
    width: 4,
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