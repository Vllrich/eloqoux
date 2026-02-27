export const colors = {
  light: {
    bg: '#f4ede4',
    surface: '#fffdf7',
    text: '#2c2418',
    textMuted: '#7a6e5d',
    border: '#d9cdb8',
    accent: '#8b6914',
    error: '#a63d2f',
    success: '#4a7c59',
    warning: '#c49a2a',
    errorBg: '#a63d2f14',
    successBg: '#4a7c5914',
  },
  dark: {
    bg: '#1a1714',
    surface: '#242018',
    text: '#e8e0d0',
    textMuted: '#9a8e7e',
    border: '#3a3228',
    accent: '#c9a84c',
    error: '#d4806a',
    success: '#7db88a',
    warning: '#d4b85c',
    errorBg: '#d4806a18',
    successBg: '#7db88a18',
  },
};

export const getColors = (isDark: boolean) => (isDark ? colors.dark : colors.light);
