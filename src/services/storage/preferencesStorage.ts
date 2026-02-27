import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserPreferences } from '../../shared/types';
import { STORAGE_KEYS } from './keys';

export async function getUserPreferences(): Promise<UserPreferences | null> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.PREFERENCES);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error getting user preferences:', error);
    return null;
  }
}

export async function saveUserPreferences(preferences: UserPreferences): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(preferences));
  } catch (error) {
    console.error('Error saving user preferences:', error);
    throw error;
  }
}

export async function isOnboarded(): Promise<boolean> {
  const prefs = await getUserPreferences();
  return prefs?.isOnboarded === true;
}

export async function hasSeenSwipeExplainer(): Promise<boolean> {
  const val = await AsyncStorage.getItem(STORAGE_KEYS.SWIPE_EXPLAINER_SEEN);
  return val === 'true';
}

export async function setSwipeExplainerSeen(): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.SWIPE_EXPLAINER_SEEN, 'true');
}
