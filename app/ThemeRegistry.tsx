"use client";

import { useMemo } from "react";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { createAppTheme } from "@/theme";
import { ThemeModeProvider, useThemeMode } from "./ThemeModeContext";

function ThemeRegistryInner({ children }: { children: React.ReactNode }) {
  const { mode } = useThemeMode();
  const theme = useMemo(() => createAppTheme(mode), [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}

export default function ThemeRegistry({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeModeProvider>
      <ThemeRegistryInner>{children}</ThemeRegistryInner>
    </ThemeModeProvider>
  );
}
