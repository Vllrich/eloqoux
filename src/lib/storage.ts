import AsyncStorage from '@react-native-async-storage/async-storage';
import { Word, UserPreferences, WeeklyStats, Category } from '../types';

const KEYS = {
  PREFERENCES: '@eloquox_preferences',
  WORD_HISTORY: '@eloquox_word_history',
  WEEKLY_STATS: '@eloquox_weekly_stats',
};

// User Preferences
export async function getUserPreferences(): Promise<UserPreferences | null> {
  try {
    const data = await AsyncStorage.getItem(KEYS.PREFERENCES);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error getting user preferences:', error);
    return null;
  }
}

export async function saveUserPreferences(preferences: UserPreferences): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.PREFERENCES, JSON.stringify(preferences));
  } catch (error) {
    console.error('Error saving user preferences:', error);
    throw error;
  }
}

export async function isOnboarded(): Promise<boolean> {
  const prefs = await getUserPreferences();
  return prefs?.isOnboarded === true;
}

// Word History
export async function getWordHistory(): Promise<Word[]> {
  try {
    const data = await AsyncStorage.getItem(KEYS.WORD_HISTORY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting word history:', error);
    return [];
  }
}

export async function saveWordToHistory(word: Word): Promise<void> {
  try {
    const history = await getWordHistory();
    history.unshift(word); // Add to beginning
    await AsyncStorage.setItem(KEYS.WORD_HISTORY, JSON.stringify(history));
    
    // Update weekly stats
    await updateWeeklyStats(word);
  } catch (error) {
    console.error('Error saving word to history:', error);
    throw error;
  }
}

export async function searchWordHistory(query: string): Promise<Word[]> {
  try {
    const history = await getWordHistory();
    const lowerQuery = query.toLowerCase();
    
    return history.filter(
      (word) =>
        word.term.toLowerCase().includes(lowerQuery) ||
        word.definition.toLowerCase().includes(lowerQuery) ||
        word.examples.some((ex) => ex.sentence.toLowerCase().includes(lowerQuery))
    );
  } catch (error) {
    console.error('Error searching word history:', error);
    return [];
  }
}

export async function getWordsByCategory(category: Category): Promise<Word[]> {
  try {
    const history = await getWordHistory();
    return history.filter((word) => word.category === category);
  } catch (error) {
    console.error('Error getting words by category:', error);
    return [];
  }
}

// Weekly Stats
function getWeekStart(date: Date = new Date()): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
  const monday = new Date(d.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday.toISOString();
}

async function updateWeeklyStats(word: Word): Promise<void> {
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
    
    await AsyncStorage.setItem(KEYS.WEEKLY_STATS, JSON.stringify(allStats));
  } catch (error) {
    console.error('Error updating weekly stats:', error);
  }
}

export async function getWeeklyStats(): Promise<WeeklyStats[]> {
  try {
    const data = await AsyncStorage.getItem(KEYS.WEEKLY_STATS);
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

// Utility
export async function clearAllData(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([
      KEYS.PREFERENCES,
      KEYS.WORD_HISTORY,
      KEYS.WEEKLY_STATS,
    ]);
  } catch (error) {
    console.error('Error clearing all data:', error);
    throw error;
  }
}

