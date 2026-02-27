export const colors = {
  light: {
    bg: '#fafaf6',
    surface: '#ffffff',
    text: '#121212',
    textMuted: '#444444',
    border: '#e6e6e0',
    accent: '#2f6fed',
    error: '#d63031',
    success: '#00b894',
    warning: '#fdcb6e',
    errorBg: '#d6303118',
    successBg: '#00b89418',
  },
  dark: {
    bg: '#121212',
    surface: '#161616',
    text: '#ededed',
    textMuted: '#b8b8b8',
    border: '#2a2a2a',
    accent: '#d9b827',
    error: '#ff6b6b',
    success: '#51cf66',
    warning: '#ffd43b',
    errorBg: '#ff6b6b18',
    successBg: '#51cf6618',
  },
};

export const getColors = (isDark: boolean) => (isDark ? colors.dark : colors.light);
