import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  useColorScheme,
} from "react-native";
import ReAnimated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
} from "react-native-reanimated";
import { useIsFocused } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getColors } from "../../../shared/lib/colors";
import { fonts } from "../../../shared/lib/typography";
import { QuizCard } from "../../../shared/types";
import { getDueQuizCards, updateQuizCard } from "../../../services/storage";

export default function QuizScreen() {
  const systemColorScheme = useColorScheme();
  const isDark = systemColorScheme === "dark";
  const colors = getColors(isDark);
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();

  const [cards, setCards] = useState<QuizCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [completed, setCompleted] = useState(0);
  const flipProgress = useSharedValue(0);

  const loadCards = useCallback(async () => {
    const due = await getDueQuizCards();
    setCards(due);
    setCurrentIndex(0);
    setRevealed(false);
    setCompleted(0);
    flipProgress.value = 0;
  }, []);

  useEffect(() => {
    if (isFocused) loadCards();
  }, [isFocused, loadCards]);

  const currentCard = cards[currentIndex];

  const handleReveal = () => {
    setRevealed(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    flipProgress.value = withSpring(1, { damping: 15, stiffness: 100 });
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
    flipProgress.value = 0;

    if (currentIndex + 1 < cards.length) {
      setCurrentIndex((i) => i + 1);
    } else {
      setCards([]);
    }
  };

  const frontAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1000 },
      { rotateY: `${interpolate(flipProgress.value, [0, 1], [0, 180])}deg` },
    ],
    backfaceVisibility: 'hidden' as const,
  }));

  const backAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1000 },
      { rotateY: `${interpolate(flipProgress.value, [0, 1], [180, 360])}deg` },
    ],
    backfaceVisibility: 'hidden' as const,
  }));

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
        {completed > 0 ? (
          <>
            <Text
              style={{
                fontFamily: fonts.serif,
                fontSize: 28,
                color: colors.text,
                textAlign: "center",
                marginBottom: 12,
              }}
            >
              Session Complete
            </Text>
            <View style={{ width: 60, height: 1, backgroundColor: colors.accent + '40', marginBottom: 16 }} />
            <Text
              style={{
                fontFamily: fonts.serifItalic,
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
                fontFamily: fonts.serif,
                fontSize: 28,
                color: colors.text,
                textAlign: "center",
                marginBottom: 12,
              }}
            >
              No words to review
            </Text>
            <View style={{ width: 60, height: 1, backgroundColor: colors.accent + '40', marginBottom: 16 }} />
            <Text
              style={{
                fontFamily: fonts.serif,
                fontSize: 16,
                color: colors.textMuted,
                textAlign: "center",
                lineHeight: 26,
              }}
            >
              Save words from the Today tab{"\n"}and they'll appear here for review.
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
          paddingTop: insets.top + 16,
          paddingHorizontal: 24,
          flex: 1,
        }}
      >
        <Text
          style={{
            fontFamily: fonts.serif,
            fontSize: 32,
            color: colors.text,
            marginBottom: 8,
            letterSpacing: -0.5,
          }}
        >
          Quiz
        </Text>
        <Text
          style={{
            fontFamily: fonts.sans,
            fontSize: 13,
            color: colors.textMuted,
            marginBottom: 12,
          }}
        >
          {currentIndex + 1} of {cards.length}  ·  {completed} reviewed
        </Text>
        <View style={{ height: 3, backgroundColor: colors.border + '60', borderRadius: 2, marginBottom: 24 }}>
          <View
            style={{
              height: 3,
              borderRadius: 2,
              backgroundColor: colors.accent,
              width: `${((currentIndex + (revealed ? 0.5 : 0)) / cards.length) * 100}%`,
            }}
          />
        </View>

        <View style={{ flex: 1, justifyContent: "center", marginBottom: 120 }}>
          <View style={{ minHeight: 280 }}>
            <ReAnimated.View
              style={[
                frontAnimatedStyle,
                {
                  backgroundColor: colors.surface,
                  borderRadius: 4,
                  borderWidth: 1,
                  borderColor: colors.border + '80',
                  padding: 32,
                  minHeight: 280,
                  justifyContent: "center",
                },
              ]}
            >
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={!revealed ? handleReveal : undefined}
                accessibilityRole="button"
                accessibilityLabel={`${currentCard.term}. Tap to reveal definition`}
                style={{ flex: 1, justifyContent: "center" }}
              >
                <Text
                  style={{
                    fontFamily: fonts.serifItalic,
                    fontSize: 13,
                    color: colors.accent,
                    letterSpacing: 0.5,
                    marginBottom: 20,
                  }}
                >
                  {currentCard.category}
                </Text>
                <Text
                  style={{
                    fontFamily: fonts.serif,
                    fontSize: 38,
                    color: colors.text,
                    textAlign: "center",
                    marginBottom: 28,
                  }}
                >
                  {currentCard.term}
                </Text>
                <Text
                  style={{
                    fontFamily: fonts.serifItalic,
                    fontSize: 14,
                    color: colors.textMuted,
                    textAlign: "center",
                  }}
                >
                  Tap to reveal definition
                </Text>
              </TouchableOpacity>
            </ReAnimated.View>

            <ReAnimated.View
              style={[
                backAnimatedStyle,
                {
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  backgroundColor: colors.surface,
                  borderRadius: 4,
                  borderWidth: 1,
                  borderColor: colors.border + '80',
                  padding: 32,
                  minHeight: 280,
                  justifyContent: "center",
                },
              ]}
            >
              <Text
                style={{
                  fontFamily: fonts.serifItalic,
                  fontSize: 13,
                  color: colors.accent,
                  letterSpacing: 0.5,
                  marginBottom: 20,
                }}
              >
                {currentCard.category}
              </Text>
              <Text
                style={{
                  fontFamily: fonts.serif,
                  fontSize: 30,
                  color: colors.text,
                  marginBottom: 16,
                }}
              >
                {currentCard.term}
              </Text>
              <Text
                style={{
                  fontFamily: fonts.serif,
                  fontSize: 17,
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
                    paddingLeft: 16,
                    paddingRight: 16,
                    paddingVertical: 14,
                    borderLeftWidth: 3,
                    borderLeftColor: colors.accent + '40',
                    borderRadius: 2,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: fonts.serifItalic,
                      fontSize: 15,
                      color: colors.text,
                      lineHeight: 24,
                    }}
                  >
                    "{currentCard.examples[0].sentence}"
                  </Text>
                </View>
              )}
            </ReAnimated.View>
          </View>
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
            borderTopColor: colors.border + '80',
            paddingHorizontal: 24,
            paddingTop: 16,
            paddingBottom: insets.bottom + 16,
          }}
        >
          <View style={{ flexDirection: "row", gap: 12 }}>
            <TouchableOpacity
              onPress={() => handleAnswer(false)}
              accessibilityRole="button"
              accessibilityLabel="Review again, mark as incorrect"
              style={{
                flex: 1,
                backgroundColor: 'transparent',
                paddingVertical: 16,
                borderRadius: 4,
                alignItems: "center",
                borderWidth: 1,
                borderColor: colors.error + '60',
              }}
            >
              <Text
                style={{ color: colors.error, fontFamily: fonts.sansMedium, fontSize: 14 }}
              >
                Review Again
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleAnswer(true)}
              accessibilityRole="button"
              accessibilityLabel="Got it, mark as correct"
              style={{
                flex: 1,
                backgroundColor: colors.accent,
                paddingVertical: 16,
                borderRadius: 4,
                alignItems: "center",
              }}
            >
              <Text
                style={{ color: "#ffffff", fontFamily: fonts.sansSemiBold, fontSize: 14 }}
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
