import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Theme, ThemeColors } from '../types';

const THEMES: Record<Theme, ThemeColors> = {
  sky: {
    '--color-primary-300': '#7dd3fc',
    '--color-primary-400': '#38bdf8',
    '--color-primary-500': '#0ea5e9',
    '--color-primary-600': '#0284c7',
    '--color-primary-700': '#0369a1',
    '--color-secondary-500': '#6366f1', // indigo-500
  },
  green: {
    '--color-primary-300': '#86efac',
    '--color-primary-400': '#4ade80',
    '--color-primary-500': '#22c55e',
    '--color-primary-600': '#16a34a',
    '--color-primary-700': '#15803d',
    '--color-secondary-500': '#14b8a6', // teal-500
  },
  yellow: {
    '--color-primary-300': '#fde047',
    '--color-primary-400': '#facc15',
    '--color-primary-500': '#eab308',
    '--color-primary-600': '#ca8a04',
    '--color-primary-700': '#a16207',
    '--color-secondary-500': '#f97316', // orange-500
  },
  red: {
    '--color-primary-300': '#fca5a5',
    '--color-primary-400': '#f87171',
    '--color-primary-500': '#ef4444',
    '--color-primary-600': '#dc2626',
    '--color-primary-700': '#b91c1c',
    '--color-secondary-500': '#f43f5e', // rose-500
  },
  purple: {
    '--color-primary-300': '#d8b4fe',
    '--color-primary-400': '#c084fc',
    '--color-primary-500': '#a855f7',
    '--color-primary-600': '#9333ea',
    '--color-primary-700': '#7e22ce',
    '--color-secondary-500': '#8b5cf6', // violet-500
  },
  orange: {
    '--color-primary-300': '#fdba74',
    '--color-primary-400': '#fb923c',
    '--color-primary-500': '#f97316',
    '--color-primary-600': '#ea580c',
    '--color-primary-700': '#c2410c',
    '--color-secondary-500': '#ef4444', // red-500
  },
};

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  themes: Record<Theme, ThemeColors>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const LOCAL_STORAGE_THEME = 'yt_assistant_theme';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    try {
      const storedTheme = localStorage.getItem(LOCAL_STORAGE_THEME);
      return (storedTheme as Theme) || 'orange';
    } catch (error) {
      console.error("Failed to read theme from localStorage:");
      // FIX: The 'unknown' type from the catch block cannot be directly passed to console.error, which expects a string.
      // We safely handle the error by checking its type before logging.
      if (error instanceof Error) {
        console.error(error.message);
      } else {
        console.error(String(error));
      }
      return 'orange';
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    const themeColors = THEMES[theme];
    
    for (const [property, value] of Object.entries(themeColors)) {
      root.style.setProperty(property, value);
    }
    
    localStorage.setItem(LOCAL_STORAGE_THEME, theme);
  }, [theme]);
  
  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
  }, []);

  const value = useMemo(() => ({ theme, setTheme, themes: THEMES }), [theme, setTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
