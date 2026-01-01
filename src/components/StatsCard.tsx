import React from 'react';
import { View, Text, useColorScheme } from 'react-native';
import { getColors } from '../lib/colors';

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
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      <Text
        style={{
          fontSize: 14,
          color: colors.textMuted,
          textTransform: 'uppercase',
          letterSpacing: 1,
          marginBottom: 8,
        }}
      >
        {title}
      </Text>
      <Text
        style={{
          fontSize: 48,
          fontWeight: '300',
          color: accent ? colors.accent : colors.text,
        }}
      >
        {value}
      </Text>
      {subtitle && (
        <Text
          style={{
            fontSize: 14,
            color: colors.textMuted,
          }}
        >
          {subtitle}
        </Text>
      )}
    </View>
  );
}




