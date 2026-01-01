import React from 'react';
import { View, Text, useColorScheme } from 'react-native';
import { getColors } from '../lib/colors';
import { Word } from '../types';

interface WordCardProps {
  word: Word;
}

export default function WordCard({ word }: WordCardProps) {
  const systemColorScheme = useColorScheme();
  const isDark = systemColorScheme === 'dark';
  const colors = getColors(isDark);

  return (
    <View>
      {/* Category Badge */}
      <View
        style={{
          alignSelf: 'flex-start',
          backgroundColor: colors.surface,
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: 6,
          borderWidth: 1,
          borderColor: colors.border,
          marginBottom: 16,
        }}
      >
        <Text
          style={{
            fontSize: 12,
            color: colors.textMuted,
            fontWeight: '500',
            textTransform: 'uppercase',
            letterSpacing: 1,
          }}
        >
          {word.category}
        </Text>
      </View>

      {/* Word */}
      <Text
        style={{
          fontSize: 48,
          fontWeight: '300',
          color: colors.text,
          marginBottom: 16,
          letterSpacing: 1,
        }}
      >
        {word.term}
      </Text>

      {/* Definition */}
      <Text
        style={{
          fontSize: 18,
          color: colors.textMuted,
          lineHeight: 28,
          letterSpacing: 0.3,
        }}
      >
        {word.definition}
      </Text>
    </View>
  );
}



