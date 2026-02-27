import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, useColorScheme } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { getColors } from '../../../shared/lib/colors';
import { getCurrentWeekStats, getWordHistory, getUserPreferences, getStreak, getMilestones, checkMilestones } from '../../../services/storage';
import { Category, StreakData, Milestone } from '../../../shared/types';
import StatsCard from '../../../shared/components/StatsCard';

export default function OverviewScreen() {
  const systemColorScheme = useColorScheme();
  const isDark = systemColorScheme === 'dark';
  const colors = getColors(isDark);

  const isFocused = useIsFocused();
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

  useEffect(() => {
    if (isFocused) loadStats();
  }, [isFocused, loadStats]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: 60,
          paddingHorizontal: 24,
          paddingBottom: 100,
        }}
      >
        <Text
          style={{
            fontSize: 32,
            fontWeight: '300',
            color: colors.text,
            marginBottom: 8,
            letterSpacing: 1,
          }}
        >
          Overview
        </Text>

        <Text
          style={{
            fontSize: 16,
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
              borderRadius: 12,
              borderWidth: 1,
              borderColor: colors.border,
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}
          >
            <View>
              <Text style={{ fontSize: 14, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
                Current Streak
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
                <Text style={{ fontSize: 48, fontWeight: '300', color: colors.accent }}>
                  {streak.currentStreak}
                </Text>
                <Text style={{ fontSize: 16, color: colors.textMuted }}>days</Text>
              </View>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ fontSize: 14, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
                Best
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
                <Text style={{ fontSize: 32, fontWeight: '300', color: colors.text }}>
                  {streak.longestStreak}
                </Text>
                <Text style={{ fontSize: 14, color: colors.textMuted }}>days</Text>
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
            subtitle="words in history"
          />

          <View
            style={{
              backgroundColor: colors.surface,
              padding: 24,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text style={{ fontSize: 14, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>
              Milestones
            </Text>
            <View style={{ gap: 14 }}>
              {milestones.map((m) => {
                const value = m.type === 'words' ? totalCount : streak.currentStreak;
                const progress = Math.min(value / m.threshold, 1);
                return (
                  <View key={m.id}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                      <Text style={{ fontSize: 14, color: m.achieved ? colors.accent : colors.text, fontWeight: m.achieved ? '600' : '400' }}>
                        {m.achieved ? '✓ ' : ''}{m.title}
                      </Text>
                      <Text style={{ fontSize: 12, color: colors.textMuted }}>
                        {Math.min(value, m.threshold)}/{m.threshold} {m.type === 'words' ? 'words' : 'days'}
                      </Text>
                    </View>
                    <View style={{ height: 6, backgroundColor: colors.border, borderRadius: 3 }}>
                      <View
                        style={{
                          height: 6,
                          borderRadius: 3,
                          backgroundColor: m.achieved ? colors.accent : colors.textMuted,
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
              borderRadius: 12,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text
              style={{
                fontSize: 14,
                color: colors.textMuted,
                textTransform: 'uppercase',
                letterSpacing: 1,
                marginBottom: 16,
              }}
            >
              By Category
            </Text>

            {Object.keys(categoryBreakdown).length === 0 ? (
              <Text style={{ fontSize: 14, color: colors.textMuted }}>
                No data yet
              </Text>
            ) : (
              <View style={{ gap: 12 }}>
                {Object.entries(categoryBreakdown)
                  .sort(([, a], [, b]) => b - a)
                  .map(([category, count]) => (
                    <View key={category} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={{ fontSize: 16, color: colors.text, flex: 1 }}>
                        {category}
                      </Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                        <View
                          style={{
                            backgroundColor: colors.accent,
                            height: 8,
                            borderRadius: 4,
                            width: Math.max(40, (count / totalCount) * 120),
                          }}
                        />
                        <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, width: 30, textAlign: 'right' }}>
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
              borderRadius: 12,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text
              style={{
                fontSize: 14,
                color: colors.textMuted,
                textTransform: 'uppercase',
                letterSpacing: 1,
                marginBottom: 16,
              }}
            >
              Your Interests
            </Text>

            <View style={{ gap: 8 }}>
              {selectedCategories.map((cat) => (
                <Text key={cat} style={{ fontSize: 16, color: colors.text }}>
                  • {cat}
                </Text>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
