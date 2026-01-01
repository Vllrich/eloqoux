import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  Modal,
} from 'react-native';
import { getColors } from '../lib/colors';
import { Word } from '../types';
import { searchWordHistory } from '../lib/storage';
import WordCard from '../components/WordCard';
import ExampleSentence from '../components/ExampleSentence';

export default function SearchScreen() {
  const systemColorScheme = useColorScheme();
  const isDark = systemColorScheme === 'dark';
  const colors = getColors(isDark);

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Word[]>([]);
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query.trim().length >= 2) {
        performSearch();
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const performSearch = async () => {
    const searchResults = await searchWordHistory(query);
    setResults(searchResults);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View
        style={{
          paddingTop: 60,
          paddingHorizontal: 24,
        }}
      >
        {/* Title */}
        <Text
          style={{
            fontSize: 32,
            fontWeight: '300',
            color: colors.text,
            marginBottom: 24,
            letterSpacing: 1,
          }}
        >
          Search
        </Text>

        {/* Search Input */}
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colors.border,
            paddingHorizontal: 16,
            paddingVertical: 14,
            marginBottom: 24,
          }}
        >
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search words, definitions, or examples..."
            placeholderTextColor={colors.textMuted}
            style={{
              fontSize: 16,
              color: colors.text,
            }}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingBottom: 100,
        }}
      >
        {/* Results */}
        {query.trim().length < 2 ? (
          <View style={{ alignItems: 'center', marginTop: 80 }}>
            <Text style={{ fontSize: 48, marginBottom: 16 }}>🔍</Text>
            <Text style={{ fontSize: 16, color: colors.textMuted, textAlign: 'center' }}>
              Type at least 2 characters to search
            </Text>
          </View>
        ) : results.length === 0 ? (
          <View style={{ alignItems: 'center', marginTop: 80 }}>
            <Text style={{ fontSize: 48, marginBottom: 16 }}>🤷</Text>
            <Text style={{ fontSize: 16, color: colors.textMuted, textAlign: 'center' }}>
              No results found for "{query}"
            </Text>
          </View>
        ) : (
          <>
            <Text
              style={{
                fontSize: 14,
                color: colors.textMuted,
                marginBottom: 16,
              }}
            >
              {results.length} result{results.length !== 1 ? 's' : ''}
            </Text>
            <View style={{ gap: 12 }}>
              {results.map((word) => (
                <TouchableOpacity
                  key={word.id}
                  onPress={() => setSelectedWord(word)}
                  style={{
                    backgroundColor: colors.surface,
                    padding: 20,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 24,
                      fontWeight: '500',
                      color: colors.text,
                      marginBottom: 4,
                    }}
                  >
                    {word.term}
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      color: colors.textMuted,
                      marginBottom: 8,
                    }}
                  >
                    {word.category}
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      color: colors.textMuted,
                    }}
                    numberOfLines={2}
                  >
                    {word.definition}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
      </ScrollView>

      {/* Word Detail Modal */}
      <Modal
        visible={selectedWord !== null}
        animationType="slide"
        onRequestClose={() => setSelectedWord(null)}
      >
        <View style={{ flex: 1, backgroundColor: colors.bg }}>
          <ScrollView
            contentContainerStyle={{
              paddingTop: 60,
              paddingHorizontal: 24,
              paddingBottom: 100,
            }}
          >
            {selectedWord && (
              <>
                <WordCard word={selectedWord} />

                <View style={{ marginTop: 40 }}>
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: '600',
                      color: colors.text,
                      marginBottom: 20,
                      letterSpacing: 0.5,
                    }}
                  >
                    Examples
                  </Text>

                  {selectedWord.examples.map((example, index) => (
                    <ExampleSentence
                      key={index}
                      example={example}
                      word={selectedWord.term}
                      style={{ marginBottom: 16 }}
                    />
                  ))}
                </View>
              </>
            )}
          </ScrollView>

          {/* Close Button */}
          <View
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: colors.surface,
              borderTopWidth: 1,
              borderTopColor: colors.border,
              paddingHorizontal: 24,
              paddingVertical: 20,
              paddingBottom: 90,
            }}
          >
            <TouchableOpacity
              onPress={() => setSelectedWord(null)}
              style={{
                backgroundColor: colors.accent,
                paddingVertical: 16,
                borderRadius: 8,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '600' }}>
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}




