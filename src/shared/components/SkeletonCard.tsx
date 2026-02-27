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
        <View style={{ width: 100, height: 28, backgroundColor: skeletonColor, borderRadius: 6, marginBottom: 20 }} />
        <View style={{ width: '70%', height: 48, backgroundColor: skeletonColor, borderRadius: 8, marginBottom: 20 }} />
        <View style={{ width: '100%', height: 18, backgroundColor: skeletonColor, borderRadius: 4, marginBottom: 10 }} />
        <View style={{ width: '85%', height: 18, backgroundColor: skeletonColor, borderRadius: 4, marginBottom: 10 }} />
        <View style={{ width: '60%', height: 14, backgroundColor: skeletonColor, borderRadius: 4, marginBottom: 40 }} />

        <View style={{ width: 80, height: 18, backgroundColor: skeletonColor, borderRadius: 4, marginBottom: 20 }} />

        {[1, 2, 3].map((i) => (
          <View
            key={i}
            style={{
              backgroundColor: colors.surface,
              padding: 20,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: colors.border,
              marginBottom: 16,
            }}
          >
            <View style={{ width: '100%', height: 16, backgroundColor: skeletonColor, borderRadius: 4, marginBottom: 8 }} />
            <View style={{ width: '75%', height: 16, backgroundColor: skeletonColor, borderRadius: 4 }} />
          </View>
        ))}
      </Animated.View>
    </View>
  );
}
