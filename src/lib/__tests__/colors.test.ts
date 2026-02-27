import { colors, getColors } from '../colors';

describe('colors', () => {
  it('returns light colors when isDark is false', () => {
    const result = getColors(false);
    expect(result).toBe(colors.light);
    expect(result.bg).toBe('#fafaf6');
  });

  it('returns dark colors when isDark is true', () => {
    const result = getColors(true);
    expect(result).toBe(colors.dark);
    expect(result.bg).toBe('#121212');
  });

  it('has all required color keys', () => {
    const requiredKeys = ['bg', 'surface', 'text', 'textMuted', 'border', 'accent'];
    for (const key of requiredKeys) {
      expect(colors.light).toHaveProperty(key);
      expect(colors.dark).toHaveProperty(key);
    }
  });
});
