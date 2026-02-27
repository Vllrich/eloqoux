import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  useColorScheme,
  Alert,
  Dimensions,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { getColors } from "../lib/colors";
import { Word, WordExample } from "../types";
import {
  getUserPreferences,
  saveWordToHistory,
  toggleFavorite,
  hasSeenSwipeExplainer,
  setSwipeExplainerSeen,
} from "../lib/storage";
import WordCard from "../components/WordCard";
import ExampleSentence from "../components/ExampleSentence";

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || "";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;

export default function DailyWordScreen() {
  const systemColorScheme = useColorScheme();
  const isDark = systemColorScheme === "dark";
  const colors = getColors(isDark);

  const [word, setWord] = useState<Word | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showExplainer, setShowExplainer] = useState(false);

  const translateX = useSharedValue(0);
  const cardOpacity = useSharedValue(1);

  useEffect(() => {
    fetchNewWord();
    checkExplainer();
  }, []);

  const checkExplainer = async () => {
    const seen = await hasSeenSwipeExplainer();
    if (!seen) setShowExplainer(true);
  };

  const dismissExplainer = async () => {
    await setSwipeExplainerSeen();
    setShowExplainer(false);
  };

  const fetchWord = async (category: string): Promise<Word> => {
    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/generate-word`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category }),
      }
    );

    if (!response.ok) throw new Error("Failed to generate word");

    const data = await response.json();
    return {
      id: Date.now().toString(),
      term: data.term,
      category: data.category,
      definition: data.definition,
      synonyms: data.synonyms || [],
      antonyms: data.antonyms || [],
      etymology: data.etymology || "",
      examples: data.examples.map((ex: WordExample, idx: number) => ({
        ...ex,
        _key: `${data.term}-${idx}-${Date.now()}`,
      })),
      dateViewed: new Date().toISOString(),
    };
  };

  const fetchNewWord = async () => {
    setLoading(true);
    try {
      const prefs = await getUserPreferences();
      if (!prefs || prefs.selectedCategories.length === 0) {
        Alert.alert("Error", "No categories selected");
        return;
      }
      const category =
        prefs.selectedCategories[
          Math.floor(Math.random() * prefs.selectedCategories.length)
        ];
      const newWord = await fetchWord(category);
      setWord(newWord);
      translateX.value = 0;
      cardOpacity.value = 1;
    } catch (error) {
      console.error("Error loading word:", error);
      Alert.alert("Error", "Failed to load word. Make sure the server is running.");
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
          body: JSON.stringify({ word: word.term, category: word.category, count: 3 }),
        }
      );
      if (!response.ok) throw new Error("Failed to generate examples");
      const data = await response.json();
      const newExamples = data.examples.map((ex: WordExample, idx: number) => ({
        ...ex,
        _key: `${word.term}-${word.examples.length + idx}-${Date.now()}`,
      }));
      setWord({ ...word, examples: [...word.examples, ...newExamples] });
    } catch (error) {
      Alert.alert("Error", "Failed to load more examples");
    } finally {
      setLoadingMore(false);
    }
  };

  const handleNext = useCallback(async () => {
    if (word) await saveWordToHistory(word);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    fetchNewWord();
  }, [word]);

  const handleSkip = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    fetchNewWord();
  }, []);

  const handleToggleFavorite = async () => {
    if (!word) return;
    const newVal = !word.isFavorite;
    setWord({ ...word, isFavorite: newVal });
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
            const newWord = await fetchWord(cat);
            setWord(newWord);
            translateX.value = 0;
            cardOpacity.value = 1;
          } catch {
            Alert.alert("Error", "Failed to load word");
          } finally {
            setLoading(false);
          }
        },
      })),
      { cancelable: true }
    );
  };

  const swipeGesture = Gesture.Pan()
    .activeOffsetX([-20, 20])
    .onUpdate((e) => {
      translateX.value = e.translationX;
    })
    .onEnd((e) => {
      if (e.translationX > SWIPE_THRESHOLD) {
        translateX.value = withTiming(SCREEN_WIDTH, { duration: 200 });
        cardOpacity.value = withTiming(0, { duration: 200 });
        runOnJS(handleNext)();
      } else if (e.translationX < -SWIPE_THRESHOLD) {
        translateX.value = withTiming(-SCREEN_WIDTH, { duration: 200 });
        cardOpacity.value = withTiming(0, { duration: 200 });
        runOnJS(handleSkip)();
      } else {
        translateX.value = withSpring(0);
      }
    });

  const animatedCardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { rotate: `${interpolate(translateX.value, [-SCREEN_WIDTH, 0, SCREEN_WIDTH], [-15, 0, 15])}deg` },
    ],
    opacity: cardOpacity.value,
  }));

  const saveIndicatorStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [0, SWIPE_THRESHOLD], [0, 1], 'clamp'),
  }));

  const skipIndicatorStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [-SWIPE_THRESHOLD, 0], [1, 0], 'clamp'),
  }));

  if (loading && !word) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={{ color: colors.textMuted, marginTop: 16, fontSize: 16 }}>Loading word...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      {/* Swipe Indicators */}
      <Animated.View
        style={[
          saveIndicatorStyle,
          { position: "absolute", top: 80, right: 24, zIndex: 10, backgroundColor: "#2ecc71", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
        ]}
      >
        <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>SAVE</Text>
      </Animated.View>
      <Animated.View
        style={[
          skipIndicatorStyle,
          { position: "absolute", top: 80, left: 24, zIndex: 10, backgroundColor: "#e74c3c", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
        ]}
      >
        <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>SKIP</Text>
      </Animated.View>

      <GestureDetector gesture={swipeGesture}>
        <Animated.View style={[{ flex: 1 }, animatedCardStyle]}>
          <ScrollView
            contentContainerStyle={{
              paddingTop: 60,
              paddingHorizontal: 24,
              paddingBottom: 140,
            }}
          >
            {word && (
              <>
                <WordCard
                  word={word}
                  onToggleFavorite={handleToggleFavorite}
                />

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

                  {word.examples.map((example, idx) => (
                    <ExampleSentence
                      key={(example as any)._key || `${word.term}-${idx}`}
                      example={example}
                      word={word.term}
                      style={{ marginBottom: 16 }}
                    />
                  ))}

                  <TouchableOpacity
                    onPress={loadMoreExamples}
                    disabled={loadingMore}
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
                      <Text style={{ color: colors.accent, fontSize: 14, fontWeight: "600" }}>
                        Show More Examples
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            )}
          </ScrollView>
        </Animated.View>
      </GestureDetector>

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
            <Text style={{ color: colors.text, fontSize: 14, fontWeight: "600" }}>Skip</Text>
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
            <Text style={{ color: "#ffffff", fontSize: 14, fontWeight: "600" }}>Save</Text>
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
            <Text style={{ color: colors.text, fontSize: 14, fontWeight: "600" }}>Topic</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Swipe Explainer Overlay */}
      {showExplainer && (
        <TouchableOpacity
          activeOpacity={1}
          onPress={dismissExplainer}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.75)",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 100,
          }}
        >
          <View style={{ alignItems: "center", paddingHorizontal: 40 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 40, marginBottom: 40 }}>
              <View style={{ alignItems: "center" }}>
                <Text style={{ fontSize: 40 }}>👈</Text>
                <Text style={{ color: "#e74c3c", fontSize: 18, fontWeight: "700", marginTop: 8 }}>Skip</Text>
              </View>
              <View style={{ alignItems: "center" }}>
                <Text style={{ fontSize: 40 }}>👉</Text>
                <Text style={{ color: "#2ecc71", fontSize: 18, fontWeight: "700", marginTop: 8 }}>Save</Text>
              </View>
            </View>
            <Text style={{ color: "#fff", fontSize: 16, textAlign: "center", lineHeight: 24, marginBottom: 32 }}>
              Swipe the card to save or skip.{"\n"}You can also use the buttons below.
            </Text>
            <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 14 }}>Tap anywhere to dismiss</Text>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
}
