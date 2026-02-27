import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  useColorScheme,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getColors } from '../../../shared/lib/colors';
import { fonts } from '../../../shared/lib/typography';
import { Word } from '../../../shared/types';
import { getWordHistory, toggleFavorite } from '../../../services/storage';
import WordDetailModal from '../../../shared/components/WordDetailModal';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HistoryScreen() {
  const systemColorScheme = useColorScheme();
  const isDark = systemColorScheme === 'dark';
  const colors = getColors(isDark);
  const insets = useSafeAreaInsets();

  const isFocused = useIsFocused();
  const [history, setHistory] = useState<Word[]>([]);
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);
  const [filter, setFilter] = useState<'all' | 'favorites'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const loadHistory = useCallback(async () => {
    const data = await getWordHistory();
    setHistory(data);
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadHistory();
    setRefreshing(false);
  }, [loadHistory]);

  useEffect(() => {
    if (isFocused) loadHistory();
  }, [isFocused, loadHistory]);

  const filteredHistory = useMemo(() => {
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
  }, [history, filter, searchQuery]);

  const handleDeleteHistory = () => {
    Alert.alert(
      'Delete All History',
      'This will permanently delete all your saved words and stats. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Everything',
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

  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }, []);

  const renderItem = useCallback(({ item: word }: { item: Word }) => (
    <TouchableOpacity
      onPress={() => setSelectedWord(word)}
      accessibilityRole="button"
      accessibilityLabel={`${word.term}, ${word.category}`}
      style={{
        backgroundColor: colors.surface,
        padding: 20,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: colors.border + '80',
        marginBottom: 12,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Text style={{ fontFamily: fonts.serif, fontSize: 22, color: colors.text }}>
              {word.term}
            </Text>
            {word.isFavorite && <Ionicons name="heart" size={14} color={colors.error} />}
          </View>
          <Text style={{ fontFamily: fonts.serifItalic, fontSize: 13, color: colors.accent, marginBottom: 8 }}>
            {word.category}
          </Text>
          <Text numberOfLines={2} style={{ fontFamily: fonts.serif, fontSize: 14, color: colors.textMuted, lineHeight: 22 }}>
            {word.definition}
          </Text>
        </View>
        <Text style={{ fontFamily: fonts.sans, fontSize: 11, color: colors.textMuted, marginLeft: 12 }}>
          {formatDate(word.dateViewed)}
        </Text>
      </View>
    </TouchableOpacity>
  ), [colors]);

  const ListHeader = useMemo(() => (
    <View>
      <Text
        style={{
          fontFamily: fonts.serif,
          fontSize: 32,
          color: colors.text,
          letterSpacing: -0.5,
          marginBottom: 8,
        }}
      >
        History
      </Text>

      <Text
        style={{
          fontFamily: fonts.serifItalic,
          fontSize: 15,
          color: colors.textMuted,
          marginBottom: 20,
        }}
      >
        {filteredHistory.length} word{filteredHistory.length !== 1 ? 's' : ''} {filter === 'favorites' ? 'favorited' : 'collected'}
      </Text>

      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: 4,
          borderWidth: 1,
          borderColor: colors.border + '80',
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
          placeholder="Search words…"
          placeholderTextColor={colors.textMuted}
          style={{ flex: 1, fontFamily: fonts.sans, fontSize: 15, color: colors.text, padding: 0 }}
          autoCapitalize="none"
          autoCorrect={false}
          accessibilityLabel="Search words"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} accessibilityLabel="Clear search">
            <Ionicons name="close-circle" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 24 }}>
        {(['all', 'favorites'] as const).map((f) => (
          <TouchableOpacity
            key={f}
            onPress={() => setFilter(f)}
            accessibilityRole="button"
            accessibilityState={{ selected: filter === f }}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 4,
              backgroundColor: filter === f ? colors.accent : 'transparent',
              borderWidth: 1,
              borderColor: filter === f ? colors.accent : colors.border,
            }}
          >
            <Text style={{ fontFamily: fonts.sansMedium, fontSize: 13, color: filter === f ? '#ffffff' : colors.text }}>
              {f === 'all' ? 'All' : 'Favorites'}
            </Text>
          </TouchableOpacity>
        ))}

        <View style={{ flex: 1 }} />

        {history.length > 0 && (
          <TouchableOpacity
            onPress={handleDeleteHistory}
            accessibilityLabel="Delete all history"
            style={{
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 4,
              borderWidth: 1,
              borderColor: colors.error + '60',
            }}
          >
            <Text style={{ fontFamily: fonts.sansMedium, fontSize: 13, color: colors.error }}>
              Delete All
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  ), [colors, filteredHistory.length, filter, searchQuery, history.length]);

  const ListEmpty = useMemo(() => (
    <View style={{ alignItems: 'center', marginTop: 80 }}>
      <Text style={{ fontFamily: fonts.serif, fontSize: 48, marginBottom: 16 }}>{filter === 'favorites' ? '♥' : '§'}</Text>
      <Text style={{ fontFamily: fonts.serifItalic, fontSize: 16, color: colors.textMuted, textAlign: 'center', lineHeight: 26 }}>
        {filter === 'favorites'
          ? 'No favourites yet.\nTap the heart on words you love.'
          : searchQuery.length >= 2
            ? `No results for "${searchQuery}"`
            : 'No words yet.\nStart learning to build your collection.'}
      </Text>
    </View>
  ), [colors, filter, searchQuery]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <FlatList
        data={filteredHistory}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={ListEmpty}
        contentContainerStyle={{
          paddingTop: insets.top + 16,
          paddingHorizontal: 24,
          paddingBottom: 100,
          flexGrow: 1,
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accent}
            colors={[colors.accent]}
          />
        }
      />

      <WordDetailModal
        word={selectedWord}
        onClose={() => setSelectedWord(null)}
        onToggleFavorite={selectedWord ? () => handleToggleFavorite(selectedWord.id) : undefined}
      />
    </View>
  );
}
