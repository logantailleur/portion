"use client";

import Box from "@mui/material/Box";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import BottomNav, {
  MOBILE_NAV_TOTAL_HEIGHT,
} from "@/components/navigation/BottomNav";
import Sidebar, { SIDEBAR_WIDTH } from "@/components/navigation/Sidebar";
const CONTENT_MAX_WIDTH = 480;

export default function AppShell({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

  return (
    <Box
      component="main"
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100dvh",
        width: "100%",
        maxWidth: isDesktop ? undefined : CONTENT_MAX_WIDTH,
        marginLeft: isDesktop ? SIDEBAR_WIDTH : 0,
        mx: isDesktop ? undefined : "auto",
        backgroundColor: "background.default",
      }}
    >
      {isDesktop && <Sidebar />}
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
          pb: isDesktop ? 0 : `${MOBILE_NAV_TOTAL_HEIGHT}px`,
        }}
      >
        {children}
      </Box>
      {!isDesktop && <BottomNav />}
    </Box>
  );
}
