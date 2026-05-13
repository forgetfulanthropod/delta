import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, PanResponder, Animated, Image, Dimensions } from 'react-native';

interface Props {
  before: string;
  after: string;
  autoAnimate?: boolean;
}

const { width } = Dimensions.get('window');

export default function BeforeAfterSlider({ before, after, autoAnimate = false }: Props) {
  const [sliderX, setSliderX] = useState(width * 0.5);
  const pan = useRef(new Animated.Value(width * 0.5)).current;
  const animRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-animate the slider back and forth
  useEffect(() => {
    if (!autoAnimate) return;

    let direction = 1;
    animRef.current = setInterval(() => {
      const target = direction === 1 ? width * 0.2 : width * 0.8;
      Animated.timing(pan, {
        toValue: target,
        duration: 1800,
        useNativeDriver: false,
      }).start(() => {
        setSliderX(target);
      });
      direction = direction === 1 ? -1 : 1;
    }, 2200);

    return () => {
      if (animRef.current) clearInterval(animRef.current);
    };
  }, [autoAnimate]);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gesture) => {
      const newX = Math.max(60, Math.min(width - 60, gesture.moveX));
      pan.setValue(newX);
      setSliderX(newX);
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: before }} style={styles.image} resizeMode="cover" />
        
        <Animated.View style={[styles.afterContainer, { width: pan }]}>
          <Image source={{ uri: after }} style={styles.image} resizeMode="cover" />
        </Animated.View>

        <Animated.View style={[styles.slider, { left: Animated.subtract(pan, 2) }]} {...panResponder.panHandlers}>
          <View style={styles.sliderHandle} />
        </Animated.View>
      </View>
      <Text style={styles.label}>Drag to compare</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 24 },
  imageContainer: { height: 240, borderRadius: 18, overflow: 'hidden', position: 'relative', backgroundColor: '#eee' },
  image: { width: '100%', height: '100%', position: 'absolute' },
  afterContainer: { position: 'absolute', top: 0, left: 0, bottom: 0, overflow: 'hidden' },
  slider: { position: 'absolute', top: 0, bottom: 0, width: 5, backgroundColor: '#fff', zIndex: 20, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 6 },
  sliderHandle: { position: 'absolute', top: '42%', left: -20, width: 46, height: 46, borderRadius: 23, backgroundColor: '#fff', borderWidth: 3, borderColor: '#FF385C', shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 8 },
  label: { textAlign: 'center', color: '#888', marginTop: 8, fontSize: 13 },
});