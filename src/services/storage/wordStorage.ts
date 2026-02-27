import AsyncStorage from '@react-native-async-storage/async-storage';
import { Word, Category } from '../../shared/types';
import { STORAGE_KEYS } from './keys';
import { updateWeeklyStats } from './statsStorage';
import { updateStreak } from './statsStorage';
import { addQuizCard } from './quizStorage';

export async function getWordHistory(): Promise<Word[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.WORD_HISTORY);
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
    await AsyncStorage.setItem(STORAGE_KEYS.WORD_HISTORY, JSON.stringify(history));

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

export async function toggleFavorite(wordId: string): Promise<boolean> {
  try {
    const history = await getWordHistory();
    const word = history.find((w) => w.id === wordId);
    if (!word) return false;
    word.isFavorite = !word.isFavorite;
    await AsyncStorage.setItem(STORAGE_KEYS.WORD_HISTORY, JSON.stringify(history));
    return word.isFavorite;
  } catch {
    return false;
  }
}

export async function getFavorites(): Promise<Word[]> {
  const history = await getWordHistory();
  return history.filter((w) => w.isFavorite);
}
