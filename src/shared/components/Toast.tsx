import React, { useEffect, useRef } from 'react';
import { Text, Animated, useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getColors } from '../lib/colors';
import { fonts } from '../lib/typography';

interface ToastProps {
  message: string;
  visible: boolean;
  type?: 'success' | 'error' | 'info';
  onHide: () => void;
  duration?: number;
}

export default function Toast({ message, visible, type = 'info', onHide, duration = 1800 }: ToastProps) {
  const isDark = useColorScheme() === 'dark';
  const colors = getColors(isDark);
  const insets = useSafeAreaInsets();
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    if (visible) {
      opacity.setValue(0);
      translateY.setValue(-20);
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.spring(translateY, { toValue: 0, tension: 80, friction: 10, useNativeDriver: true }),
      ]).start();

      const timer = setTimeout(() => {
        Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }).start(onHide);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible, message]);

  if (!visible) return null;

  const bgColor = type === 'success' ? colors.success : type === 'error' ? colors.error : colors.accent;

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: insets.top + 12,
        left: 24,
        right: 24,
        zIndex: 999,
        opacity,
        transform: [{ translateY }],
        backgroundColor: bgColor,
        paddingHorizontal: 20,
        paddingVertical: 14,
        borderRadius: 4,
        alignItems: 'center',
      }}
      pointerEvents="none"
    >
      <Text style={{ color: '#fff', fontFamily: fonts.sansSemiBold, fontSize: 14, letterSpacing: 0.3 }}>{message}</Text>
    </Animated.View>
  );
}
