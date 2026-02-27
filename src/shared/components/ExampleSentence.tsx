import React from 'react';
import { View, Text, useColorScheme, ViewStyle } from 'react-native';
import { getColors } from '../lib/colors';
import { fonts } from '../lib/typography';
import { WordExample } from '../types';

interface ExampleSentenceProps {
  example: WordExample;
  word: string;
  style?: ViewStyle;
}

export default function ExampleSentence({ example, word, style }: ExampleSentenceProps) {
  const systemColorScheme = useColorScheme();
  const isDark = systemColorScheme === 'dark';
  const colors = getColors(isDark);

  const renderHighlightedSentence = () => {
    const sentence = example.sentence;
    const lowerSentence = sentence.toLowerCase();
    const lowerWord = word.toLowerCase();
    const index = lowerSentence.indexOf(lowerWord);

    if (index === -1) {
      return <Text style={{ fontFamily: fonts.serif, color: colors.text }}>{sentence}</Text>;
    }

    const before = sentence.substring(0, index);
    const highlighted = sentence.substring(index, index + word.length);
    const after = sentence.substring(index + word.length);

    return (
      <Text style={{ fontFamily: fonts.serif, color: colors.text, fontSize: 17, lineHeight: 30 }}>
        {before}
        <Text style={{ color: colors.accent, fontFamily: fonts.serifBold }}>{highlighted}</Text>
        {after}
      </Text>
    );
  };

  return (
    <View
      style={[
        {
          backgroundColor: colors.surface,
          paddingLeft: 20,
          paddingRight: 24,
          paddingVertical: 20,
          borderLeftWidth: 3,
          borderLeftColor: colors.accent + '50',
          borderRadius: 2,
        },
        style,
      ]}
    >
      {renderHighlightedSentence()}

      {example.context && (
        <Text
          style={{
            fontFamily: fonts.serifItalic,
            fontSize: 14,
            color: colors.textMuted,
            marginTop: 14,
          }}
        >
          — {example.context}
        </Text>
      )}
    </View>
  );
}
