import React, { useEffect, useRef } from 'react';
import { View, Animated, useColorScheme } from 'react-native';
import { getColors } from '../lib/colors';

export default function SkeletonCard() {
  const isDark = useColorScheme() === 'dark';
  const colors = getColors(isDark);
  const pulse = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  const skeletonColor = colors.border;

  return (
    <View style={{ paddingTop: 16 }}>
      <Animated.View style={{ opacity: pulse }}>
        <View style={{ width: 120, height: 16, backgroundColor: skeletonColor, borderRadius: 2, marginBottom: 24 }} />
        <View style={{ width: '65%', height: 44, backgroundColor: skeletonColor, borderRadius: 2, marginBottom: 24 }} />
        <View style={{ width: '100%', height: 16, backgroundColor: skeletonColor, borderRadius: 2, marginBottom: 12 }} />
        <View style={{ width: '85%', height: 16, backgroundColor: skeletonColor, borderRadius: 2, marginBottom: 12 }} />
        <View style={{ width: '55%', height: 14, backgroundColor: skeletonColor, borderRadius: 2, marginBottom: 48 }} />

        <View style={{ width: 80, height: 12, backgroundColor: skeletonColor, borderRadius: 2, marginBottom: 20 }} />

        {[1, 2, 3].map((i) => (
          <View
            key={i}
            style={{
              backgroundColor: colors.surface,
              paddingLeft: 20,
              paddingRight: 24,
              paddingVertical: 20,
              borderLeftWidth: 3,
              borderLeftColor: skeletonColor,
              borderRadius: 2,
              marginBottom: 16,
            }}
          >
            <View style={{ width: '100%', height: 16, backgroundColor: skeletonColor, borderRadius: 2, marginBottom: 10 }} />
            <View style={{ width: '70%', height: 16, backgroundColor: skeletonColor, borderRadius: 2 }} />
          </View>
        ))}
      </Animated.View>
    </View>
  );
}
