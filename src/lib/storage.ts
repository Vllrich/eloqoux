import AsyncStorage from '@react-native-async-storage/async-storage';
import { Word, UserPreferences, WeeklyStats, Category, StreakData, QuizCard, Milestone } from '../types';

const KEYS = {
  PREFERENCES: '@eloquox_preferences',
  WORD_HISTORY: '@eloquox_word_history',
  WEEKLY_STATS: '@eloquox_weekly_stats',
  STREAK: '@eloquox_streak',
  QUIZ_CARDS: '@eloquox_quiz_cards',
  MILESTONES: '@eloquox_milestones',
  SWIPE_EXPLAINER_SEEN: '@eloquox_swipe_seen',
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
    history.unshift(word);
    await AsyncStorage.setItem(KEYS.WORD_HISTORY, JSON.stringify(history));
    
    if (!word.isSkipped) {
      await updateWeeklyStats(word);
      await updateStreak();
      await addQuizCard(word);
    }
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

// Streak
function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

export async function getStreak(): Promise<StreakData> {
  try {
    const data = await AsyncStorage.getItem(KEYS.STREAK);
    return data ? JSON.parse(data) : { currentStreak: 0, longestStreak: 0, lastActiveDate: '' };
  } catch {
    return { currentStreak: 0, longestStreak: 0, lastActiveDate: '' };
  }
}

async function updateStreak(): Promise<void> {
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
    await AsyncStorage.setItem(KEYS.STREAK, JSON.stringify(streak));
  } catch (error) {
    console.error('Error updating streak:', error);
  }
}

// Favorites
export async function toggleFavorite(wordId: string): Promise<boolean> {
  try {
    const history = await getWordHistory();
    const word = history.find((w) => w.id === wordId);
    if (!word) return false;
    word.isFavorite = !word.isFavorite;
    await AsyncStorage.setItem(KEYS.WORD_HISTORY, JSON.stringify(history));
    return word.isFavorite;
  } catch {
    return false;
  }
}

export async function getFavorites(): Promise<Word[]> {
  const history = await getWordHistory();
  return history.filter((w) => w.isFavorite);
}

// Quiz Cards (simplified spaced repetition)
async function addQuizCard(word: Word): Promise<void> {
  try {
    const cards = await getQuizCards();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    cards.push({
      wordId: word.id,
      term: word.term,
      definition: word.definition,
      examples: word.examples.slice(0, 1),
      category: word.category,
      nextReviewDate: tomorrow.toISOString().split('T')[0],
      interval: 1,
    });
    await AsyncStorage.setItem(KEYS.QUIZ_CARDS, JSON.stringify(cards));
  } catch (error) {
    console.error('Error adding quiz card:', error);
  }
}

export async function getQuizCards(): Promise<QuizCard[]> {
  try {
    const data = await AsyncStorage.getItem(KEYS.QUIZ_CARDS);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export async function getDueQuizCards(): Promise<QuizCard[]> {
  const cards = await getQuizCards();
  const today = getTodayDate();
  return cards.filter((c) => c.nextReviewDate <= today);
}

export async function updateQuizCard(wordId: string, correct: boolean): Promise<void> {
  try {
    const cards = await getQuizCards();
    const card = cards.find((c) => c.wordId === wordId);
    if (!card) return;

    if (correct) {
      card.interval = Math.min(card.interval * 2, 64);
    } else {
      card.interval = 1;
    }
    const next = new Date();
    next.setDate(next.getDate() + card.interval);
    card.nextReviewDate = next.toISOString().split('T')[0];
    await AsyncStorage.setItem(KEYS.QUIZ_CARDS, JSON.stringify(cards));
  } catch (error) {
    console.error('Error updating quiz card:', error);
  }
}

// Milestones
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
    const data = await AsyncStorage.getItem(KEYS.MILESTONES);
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
    const history = await getWordHistory();
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

    await AsyncStorage.setItem(KEYS.MILESTONES, JSON.stringify(milestones));
    return newlyAchieved;
  } catch {
    return [];
  }
}

// Swipe Explainer
export async function hasSeenSwipeExplainer(): Promise<boolean> {
  const val = await AsyncStorage.getItem(KEYS.SWIPE_EXPLAINER_SEEN);
  return val === 'true';
}

export async function setSwipeExplainerSeen(): Promise<void> {
  await AsyncStorage.setItem(KEYS.SWIPE_EXPLAINER_SEEN, 'true');
}

// Utility
export async function clearAllData(): Promise<void> {
  try {
    await AsyncStorage.multiRemove(Object.values(KEYS));
  } catch (error) {
    console.error('Error clearing all data:', error);
    throw error;
  }
}

