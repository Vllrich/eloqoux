import React from 'react';
import { View, Text, TouchableOpacity, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { getColors } from '../lib/colors';
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
      {/* Category Badge */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <View
          style={{
            backgroundColor: colors.surface,
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 6,
            borderWidth: 1,
            borderColor: colors.border,
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
        {showFavorite && onToggleFavorite && (
          <TouchableOpacity onPress={onToggleFavorite} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <Ionicons
              name={word.isFavorite ? 'heart' : 'heart-outline'}
              size={24}
              color={word.isFavorite ? '#e74c3c' : colors.textMuted}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Word + Speaker */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <Text
          style={{
            fontSize: 48,
            fontWeight: '300',
            color: colors.text,
            letterSpacing: 1,
            flexShrink: 1,
          }}
        >
          {word.term}
        </Text>
        <TouchableOpacity onPress={handleSpeak} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="volume-high-outline" size={28} color={colors.accent} />
        </TouchableOpacity>
      </View>

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

      {/* Etymology */}
      {word.etymology ? (
        <Text
          style={{
            fontSize: 14,
            color: colors.textMuted,
            fontStyle: 'italic',
            marginTop: 12,
            lineHeight: 22,
          }}
        >
          {word.etymology}
        </Text>
      ) : null}

      {/* Synonyms */}
      {word.synonyms && word.synonyms.length > 0 ? (
        <View style={{ marginTop: 16 }}>
          <Text style={{ fontSize: 12, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
            Synonyms
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {word.synonyms.map((s) => (
              <View key={s} style={{ backgroundColor: colors.surface, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: colors.border }}>
                <Text style={{ fontSize: 13, color: colors.text }}>{s}</Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      {/* Antonyms */}
      {word.antonyms && word.antonyms.length > 0 ? (
        <View style={{ marginTop: 12 }}>
          <Text style={{ fontSize: 12, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
            Antonyms
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {word.antonyms.map((a) => (
              <View key={a} style={{ backgroundColor: colors.surface, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: colors.accent }}>
                <Text style={{ fontSize: 13, color: colors.text }}>{a}</Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}
    </View>
  );
}




