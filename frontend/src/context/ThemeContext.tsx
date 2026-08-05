import React, { createContext, useCallback, useContext, useMemo } from 'react';

import { Colors, Themes, ThemeName } from '../constants/colors';

interface ThemeContextValue {
  theme: ThemeName;
  colors: typeof Colors;
  toggleTheme: () => void;
  setTheme: (theme: ThemeName) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

// Dark mode only now - light mode (and the toggle for it) has been removed
// from the app. theme/toggleTheme/setTheme are kept on the context shape
// (rather than ripping useTheme() out of the ~50 screens/components that
// call it) so every existing `colors.x` lookup keeps working unchanged;
// toggleTheme/setTheme are just no-ops since there's nothing to switch to.
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme: ThemeName = 'dark';
  const setTheme = useCallback((_next: ThemeName) => {}, []);
  const toggleTheme = useCallback(() => {}, []);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, colors: Themes[theme], toggleTheme, setTheme }),
    [toggleTheme, setTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return ctx;
}
