import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  Modal,
  Alert,
} from 'react-native';
import { getColors } from '../lib/colors';
import { Word } from '../types';
import { getWordHistory } from '../lib/storage';
import WordCard from '../components/WordCard';
import ExampleSentence from '../components/ExampleSentence';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HistoryScreen() {
  const systemColorScheme = useColorScheme();
  const isDark = systemColorScheme === 'dark';
  const colors = getColors(isDark);

  const [history, setHistory] = useState<Word[]>([]);
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const data = await getWordHistory();
    setHistory(data);
  };

  const handleDeleteHistory = () => {
    Alert.alert(
      'Delete History',
      'Are you sure you want to delete all history? This cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
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
            marginBottom: 32,
          }}
        >
          {history.length} words learned
        </Text>

        {/* History List */}
        {history.length === 0 ? (
          <View style={{ alignItems: 'center', marginTop: 80 }}>
            <Text style={{ fontSize: 48, marginBottom: 16 }}>📚</Text>
            <Text style={{ fontSize: 16, color: colors.textMuted, textAlign: 'center' }}>
              No words yet.{'\n'}Start learning to build your history.
            </Text>
          </View>
        ) : (
          <View style={{ gap: 12 }}>
            {history.map((word) => (
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
                        numberOfLines: 2,
                      }}
                    >
                      {word.definition}
                    </Text>
                  </View>
                  <Text
                    style={{
                      fontSize: 12,
                      color: colors.textMuted,
                      marginLeft: 12,
                    }}
                  >
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




