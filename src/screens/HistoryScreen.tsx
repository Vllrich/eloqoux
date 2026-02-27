import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  useColorScheme,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import { getColors } from '../lib/colors';
import { Word } from '../types';
import { getWordHistory, toggleFavorite, searchWordHistory } from '../lib/storage';
import WordCard from '../components/WordCard';
import ExampleSentence from '../components/ExampleSentence';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HistoryScreen() {
  const systemColorScheme = useColorScheme();
  const isDark = systemColorScheme === 'dark';
  const colors = getColors(isDark);

  const isFocused = useIsFocused();
  const [history, setHistory] = useState<Word[]>([]);
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);
  const [filter, setFilter] = useState<'all' | 'favorites'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const loadHistory = useCallback(async () => {
    const data = await getWordHistory();
    setHistory(data);
  }, []);

  useEffect(() => {
    if (isFocused) loadHistory();
  }, [isFocused, loadHistory]);

  const filteredHistory = (() => {
    let list = history.filter((w) => !w.isSkipped);
    if (filter === 'favorites') list = list.filter((w) => w.isFavorite);
    if (searchQuery.trim().length >= 2) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (w) =>
          w.term.toLowerCase().includes(q) ||
          w.definition.toLowerCase().includes(q) ||
          w.examples.some((ex) => ex.sentence.toLowerCase().includes(q))
      );
    }
    return list;
  })();

  const handleDeleteHistory = () => {
    Alert.alert(
      'Delete History',
      'Are you sure you want to delete all history? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.setItem('@eloquox_word_history', JSON.stringify([]));
            await AsyncStorage.setItem('@eloquox_weekly_stats', JSON.stringify([]));
            setHistory([]);
          },
        },
      ]
    );
  };

  const handleToggleFavorite = async (wordId: string) => {
    await toggleFavorite(wordId);
    await loadHistory();
    if (selectedWord?.id === wordId) {
      setSelectedWord((prev) => prev ? { ...prev, isFavorite: !prev.isFavorite } : null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: 60,
          paddingHorizontal: 24,
          paddingBottom: 100,
        }}
      >
        {/* Title with Delete Button */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
          <Text
            style={{
              fontSize: 32,
              fontWeight: '300',
              color: colors.text,
              letterSpacing: 1,
            }}
          >
            History
          </Text>
          
          {history.length > 0 && (
            <TouchableOpacity
              onPress={handleDeleteHistory}
              style={{
                backgroundColor: colors.border,
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 12,
                marginTop: 8,
              }}
            >
              <Text style={{ fontSize: 11, color: colors.textMuted, fontWeight: '500' }}>
                Delete
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <Text
          style={{
            fontSize: 16,
            color: colors.textMuted,
            marginBottom: 16,
          }}
        >
          {filteredHistory.length} words {filter === 'favorites' ? 'favorited' : 'learned'}
        </Text>

        {/* Search Bar */}
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: colors.border,
            paddingHorizontal: 14,
            paddingVertical: 10,
            marginBottom: 12,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <Ionicons name="search-outline" size={18} color={colors.textMuted} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search words..."
            placeholderTextColor={colors.textMuted}
            style={{ flex: 1, fontSize: 15, color: colors.text, padding: 0 }}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Tabs */}
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 24 }}>
          {(['all', 'favorites'] as const).map((f) => (
            <TouchableOpacity
              key={f}
              onPress={() => setFilter(f)}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
                backgroundColor: filter === f ? colors.accent : colors.surface,
                borderWidth: 1,
                borderColor: filter === f ? colors.accent : colors.border,
              }}
            >
              <Text style={{ fontSize: 13, fontWeight: '600', color: filter === f ? '#ffffff' : colors.text }}>
                {f === 'all' ? 'All' : 'Favorites'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* History List */}
        {filteredHistory.length === 0 ? (
          <View style={{ alignItems: 'center', marginTop: 80 }}>
            <Text style={{ fontSize: 48, marginBottom: 16 }}>{filter === 'favorites' ? '❤️' : '📚'}</Text>
            <Text style={{ fontSize: 16, color: colors.textMuted, textAlign: 'center' }}>
              {filter === 'favorites'
                ? 'No favorites yet.\nTap the heart on words you love.'
                : searchQuery.length >= 2
                  ? `No results for "${searchQuery}"`
                  : 'No words yet.\nStart learning to build your history.'}
            </Text>
          </View>
        ) : (
          <View style={{ gap: 12 }}>
            {filteredHistory.map((word) => (
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
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      <Text style={{ fontSize: 24, fontWeight: '500', color: colors.text }}>
                        {word.term}
                      </Text>
                      {word.isFavorite && <Ionicons name="heart" size={16} color="#e74c3c" />}
                    </View>
                    <Text style={{ fontSize: 14, color: colors.textMuted, marginBottom: 8 }}>
                      {word.category}
                    </Text>
                    <Text numberOfLines={2} style={{ fontSize: 14, color: colors.textMuted }}>
                      {word.definition}
                    </Text>
                  </View>
                  <Text style={{ fontSize: 12, color: colors.textMuted, marginLeft: 12 }}>
                    {formatDate(word.dateViewed)}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
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
                <WordCard
                  word={selectedWord}
                  onToggleFavorite={() => handleToggleFavorite(selectedWord.id)}
                />

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




