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
  Modal,
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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getColors } from "../../../shared/lib/colors";
import { Word, WordExample } from "../../../shared/types";
import {
  getUserPreferences,
  saveWordToHistory,
  toggleFavorite,
  hasSeenSwipeExplainer,
  setSwipeExplainerSeen,
} from "../../../services/storage";
import { generateWord, generateExamples } from "../../../services/api";
import WordCard from "../../../shared/components/WordCard";
import ExampleSentence from "../../../shared/components/ExampleSentence";
import Toast from "../../../shared/components/Toast";
import SkeletonCard from "../../../shared/components/SkeletonCard";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;

export default function DailyWordScreen() {
  const systemColorScheme = useColorScheme();
  const isDark = systemColorScheme === "dark";
  const colors = getColors(isDark);
  const insets = useSafeAreaInsets();

  const [word, setWord] = useState<Word | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showExplainer, setShowExplainer] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [showTopicPicker, setShowTopicPicker] = useState(false);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);

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

  const fetchNewWord = useCallback(async () => {
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
      const newWord = await generateWord(category);
      setWord(newWord);
      translateX.value = 0;
      cardOpacity.value = 1;
    } catch (error) {
      console.error("Error loading word:", error);
      Alert.alert("Error", "Failed to load word. Make sure the server is running.");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMoreExamples = async () => {
    if (!word) return;
    setLoadingMore(true);
    try {
      const newExamples = await generateExamples(word.term, word.category, 3);
      const keyedExamples = newExamples.map((ex: WordExample, idx: number) => ({
        ...ex,
        _key: `${word.term}-${word.examples.length + idx}-${Date.now()}`,
      }));
      setWord({ ...word, examples: [...word.examples, ...keyedExamples] });
    } catch (error) {
      Alert.alert("Error", "Failed to load more examples");
    } finally {
      setLoadingMore(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
  };

  const handleNext = useCallback(async () => {
    if (word) await saveWordToHistory(word);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    showToast("Word saved", "success");
    fetchNewWord();
  }, [word, fetchNewWord]);

  const handleSkip = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    showToast("Skipped", "info");
    fetchNewWord();
  }, [fetchNewWord]);

  const handleToggleFavorite = async () => {
    if (!word) return;
    const newVal = !word.isFavorite;
    setWord({ ...word, isFavorite: newVal });
  };

  const handleChangeTopic = async () => {
    const prefs = await getUserPreferences();
    if (!prefs) return;
    setAvailableCategories(prefs.selectedCategories);
    setShowTopicPicker(true);
  };

  const selectTopic = async (cat: string) => {
    setShowTopicPicker(false);
    setLoading(true);
    try {
      const newWord = await generateWord(cat);
      setWord(newWord);
      translateX.value = 0;
      cardOpacity.value = 1;
    } catch {
      Alert.alert("Error", "Failed to load word");
    } finally {
      setLoading(false);
    }
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
      <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top + 16, paddingHorizontal: 24 }}>
        <SkeletonCard />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Toast
        message={toast?.message || ""}
        visible={!!toast}
        type={toast?.type}
        onHide={() => setToast(null)}
      />
      <Animated.View
        style={[
          saveIndicatorStyle,
          { position: "absolute", top: insets.top + 20, right: 24, zIndex: 10, backgroundColor: colors.success, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
        ]}
      >
        <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>SAVE</Text>
      </Animated.View>
      <Animated.View
        style={[
          skipIndicatorStyle,
          { position: "absolute", top: insets.top + 20, left: 24, zIndex: 10, backgroundColor: colors.error, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
        ]}
      >
        <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>SKIP</Text>
      </Animated.View>

      <GestureDetector gesture={swipeGesture}>
        <Animated.View style={[{ flex: 1 }, animatedCardStyle]}>
          <ScrollView
            contentContainerStyle={{
              paddingTop: insets.top + 16,
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
          paddingTop: 16,
          paddingBottom: insets.bottom + 16,
        }}
      >
        <View style={{ flexDirection: "row", gap: 12 }}>
          <TouchableOpacity
            onPress={handleSkip}
            accessibilityRole="button"
            accessibilityLabel="Skip this word"
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
            accessibilityRole="button"
            accessibilityLabel="Save this word"
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
            accessibilityRole="button"
            accessibilityLabel="Change topic category"
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
                <Text style={{ color: colors.error, fontSize: 18, fontWeight: "700", marginTop: 8 }}>Skip</Text>
              </View>
              <View style={{ alignItems: "center" }}>
                <Text style={{ fontSize: 40 }}>👉</Text>
                <Text style={{ color: colors.success, fontSize: 18, fontWeight: "700", marginTop: 8 }}>Save</Text>
              </View>
            </View>
            <Text style={{ color: "#fff", fontSize: 16, textAlign: "center", lineHeight: 24, marginBottom: 32 }}>
              Swipe the card to save or skip.{"\n"}You can also use the buttons below.
            </Text>
            <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 14 }}>Tap anywhere to dismiss</Text>
          </View>
        </TouchableOpacity>
      )}

      <Modal
        visible={showTopicPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTopicPicker(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setShowTopicPicker(false)}
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" }}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {}}
            style={{
              backgroundColor: colors.surface,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              paddingTop: 12,
              paddingBottom: insets.bottom + 16,
              paddingHorizontal: 24,
            }}
          >
            <View style={{ width: 36, height: 4, backgroundColor: colors.border, borderRadius: 2, alignSelf: "center", marginBottom: 20 }} />
            <Text style={{ fontSize: 20, fontWeight: "600", color: colors.text, marginBottom: 20 }}>
              Change Topic
            </Text>
            {availableCategories.map((cat) => (
              <TouchableOpacity
                key={cat}
                onPress={() => selectTopic(cat)}
                accessibilityRole="button"
                style={{
                  paddingVertical: 16,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                }}
              >
                <Text style={{ fontSize: 16, color: colors.text }}>{cat}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              onPress={() => setShowTopicPicker(false)}
              style={{ marginTop: 16, paddingVertical: 14, alignItems: "center" }}
            >
              <Text style={{ fontSize: 16, color: colors.textMuted, fontWeight: "600" }}>Cancel</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
