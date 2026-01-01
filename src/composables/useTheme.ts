import { ref, watch } from 'vue';

export type Theme = 'light' | 'dark' | 'auto';

const THEME_KEY = 'app-theme';

export function useTheme() {
  const currentTheme = ref<Theme>((localStorage.getItem(THEME_KEY) as Theme) || 'auto');

  const applyTheme = (theme: Theme) => {
    const isDark = theme === 'dark' ||
      (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const setTheme = (theme: Theme) => {
    currentTheme.value = theme;
    localStorage.setItem(THEME_KEY, theme);
    applyTheme(theme);
  };

  watch(currentTheme, (newTheme) => {
    applyTheme(newTheme);
  }, { immediate: true });

  return {
    currentTheme,
    setTheme,
  };
}
