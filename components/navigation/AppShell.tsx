"use client";

import Box from "@mui/material/Box";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import {
  PortionBottomNav,
  PORTION_BOTTOM_NAV_HEIGHT,
} from "@/components/navigation/PortionBottomNav";
import Sidebar, { SIDEBAR_WIDTH } from "@/components/navigation/Sidebar";

const CONTENT_MAX_WIDTH = 480;
const CONTENT_PADDING_X = 2; /* theme spacing */
const CONTENT_PADDING_TOP = 3;

/**
 * Reusable AppShell: full-height layout with scrollable content,
 * fixed bottom nav (mobile) or sidebar (desktop), and centered 480px content.
 */
export default function AppShell({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

  return (
    <Box
      component="main"
      sx={{
        // Full height layout (dvh for mobile address bars)
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        width: "100%",
        maxWidth: isDesktop ? undefined : CONTENT_MAX_WIDTH,
        marginLeft: isDesktop ? SIDEBAR_WIDTH : 0,
        mx: isDesktop ? undefined : "auto",
        // Background matches theme
        backgroundColor: "background.default",
      }}
    >
      {isDesktop && <Sidebar />}

      {/* Scrollable content area — children render here, above bottom navigation */}
      <Box
        component="div"
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "auto",
          width: "100%",
          maxWidth: CONTENT_MAX_WIDTH,
          mx: "auto",
          // Consistent vertical spacing (theme spacing)
          px: CONTENT_PADDING_X,
          pt: CONTENT_PADDING_TOP,
          pb: isDesktop ? CONTENT_PADDING_TOP : PORTION_BOTTOM_NAV_HEIGHT,
          paddingLeft: `max(${theme.spacing(CONTENT_PADDING_X)}, env(safe-area-inset-left))`,
          paddingRight: `max(${theme.spacing(CONTENT_PADDING_X)}, env(safe-area-inset-right))`,
          // Smooth route transitions (content area)
          transition: "opacity 0.15s ease-out",
        }}
      >
        {children}
      </Box>

      {/* Bottom navigation fixed at bottom (mobile only) */}
      {!isDesktop && <PortionBottomNav />}
    </Box>
  );
}
