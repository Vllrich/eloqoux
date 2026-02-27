import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getUserPreferences,
  saveUserPreferences,
  isOnboarded,
  getWordHistory,
  clearAllData,
} from '../storage';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  multiRemove: jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

describe('storage - user preferences', () => {
  it('returns null when no preferences saved', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    const result = await getUserPreferences();
    expect(result).toBeNull();
  });

  it('returns parsed preferences when data exists', async () => {
    const prefs = { isOnboarded: true, categories: ['tech'] };
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(prefs));
    const result = await getUserPreferences();
    expect(result).toEqual(prefs);
  });

  it('saves preferences correctly', async () => {
    const prefs = { isOnboarded: true, categories: ['tech'] } as any;
    await saveUserPreferences(prefs);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      '@eloquox_preferences',
      JSON.stringify(prefs),
    );
  });
});

describe('storage - onboarding', () => {
  it('returns false when not onboarded', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    expect(await isOnboarded()).toBe(false);
  });

  it('returns true when onboarded', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify({ isOnboarded: true }),
    );
    expect(await isOnboarded()).toBe(true);
  });
});

describe('storage - word history', () => {
  it('returns empty array when no history', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    const result = await getWordHistory();
    expect(result).toEqual([]);
  });

  it('returns parsed history', async () => {
    const words = [{ id: '1', term: 'hello' }];
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(words));
    const result = await getWordHistory();
    expect(result).toEqual(words);
  });
});

describe('storage - clearAllData', () => {
  it('removes all keys', async () => {
    (AsyncStorage.multiRemove as jest.Mock).mockResolvedValue(undefined);
    await clearAllData();
    expect(AsyncStorage.multiRemove).toHaveBeenCalled();
  });
});
