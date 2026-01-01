import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, useColorScheme } from 'react-native';
import { getColors } from '../lib/colors';

interface WelcomeScreenProps {
  onContinue: () => void;
}

export default function WelcomeScreen({ onContinue }: WelcomeScreenProps) {
  const systemColorScheme = useColorScheme();
  const isDark = systemColorScheme === 'dark';
  const colors = getColors(isDark);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 40,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.bg,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
      }}
    >
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
          alignItems: 'center',
        }}
      >
        {/* Logo */}
        <Text
          style={{
            fontSize: 72,
            marginBottom: 24,
          }}
        >
          💬
        </Text>

        {/* App Name */}
        <Text
          style={{
            fontSize: 48,
            fontWeight: '300',
            color: colors.text,
            letterSpacing: 2,
            marginBottom: 12,
          }}
        >
          Eloquox
        </Text>

        {/* Slogan */}
        <Text
          style={{
            fontSize: 18,
            color: colors.textMuted,
            letterSpacing: 3,
            textTransform: 'uppercase',
            fontWeight: '300',
          }}
        >
          say it better
        </Text>
      </Animated.View>

      {/* Continue Button */}
      <Animated.View
        style={{
          opacity: fadeAnim,
          position: 'absolute',
          bottom: 80,
          width: '100%',
          paddingHorizontal: 32,
        }}
      >
        <TouchableOpacity
          onPress={onContinue}
          style={{
            backgroundColor: colors.accent,
            paddingVertical: 18,
            borderRadius: 12,
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              color: '#ffffff',
              fontSize: 16,
              fontWeight: '600',
              letterSpacing: 1,
            }}
          >
            Get Started
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}



