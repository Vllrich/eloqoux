import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  useColorScheme,
  Animated,
} from "react-native";
import { useIsFocused } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import { getColors } from "../../../shared/lib/colors";
import { QuizCard } from "../../../shared/types";
import { getDueQuizCards, updateQuizCard } from "../../../services/storage";

export default function QuizScreen() {
  const systemColorScheme = useColorScheme();
  const isDark = systemColorScheme === "dark";
  const colors = getColors(isDark);
  const isFocused = useIsFocused();

  const [cards, setCards] = useState<QuizCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [completed, setCompleted] = useState(0);
  const flipAnim = useRef(new Animated.Value(0)).current;

  const loadCards = useCallback(async () => {
    const due = await getDueQuizCards();
    setCards(due);
    setCurrentIndex(0);
    setRevealed(false);
    setCompleted(0);
    flipAnim.setValue(0);
  }, []);

  useEffect(() => {
    if (isFocused) loadCards();
  }, [isFocused, loadCards]);

  const currentCard = cards[currentIndex];

  const handleReveal = () => {
    setRevealed(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.spring(flipAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 50,
      friction: 8,
    }).start();
  };

  const handleAnswer = async (correct: boolean) => {
    if (!currentCard) return;
    await updateQuizCard(currentCard.wordId, correct);
    Haptics.notificationAsync(
      correct
        ? Haptics.NotificationFeedbackType.Success
        : Haptics.NotificationFeedbackType.Warning
    );

    setCompleted((c) => c + 1);
    setRevealed(false);
    flipAnim.setValue(0);

    if (currentIndex + 1 < cards.length) {
      setCurrentIndex((i) => i + 1);
    } else {
      setCards([]);
    }
  };

  const frontOpacity = flipAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0, 0],
  });

  const backOpacity = flipAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0, 1],
  });

  if (cards.length === 0) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.bg,
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 40,
        }}
      >
        <Text style={{ fontSize: 48, marginBottom: 16 }}>🧠</Text>
        {completed > 0 ? (
          <>
            <Text
              style={{
                fontSize: 24,
                fontWeight: "300",
                color: colors.text,
                textAlign: "center",
                marginBottom: 8,
              }}
            >
              Session Complete!
            </Text>
            <Text
              style={{
                fontSize: 16,
                color: colors.textMuted,
                textAlign: "center",
              }}
            >
              You reviewed {completed} word{completed !== 1 ? "s" : ""} today.
            </Text>
          </>
        ) : (
          <>
            <Text
              style={{
                fontSize: 24,
                fontWeight: "300",
                color: colors.text,
                textAlign: "center",
                marginBottom: 8,
              }}
            >
              No words to review
            </Text>
            <Text
              style={{
                fontSize: 16,
                color: colors.textMuted,
                textAlign: "center",
                lineHeight: 24,
              }}
            >
              Save words from the Today tab and they'll appear here for review
              tomorrow.
            </Text>
          </>
        )}
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View
        style={{
          paddingTop: 60,
          paddingHorizontal: 24,
          flex: 1,
        }}
      >
        <Text
          style={{
            fontSize: 32,
            fontWeight: "300",
            color: colors.text,
            marginBottom: 8,
            letterSpacing: 1,
          }}
        >
          Quiz
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: colors.textMuted,
            marginBottom: 32,
          }}
        >
          {currentIndex + 1} of {cards.length} · {completed} reviewed
        </Text>

        <View style={{ flex: 1, justifyContent: "center", marginBottom: 120 }}>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={!revealed ? handleReveal : undefined}
            style={{
              backgroundColor: colors.surface,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: colors.border,
              padding: 32,
              minHeight: 280,
              justifyContent: "center",
            }}
          >
            <Animated.View style={{ opacity: frontOpacity }}>
              {!revealed && (
                <>
                  <Text
                    style={{
                      fontSize: 12,
                      color: colors.textMuted,
                      textTransform: "uppercase",
                      letterSpacing: 1,
                      marginBottom: 16,
                    }}
                  >
                    {currentCard.category}
                  </Text>
                  <Text
                    style={{
                      fontSize: 40,
                      fontWeight: "300",
                      color: colors.text,
                      textAlign: "center",
                      marginBottom: 24,
                    }}
                  >
                    {currentCard.term}
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      color: colors.textMuted,
                      textAlign: "center",
                    }}
                  >
                    Tap to reveal definition
                  </Text>
                </>
              )}
            </Animated.View>

            <Animated.View
              style={{
                opacity: backOpacity,
                position: revealed ? "relative" : "absolute",
                top: revealed ? undefined : 32,
                left: revealed ? undefined : 32,
                right: revealed ? undefined : 32,
              }}
            >
              {revealed && (
                <>
                  <Text
                    style={{
                      fontSize: 12,
                      color: colors.textMuted,
                      textTransform: "uppercase",
                      letterSpacing: 1,
                      marginBottom: 16,
                    }}
                  >
                    {currentCard.category}
                  </Text>
                  <Text
                    style={{
                      fontSize: 32,
                      fontWeight: "300",
                      color: colors.text,
                      marginBottom: 16,
                    }}
                  >
                    {currentCard.term}
                  </Text>
                  <Text
                    style={{
                      fontSize: 18,
                      color: colors.textMuted,
                      lineHeight: 28,
                      marginBottom: 20,
                    }}
                  >
                    {currentCard.definition}
                  </Text>
                  {currentCard.examples[0] && (
                    <View
                      style={{
                        backgroundColor: colors.bg,
                        padding: 16,
                        borderRadius: 10,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 15,
                          color: colors.text,
                          lineHeight: 24,
                          fontStyle: "italic",
                        }}
                      >
                        "{currentCard.examples[0].sentence}"
                      </Text>
                    </View>
                  )}
                </>
              )}
            </Animated.View>
          </TouchableOpacity>
        </View>
      </View>

      {revealed && (
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
              onPress={() => handleAnswer(false)}
              style={{
                flex: 1,
                backgroundColor: colors.surface,
                paddingVertical: 16,
                borderRadius: 8,
                alignItems: "center",
                borderWidth: 1,
                borderColor: "#e74c3c",
              }}
            >
              <Text
                style={{ color: "#e74c3c", fontSize: 14, fontWeight: "600" }}
              >
                Review Again
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleAnswer(true)}
              style={{
                flex: 1,
                backgroundColor: colors.accent,
                paddingVertical: 16,
                borderRadius: 8,
                alignItems: "center",
              }}
            >
              <Text
                style={{ color: "#ffffff", fontSize: 14, fontWeight: "600" }}
              >
                Got It
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}
