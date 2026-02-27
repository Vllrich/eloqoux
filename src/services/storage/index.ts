import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from './keys';

export { getUserPreferences, saveUserPreferences, isOnboarded, hasSeenSwipeExplainer, setSwipeExplainerSeen } from './preferencesStorage';
export { getWordHistory, saveWordToHistory, searchWordHistory, getWordsByCategory, toggleFavorite, getFavorites } from './wordStorage';
export { getWeeklyStats, getCurrentWeekStats, updateWeeklyStats, getStreak, updateStreak, getMilestones, checkMilestones } from './statsStorage';
export { getQuizCards, getDueQuizCards, updateQuizCard, addQuizCard } from './quizStorage';

export async function clearAllData(): Promise<void> {
  try {
    await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
  } catch (error) {
    console.error('Error clearing all data:', error);
    throw error;
  }
}
