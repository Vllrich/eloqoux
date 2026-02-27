import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  useColorScheme,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getColors } from '../lib/colors';
import { fonts } from '../lib/typography';
import { Word } from '../types';
import WordCard from './WordCard';
import ExampleSentence from './ExampleSentence';

interface WordDetailModalProps {
  word: Word | null;
  onClose: () => void;
  onToggleFavorite?: () => void;
}

export default function WordDetailModal({ word, onClose, onToggleFavorite }: WordDetailModalProps) {
  const isDark = useColorScheme() === 'dark';
  const colors = getColors(isDark);
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={word !== null}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <ScrollView
          contentContainerStyle={{
            paddingTop: insets.top + 16,
            paddingHorizontal: 24,
            paddingBottom: 120,
          }}
        >
          {word && (
            <>
              <WordCard
                word={word}
                onToggleFavorite={onToggleFavorite}
                showFavorite={!!onToggleFavorite}
              />

              <View style={{ marginTop: 48 }}>
                <Text
                  style={{
                    fontFamily: fonts.sansMedium,
                    fontSize: 11,
                    color: colors.textMuted,
                    marginBottom: 20,
                    letterSpacing: 2,
                    textTransform: 'uppercase',
                  }}
                >
                  Examples
                </Text>

                {word.examples.map((example, index) => (
                  <ExampleSentence
                    key={index}
                    example={example}
                    word={word.term}
                    style={{ marginBottom: 16 }}
                  />
                ))}
              </View>
            </>
          )}
        </ScrollView>

        <View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: colors.surface,
            borderTopWidth: 1,
            borderTopColor: colors.border + '80',
            paddingHorizontal: 24,
            paddingTop: 16,
            paddingBottom: insets.bottom + 16,
          }}
        >
          <TouchableOpacity
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Close word details"
            style={{
              backgroundColor: colors.accent,
              paddingVertical: 16,
              borderRadius: 4,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#ffffff', fontFamily: fonts.sansSemiBold, fontSize: 15, letterSpacing: 0.5 }}>
              Close
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
