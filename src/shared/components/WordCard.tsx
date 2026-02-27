import React from 'react';
import { View, Text, TouchableOpacity, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { getColors } from '../lib/colors';
import { fonts } from '../lib/typography';
import { Word } from '../types';

interface WordCardProps {
  word: Word;
  onToggleFavorite?: () => void;
  showFavorite?: boolean;
}

export default function WordCard({ word, onToggleFavorite, showFavorite = true }: WordCardProps) {
  const systemColorScheme = useColorScheme();
  const isDark = systemColorScheme === 'dark';
  const colors = getColors(isDark);

  const handleSpeak = () => {
    Speech.speak(word.term, { language: 'en', rate: 0.85 });
  };

  return (
    <View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <Text
          style={{
            fontFamily: fonts.serifItalic,
            fontSize: 13,
            color: colors.accent,
            letterSpacing: 0.5,
          }}
        >
          {word.category}
        </Text>
        {showFavorite && onToggleFavorite && (
          <TouchableOpacity onPress={onToggleFavorite} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }} accessibilityRole="button" accessibilityLabel={word.isFavorite ? 'Remove from favorites' : 'Add to favorites'}>
            <Ionicons
              name={word.isFavorite ? 'heart' : 'heart-outline'}
              size={22}
              color={word.isFavorite ? colors.error : colors.textMuted}
            />
          </TouchableOpacity>
        )}
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 20 }}>
        <Text
          style={{
            fontFamily: fonts.serif,
            fontSize: 44,
            color: colors.text,
            letterSpacing: -0.5,
            flexShrink: 1,
          }}
        >
          {word.term}
        </Text>
        <TouchableOpacity onPress={handleSpeak} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} accessibilityRole="button" accessibilityLabel={`Pronounce ${word.term}`}>
          <Ionicons name="volume-high-outline" size={24} color={colors.accent} />
        </TouchableOpacity>
      </View>

      <Text
        style={{
          fontFamily: fonts.serif,
          fontSize: 17,
          color: colors.textMuted,
          lineHeight: 30,
          letterSpacing: 0.2,
        }}
      >
        {word.definition}
      </Text>

      {word.etymology ? (
        <View style={{ marginTop: 20, paddingTop: 20, borderTopWidth: 1, borderTopColor: colors.border + '60' }}>
          <Text
            style={{
              fontFamily: fonts.serifItalic,
              fontSize: 15,
              color: colors.textMuted,
              lineHeight: 24,
            }}
          >
            {word.etymology}
          </Text>
        </View>
      ) : null}

      {word.synonyms && word.synonyms.length > 0 ? (
        <View style={{ marginTop: 24 }}>
          <Text style={{ fontFamily: fonts.sansMedium, fontSize: 11, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 10 }}>
            Synonyms
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {word.synonyms.map((s) => (
              <View key={s} style={{ backgroundColor: colors.bg, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20 }}>
                <Text style={{ fontFamily: fonts.serifItalic, fontSize: 14, color: colors.text }}>{s}</Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      {word.antonyms && word.antonyms.length > 0 ? (
        <View style={{ marginTop: 16 }}>
          <Text style={{ fontFamily: fonts.sansMedium, fontSize: 11, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 10 }}>
            Antonyms
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {word.antonyms.map((a) => (
              <View key={a} style={{ borderWidth: 1, borderColor: colors.accent + '40', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20 }}>
                <Text style={{ fontFamily: fonts.serifItalic, fontSize: 14, color: colors.text }}>{a}</Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}
    </View>
  );
}
