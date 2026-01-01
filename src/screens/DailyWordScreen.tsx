import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  useColorScheme,
  Alert,
} from "react-native";
import { getColors } from "../lib/colors";
import { Word, WordExample } from "../types";
import { getUserPreferences, saveWordToHistory } from "../lib/storage";
import WordCard from "../components/WordCard";
import ExampleSentence from "../components/ExampleSentence";

const SUPABASE_URL =
  process.env.EXPO_PUBLIC_SUPABASE_URL ||
  "https://dfjvpyggkmzpdhlbhanl.supabase.co";

export default function DailyWordScreen() {
  const systemColorScheme = useColorScheme();
  const isDark = systemColorScheme === "dark";
  const colors = getColors(isDark);

  const [word, setWord] = useState<Word | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    loadNewWord();
  }, []);

  const loadNewWord = async () => {
    setLoading(true);
    try {
      const prefs = await getUserPreferences();
      if (!prefs || prefs.selectedCategories.length === 0) {
        Alert.alert("Error", "No categories selected");
        return;
      }

      // Pick random category from user's selections
      const category =
        prefs.selectedCategories[
          Math.floor(Math.random() * prefs.selectedCategories.length)
        ];

      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/generate-word`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ category }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to generate word");
      }

      const data = await response.json();
      const newWord: Word = {
        id: Date.now().toString(),
        term: data.term,
        category: data.category,
        definition: data.definition,
        examples: data.examples.map((ex: WordExample, idx: number) => ({
          ...ex,
          _key: `${data.term}-${idx}-${Date.now()}`,
        })),
        dateViewed: new Date().toISOString(),
      };

      setWord(newWord);
      await saveWordToHistory(newWord);
    } catch (error) {
      console.error("Error loading word:", error);
      Alert.alert(
        "Error",
        "Failed to load word. Make sure the server is running."
      );
    } finally {
      setLoading(false);
    }
  };

  const loadMoreExamples = async () => {
    if (!word) return;

    setLoadingMore(true);
    try {
      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/generate-examples`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            word: word.term,
            category: word.category,
            count: 3,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to generate examples");
      }

      const data = await response.json();
      const newExamples = data.examples.map((ex: WordExample, idx: number) => ({
        ...ex,
        _key: `${word.term}-${word.examples.length + idx}-${Date.now()}`,
      }));
      setWord({
        ...word,
        examples: [...word.examples, ...newExamples],
      });
    } catch (error) {
      console.error("Error loading more examples:", error);
      Alert.alert("Error", "Failed to load more examples");
    } finally {
      setLoadingMore(false);
    }
  };

  const handleNext = () => {
    loadNewWord();
  };

  const handleSkip = async () => {
    if (word) {
      const skippedWord = { ...word, isSkipped: true as boolean };
      await saveWordToHistory(skippedWord);
    }
    loadNewWord();
  };

  const handleChangeTopic = async () => {
    const prefs = await getUserPreferences();
    if (!prefs) return;

    Alert.alert(
      "Change Topic",
      "Select a category",
      prefs.selectedCategories.map((cat) => ({
        text: cat,
        onPress: async () => {
          setLoading(true);
          try {
            const response = await fetch(
              `${SUPABASE_URL}/functions/v1/generate-word`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ category: cat }),
              }
            );

            if (!response.ok) throw new Error("Failed to generate word");

            const data = await response.json();
            const newWord: Word = {
              id: Date.now().toString(),
              term: data.term,
              category: data.category,
              definition: data.definition,
              examples: data.examples.map((ex: WordExample, idx: number) => ({
                ...ex,
                _key: `${data.term}-${idx}-${Date.now()}`,
              })),
              dateViewed: new Date().toISOString(),
            };

            setWord(newWord);
            await saveWordToHistory(newWord);
          } catch (error) {
            Alert.alert("Error", "Failed to load word");
          } finally {
            setLoading(false);
          }
        },
      })),
      { cancelable: true }
    );
  };

  if (loading && !word) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.bg,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={{ color: colors.textMuted, marginTop: 16, fontSize: 16 }}>
          Loading word...
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: 60,
          paddingHorizontal: 24,
          paddingBottom: 140,
        }}
      >
        {word && (
          <>
            <WordCard word={word} />

            {/* Examples Section */}
            <View style={{ marginTop: 40 }}>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "600",
                  color: colors.text,
                  marginBottom: 20,
                  letterSpacing: 0.5,
                }}
              >
                Examples
              </Text>

              {word.examples.map((example) => (
                <ExampleSentence
                  key={
                    (example as any)._key ||
                    `${word.term}-${example.sentence}-${Math.random()}`
                  }
                  example={example}
                  word={word.term}
                  style={{ marginBottom: 16 }}
                />
              ))}

              {/* Load More Button */}
              <TouchableOpacity
                onPress={loadMoreExamples}
                disabled={loadingMore ? true : false}
                style={{
                  backgroundColor: colors.surface,
                  paddingVertical: 14,
                  borderRadius: 8,
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: colors.border,
                  marginTop: 8,
                }}
              >
                {loadingMore ? (
                  <ActivityIndicator color={colors.accent} />
                ) : (
                  <Text
                    style={{
                      color: colors.accent,
                      fontSize: 14,
                      fontWeight: "600",
                    }}
                  >
                    Show More Examples
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>

      {/* Action Buttons */}
      <View
        style={{
          position: "absolute",
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
        <View style={{ flexDirection: "row", gap: 12 }}>
          <TouchableOpacity
            onPress={handleSkip}
            style={{
              flex: 1,
              backgroundColor: colors.surface,
              paddingVertical: 16,
              borderRadius: 8,
              alignItems: "center",
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text
              style={{ color: colors.text, fontSize: 14, fontWeight: "600" }}
            >
              Skip
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleNext}
            style={{
              flex: 1,
              backgroundColor: colors.accent,
              paddingVertical: 16,
              borderRadius: 8,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#ffffff", fontSize: 14, fontWeight: "600" }}>
              Next
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleChangeTopic}
            style={{
              flex: 1,
              backgroundColor: colors.surface,
              paddingVertical: 16,
              borderRadius: 8,
              alignItems: "center",
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text
              style={{ color: colors.text, fontSize: 14, fontWeight: "600" }}
            >
              Change Topic
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
