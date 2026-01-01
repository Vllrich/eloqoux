import React from 'react';
import { View, Text, useColorScheme, ViewStyle } from 'react-native';
import { getColors } from '../lib/colors';
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

  // Function to highlight the word in the sentence
  const renderHighlightedSentence = () => {
    const sentence = example.sentence;
    const lowerSentence = sentence.toLowerCase();
    const lowerWord = word.toLowerCase();
    const index = lowerSentence.indexOf(lowerWord);

    if (index === -1) {
      return <Text style={{ color: colors.text }}>{sentence}</Text>;
    }

    const before = sentence.substring(0, index);
    const highlighted = sentence.substring(index, index + word.length);
    const after = sentence.substring(index + word.length);

    return (
      <Text style={{ color: colors.text, fontSize: 16, lineHeight: 26 }}>
        {before}
        <Text style={{ color: colors.accent, fontWeight: '600' }}>{highlighted}</Text>
        {after}
      </Text>
    );
  };

  return (
    <View
      style={[
        {
          backgroundColor: colors.surface,
          padding: 20,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: colors.border,
        },
        style,
      ]}
    >
      {/* Sentence with highlighted word */}
      {renderHighlightedSentence()}

      {/* Context */}
      {example.context && (
        <Text
          style={{
            fontSize: 14,
            color: colors.textMuted,
            marginTop: 12,
            fontStyle: 'italic',
          }}
        >
          — {example.context}
        </Text>
      )}
    </View>
  );
}



