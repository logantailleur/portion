"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { PaletteMode } from "@mui/material/styles";

const STORAGE_KEY = "portion-theme-mode";

function getStoredMode(): PaletteMode {
  if (typeof window === "undefined") return "light";
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "light" || stored === "dark") return stored;
  return "light";
}

type ThemeModeContextValue = {
  mode: PaletteMode;
  setMode: (mode: PaletteMode) => void;
  toggleMode: () => void;
};

const ThemeModeContext = createContext<ThemeModeContextValue | null>(null);

export function ThemeModeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mode, setModeState] = useState<PaletteMode>("light");

  useEffect(() => {
    setModeState(getStoredMode());
  }, []);

  const setMode = useCallback((next: PaletteMode) => {
    setModeState(next);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, next);
    }
  }, []);

  const toggleMode = useCallback(() => {
    setModeState((prev) => {
      const next = prev === "light" ? "dark" : "light";
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, next);
      }
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ mode, setMode, toggleMode }),
    [mode, setMode, toggleMode]
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
    throw new Error("useThemeMode must be used within ThemeModeProvider");
  }
  return ctx;
}
