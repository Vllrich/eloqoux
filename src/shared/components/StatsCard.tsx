import React from 'react';
import { View, Text, useColorScheme } from 'react-native';
import { getColors } from '../lib/colors';
import { fonts } from '../lib/typography';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  accent?: boolean;
}

export default function StatsCard({ title, value, subtitle, accent }: StatsCardProps) {
  const systemColorScheme = useColorScheme();
  const isDark = systemColorScheme === 'dark';
  const colors = getColors(isDark);

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        padding: 24,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: colors.border + '80',
      }}
    >
      <Text
        style={{
          fontFamily: fonts.sansMedium,
          fontSize: 11,
          color: colors.textMuted,
          textTransform: 'uppercase',
          letterSpacing: 2,
          marginBottom: 10,
        }}
      >
        {title}
      </Text>
      <Text
        style={{
          fontFamily: fonts.serif,
          fontSize: 44,
          color: accent ? colors.accent : colors.text,
        }}
      >
        {value}
      </Text>
      {subtitle && (
        <Text
          style={{
            fontFamily: fonts.serifItalic,
            fontSize: 14,
            color: colors.textMuted,
            marginTop: 4,
          }}
        >
          {subtitle}
        </Text>
      )}
    </View>
  );
}
