import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, useColorScheme, RefreshControl } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getColors } from '../../../shared/lib/colors';
import { fonts } from '../../../shared/lib/typography';
import { getCurrentWeekStats, getWordHistory, getUserPreferences, getStreak, getMilestones, checkMilestones } from '../../../services/storage';
import { Category, StreakData, Milestone } from '../../../shared/types';
import StatsCard from '../../../shared/components/StatsCard';

export default function OverviewScreen() {
  const systemColorScheme = useColorScheme();
  const isDark = systemColorScheme === 'dark';
  const colors = getColors(isDark);
  const insets = useSafeAreaInsets();

  const isFocused = useIsFocused();
  const [refreshing, setRefreshing] = useState(false);
  const [weeklyCount, setWeeklyCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [streak, setStreakData] = useState<StreakData>({ currentStreak: 0, longestStreak: 0, lastActiveDate: '' });
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState<Record<string, number>>({});
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);

  const loadStats = useCallback(async () => {
    const [weekStats, history, prefs, streakData] = await Promise.all([
      getCurrentWeekStats(),
      getWordHistory(),
      getUserPreferences(),
      getStreak(),
    ]);

    await checkMilestones();

    setWeeklyCount(weekStats?.wordCount || 0);
    setTotalCount(history.filter((w) => !w.isSkipped).length);
    setStreakData(streakData);

    const saved = await getMilestones();
    setMilestones(saved);

    const breakdown: Record<string, number> = {};
    history.forEach((word) => {
      if (!word.isSkipped) breakdown[word.category] = (breakdown[word.category] || 0) + 1;
    });
    setCategoryBreakdown(breakdown);
    setSelectedCategories(prefs?.selectedCategories || []);
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadStats();
    setRefreshing(false);
  }, [loadStats]);

  useEffect(() => {
    if (isFocused) loadStats();
  }, [isFocused, loadStats]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 16,
          paddingHorizontal: 24,
          paddingBottom: 100,
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accent}
            colors={[colors.accent]}
          />
        }
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
          Overview
        </Text>

        <Text
          style={{
            fontFamily: fonts.serifItalic,
            fontSize: 15,
            color: colors.textMuted,
            marginBottom: 40,
          }}
        >
          Your learning progress
        </Text>

        <View style={{ gap: 16 }}>
          <View
            style={{
              backgroundColor: colors.surface,
              padding: 24,
              borderRadius: 4,
              borderWidth: 1,
              borderColor: colors.border + '80',
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}
          >
            <View>
              <Text style={{ fontFamily: fonts.sansMedium, fontSize: 11, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 10 }}>
                Current Streak
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
                <Text style={{ fontFamily: fonts.serif, fontSize: 44, color: colors.accent }}>
                  {streak.currentStreak}
                </Text>
                <Text style={{ fontFamily: fonts.serifItalic, fontSize: 15, color: colors.textMuted }}>days</Text>
              </View>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ fontFamily: fonts.sansMedium, fontSize: 11, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 10 }}>
                Best
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
                <Text style={{ fontFamily: fonts.serif, fontSize: 32, color: colors.text }}>
                  {streak.longestStreak}
                </Text>
                <Text style={{ fontFamily: fonts.serifItalic, fontSize: 14, color: colors.textMuted }}>days</Text>
              </View>
            </View>
          </View>

          <StatsCard
            title="This Week"
            value={weeklyCount}
            subtitle="words learned"
            accent={true}
          />

          <StatsCard
            title="Total"
            value={totalCount}
            subtitle="words in collection"
          />

          <View
            style={{
              backgroundColor: colors.surface,
              padding: 24,
              borderRadius: 4,
              borderWidth: 1,
              borderColor: colors.border + '80',
            }}
          >
            <Text style={{ fontFamily: fonts.sansMedium, fontSize: 11, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 20 }}>
              Milestones
            </Text>
            <View style={{ gap: 16 }}>
              {milestones.map((m) => {
                const value = m.type === 'words' ? totalCount : streak.currentStreak;
                const progress = Math.min(value / m.threshold, 1);
                return (
                  <View key={m.id}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                      <Text style={{ fontFamily: m.achieved ? fonts.serifBold : fonts.serif, fontSize: 14, color: m.achieved ? colors.accent : colors.text }}>
                        {m.achieved ? '✓ ' : ''}{m.title}
                      </Text>
                      <Text style={{ fontFamily: fonts.sans, fontSize: 12, color: colors.textMuted }}>
                        {Math.min(value, m.threshold)}/{m.threshold}
                      </Text>
                    </View>
                    <View style={{ height: 4, backgroundColor: colors.border + '60', borderRadius: 2 }}>
                      <View
                        style={{
                          height: 4,
                          borderRadius: 2,
                          backgroundColor: m.achieved ? colors.accent : colors.textMuted + '60',
                          width: `${progress * 100}%`,
                        }}
                      />
                    </View>
                  </View>
                );
              })}
            </View>
          </View>

          <View
            style={{
              backgroundColor: colors.surface,
              padding: 24,
              borderRadius: 4,
              borderWidth: 1,
              borderColor: colors.border + '80',
            }}
          >
            <Text
              style={{
                fontFamily: fonts.sansMedium,
                fontSize: 11,
                color: colors.textMuted,
                textTransform: 'uppercase',
                letterSpacing: 2,
                marginBottom: 20,
              }}
            >
              By Category
            </Text>

            {Object.keys(categoryBreakdown).length === 0 ? (
              <Text style={{ fontFamily: fonts.serifItalic, fontSize: 14, color: colors.textMuted }}>
                No data yet
              </Text>
            ) : (
              <View style={{ gap: 14 }}>
                {Object.entries(categoryBreakdown)
                  .sort(([, a], [, b]) => b - a)
                  .map(([category, count]) => (
                    <View key={category} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={{ fontFamily: fonts.serif, fontSize: 15, color: colors.text, flex: 1 }}>
                        {category}
                      </Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                        <View
                          style={{
                            backgroundColor: colors.accent,
                            height: 6,
                            borderRadius: 3,
                            width: Math.max(40, (count / totalCount) * 120),
                          }}
                        />
                        <Text style={{ fontFamily: fonts.sansMedium, fontSize: 15, color: colors.text, width: 30, textAlign: 'right' }}>
                          {count}
                        </Text>
                      </View>
                    </View>
                  ))}
              </View>
            )}
          </View>

          <View
            style={{
              backgroundColor: colors.surface,
              padding: 24,
              borderRadius: 4,
              borderWidth: 1,
              borderColor: colors.border + '80',
            }}
          >
            <Text
              style={{
                fontFamily: fonts.sansMedium,
                fontSize: 11,
                color: colors.textMuted,
                textTransform: 'uppercase',
                letterSpacing: 2,
                marginBottom: 20,
              }}
            >
              Your Interests
            </Text>

            <View style={{ gap: 10 }}>
              {selectedCategories.map((cat) => (
                <Text key={cat} style={{ fontFamily: fonts.serif, fontSize: 16, color: colors.text }}>
                  · {cat}
                </Text>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
