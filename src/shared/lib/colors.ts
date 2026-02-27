export const colors = {
  light: {
    bg: '#fafaf6',
    surface: '#ffffff',
    text: '#121212',
    textMuted: '#444444',
    border: '#e6e6e0',
    accent: '#2f6fed',
  },
  dark: {
    bg: '#121212',
    surface: '#161616',
    text: '#ededed',
    textMuted: '#b8b8b8',
    border: '#2a2a2a',
    accent: '#d9b827',
  },
};

export const getColors = (isDark: boolean) => (isDark ? colors.dark : colors.light);
