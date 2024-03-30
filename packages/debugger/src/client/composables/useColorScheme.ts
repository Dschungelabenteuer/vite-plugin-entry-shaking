import { ref } from 'vue';

export type ColorScheme = 'light' | 'dark';

/** Composable used to manage the color scheme of the app. */
export function useColorScheme() {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const defaultScheme = prefersDark ? 'dark' : 'light';
  const resolvedScheme = (localStorage.getItem('colorScheme') as ColorScheme) || defaultScheme;
  const colorScheme = ref<ColorScheme>(resolvedScheme);

  const swapColorScheme = () => {
    colorScheme.value = colorScheme.value === 'light' ? 'dark' : 'light';
    localStorage.setItem('colorScheme', colorScheme.value);
  };

  return {
    /** Active color scheme. */
    colorScheme,
    /** Swap between both light/dark themes. */
    swapColorScheme,
  };
}
