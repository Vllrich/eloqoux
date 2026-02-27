import AsyncStorage from '@react-native-async-storage/async-storage';
import { Word, WeeklyStats, Category, StreakData, Milestone } from '../../shared/types';
import { STORAGE_KEYS } from './keys';

function getWeekStart(date: Date = new Date()): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday.toISOString();
}

function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

export async function updateWeeklyStats(word: Word): Promise<void> {
  try {
    const weekStart = getWeekStart();
    const allStats = await getWeeklyStats();

    let currentWeekStats = allStats.find((s) => s.weekStart === weekStart);

    if (!currentWeekStats) {
      currentWeekStats = {
        weekStart,
        wordCount: 0,
        categoryBreakdown: {} as Record<Category, number>,
      };
      allStats.push(currentWeekStats);
    }

    currentWeekStats.wordCount++;
    currentWeekStats.categoryBreakdown[word.category] =
      (currentWeekStats.categoryBreakdown[word.category] || 0) + 1;

    await AsyncStorage.setItem(STORAGE_KEYS.WEEKLY_STATS, JSON.stringify(allStats));
  } catch (error) {
    console.error('Error updating weekly stats:', error);
  }
}

export async function getWeeklyStats(): Promise<WeeklyStats[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.WEEKLY_STATS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting weekly stats:', error);
    return [];
  }
}

export async function getCurrentWeekStats(): Promise<WeeklyStats | null> {
  try {
    const allStats = await getWeeklyStats();
    const weekStart = getWeekStart();
    return allStats.find((s) => s.weekStart === weekStart) || null;
  } catch (error) {
    console.error('Error getting current week stats:', error);
    return null;
  }
}

export async function getStreak(): Promise<StreakData> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.STREAK);
    return data ? JSON.parse(data) : { currentStreak: 0, longestStreak: 0, lastActiveDate: '' };
  } catch {
    return { currentStreak: 0, longestStreak: 0, lastActiveDate: '' };
  }
}

export async function updateStreak(): Promise<void> {
  try {
    const streak = await getStreak();
    const today = getTodayDate();
    if (streak.lastActiveDate === today) return;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (streak.lastActiveDate === yesterdayStr) {
      streak.currentStreak += 1;
    } else {
      streak.currentStreak = 1;
    }
    streak.lastActiveDate = today;
    streak.longestStreak = Math.max(streak.longestStreak, streak.currentStreak);
    await AsyncStorage.setItem(STORAGE_KEYS.STREAK, JSON.stringify(streak));
  } catch (error) {
    console.error('Error updating streak:', error);
  }
}

const MILESTONE_DEFS: Omit<Milestone, 'achieved' | 'achievedDate'>[] = [
  { id: 'w10', title: 'First Steps', threshold: 10, type: 'words' },
  { id: 'w25', title: 'Getting Fluent', threshold: 25, type: 'words' },
  { id: 'w50', title: 'Word Collector', threshold: 50, type: 'words' },
  { id: 'w100', title: 'Centurion', threshold: 100, type: 'words' },
  { id: 'w250', title: 'Lexicon Master', threshold: 250, type: 'words' },
  { id: 's3', title: 'On a Roll', threshold: 3, type: 'streak' },
  { id: 's7', title: 'Week Warrior', threshold: 7, type: 'streak' },
  { id: 's14', title: 'Fortnight Focus', threshold: 14, type: 'streak' },
  { id: 's30', title: 'Monthly Maven', threshold: 30, type: 'streak' },
  { id: 's100', title: 'Unstoppable', threshold: 100, type: 'streak' },
];

export async function getMilestones(): Promise<Milestone[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.MILESTONES);
    const saved: Milestone[] = data ? JSON.parse(data) : [];
    return MILESTONE_DEFS.map((def) => {
      const existing = saved.find((m) => m.id === def.id);
      return existing || { ...def, achieved: false };
    });
  } catch {
    return MILESTONE_DEFS.map((def) => ({ ...def, achieved: false }));
  }
}

export async function checkMilestones(): Promise<Milestone[]> {
  try {
    const milestones = await getMilestones();
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.WORD_HISTORY);
    const history: Word[] = raw ? JSON.parse(raw) : [];
    const streak = await getStreak();
    const wordCount = history.filter((w) => !w.isSkipped).length;
    const newlyAchieved: Milestone[] = [];

    for (const m of milestones) {
      if (m.achieved) continue;
      const value = m.type === 'words' ? wordCount : streak.currentStreak;
      if (value >= m.threshold) {
        m.achieved = true;
        m.achievedDate = new Date().toISOString();
        newlyAchieved.push(m);
      }
    }

    await AsyncStorage.setItem(STORAGE_KEYS.MILESTONES, JSON.stringify(milestones));
    return newlyAchieved;
  } catch {
    return [];
  }
}
