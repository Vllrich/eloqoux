import AsyncStorage from '@react-native-async-storage/async-storage';
import { Word, QuizCard } from '../../shared/types';
import { STORAGE_KEYS } from './keys';

function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

export async function addQuizCard(word: Word): Promise<void> {
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
    await AsyncStorage.setItem(STORAGE_KEYS.QUIZ_CARDS, JSON.stringify(cards));
  } catch (error) {
    console.error('Error adding quiz card:', error);
  }
}

export async function getQuizCards(): Promise<QuizCard[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.QUIZ_CARDS);
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
    await AsyncStorage.setItem(STORAGE_KEYS.QUIZ_CARDS, JSON.stringify(cards));
  } catch (error) {
    console.error('Error updating quiz card:', error);
  }
}
