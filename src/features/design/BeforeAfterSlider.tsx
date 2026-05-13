import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, PanResponder, Animated, Image, Dimensions } from 'react-native';

interface Props {
  before: string;
  after: string;
  autoAnimate?: boolean;
}

const { width } = Dimensions.get('window');
const IMAGE_HEIGHT = 280; // taller for better view

export default function BeforeAfterSlider({ before, after, autoAnimate = false }: Props) {
  const [sliderX, setSliderX] = useState(width * 0.5);
  const pan = useRef(new Animated.Value(width * 0.5)).current;
  const animRef = useRef<NodeJS.Timeout | null>(null);

  // Auto animate
  useEffect(() => {
    if (!autoAnimate) return;

    let direction = 1;
    animRef.current = setInterval(() => {
      const target = direction === 1 ? width * 0.15 : width * 0.85;
      Animated.timing(pan, {
        toValue: target,
        duration: 1600,
        useNativeDriver: false,
      }).start(() => setSliderX(target));
      direction = direction === 1 ? -1 : 1;
    }, 2000);

    return () => {
      if (animRef.current) clearInterval(animRef.current);
    };
  }, [autoAnimate]);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gesture) => {
      const newX = Math.max(40, Math.min(width - 40, gesture.moveX));
      pan.setValue(newX);
      setSliderX(newX);
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.imageWrapper}>
        {/* Before Image (always visible) */}
        <Image 
          source={{ uri: before }} 
          style={styles.fullImage} 
          resizeMode="cover" 
        />

        {/* After Image (revealed from left) */}
        <Animated.View 
          style={[
            styles.afterReveal, 
            { width: pan }
          ]}
        >
          <Image 
            source={{ uri: after }} 
            style={styles.fullImage} 
            resizeMode="cover" 
          />
        </Animated.View>

        {/* Slider Line + Handle */}
        <Animated.View 
          style={[styles.sliderLine, { left: Animated.subtract(pan, 2) }]} 
          {...panResponder.panHandlers}
        >
          <View style={styles.handle}>
            <View style={styles.handleInner} />
          </View>
        </Animated.View>
      </View>
      <Text style={styles.hint}>Drag the slider to compare</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 28,
  },
  imageWrapper: {
    height: IMAGE_HEIGHT,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
    position: 'relative',
  },
  fullImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    top: 0,
    left: 0,
  },
  afterReveal: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  sliderLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: '#fff',
    zIndex: 10,
  },
  handle: {
    position: 'absolute',
    top: '42%',
    left: -22,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    borderWidth: 3,
    borderColor: '#FF385C',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 5,
  },
  handleInner: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FF385C',
  },
  hint: {
    textAlign: 'center',
    color: '#888',
    marginTop: 8,
    fontSize: 13,
  },
});