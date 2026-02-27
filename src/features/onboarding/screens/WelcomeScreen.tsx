import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, useColorScheme } from 'react-native';
import { getColors } from '../../../shared/lib/colors';
import { fonts } from '../../../shared/lib/typography';

interface WelcomeScreenProps {
  onContinue: () => void;
}

export default function WelcomeScreen({ onContinue }: WelcomeScreenProps) {
  const systemColorScheme = useColorScheme();
  const isDark = systemColorScheme === 'dark';
  const colors = getColors(isDark);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 30,
        friction: 8,
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
        <View style={{ width: 80, height: 1, backgroundColor: colors.accent + '40', marginBottom: 40 }} />

        <Text
          style={{
            fontFamily: fonts.serif,
            fontSize: 52,
            color: colors.text,
            letterSpacing: -0.5,
            marginBottom: 16,
          }}
        >
          Eloquox
        </Text>

        <Text
          style={{
            fontFamily: fonts.sansMedium,
            fontSize: 13,
            color: colors.textMuted,
            letterSpacing: 4,
            textTransform: 'uppercase',
          }}
        >
          say it better
        </Text>

        <View style={{ width: 80, height: 1, backgroundColor: colors.accent + '40', marginTop: 40 }} />
      </Animated.View>

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
            borderRadius: 4,
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              color: '#ffffff',
              fontFamily: fonts.sansSemiBold,
              fontSize: 15,
              letterSpacing: 0.5,
            }}
          >
            Get Started
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}
