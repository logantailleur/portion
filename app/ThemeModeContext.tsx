'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { PaletteMode } from '@mui/material/styles';

const STORAGE_KEY = 'portion-theme-mode';

export type ThemePreference = 'light' | 'dark' | 'system';

function getStoredPreference(): ThemePreference {
  if (typeof window === 'undefined') return 'system';
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark' || stored === 'system')
    return stored;
  return 'system';
}

function getSystemMode(): PaletteMode {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

type ThemeModeContextValue = {
  /** Resolved mode used by the theme (light or dark). */
  mode: PaletteMode;
  /** User preference: light, dark, or follow system. */
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
  setMode: (mode: PaletteMode) => void;
  toggleMode: () => void;
};

const ThemeModeContext = createContext<ThemeModeContextValue | null>(null);

export function ThemeModeProvider({ children }: { children: React.ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>('system');
  const [systemMode, setSystemMode] = useState<PaletteMode>('light');

  useEffect(() => {
    setPreferenceState(getStoredPreference());
    setSystemMode(getSystemMode());
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const handle = () => setSystemMode(getSystemMode());
    mql.addEventListener('change', handle);
    return () => mql.removeEventListener('change', handle);
  }, []);

  const mode: PaletteMode = preference === 'system' ? systemMode : preference;

  const setPreference = useCallback((next: ThemePreference) => {
    setPreferenceState(next);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, next);
    }
  }, []);

  const setMode = useCallback((next: PaletteMode) => {
    setPreferenceState(next);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, next);
    }
  }, []);

  const toggleMode = useCallback(() => {
    setPreferenceState((prev) => {
      const currentResolved = prev === 'system' ? systemMode : prev;
      const next: ThemePreference =
        currentResolved === 'light' ? 'dark' : 'light';
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, next);
      }
      return next;
    });
  }, [systemMode]);

  const value = useMemo(
    () => ({ mode, preference, setPreference, setMode, toggleMode }),
    [mode, preference, setPreference, setMode, toggleMode]
  );

  return (
    <ThemeModeContext.Provider value={value}>
      {children}
    </ThemeModeContext.Provider>
  );
}

export function useThemeMode(): ThemeModeContextValue {
  const ctx = useContext(ThemeModeContext);
  if (!ctx) {
    throw new Error('useThemeMode must be used within ThemeModeProvider');
  }
  return ctx;
}
