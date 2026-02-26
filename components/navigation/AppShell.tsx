'use client';

import Box from '@mui/material/Box';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import {
  PortionBottomNav,
  PORTION_BOTTOM_NAV_HEIGHT,
} from '@/components/navigation/PortionBottomNav';
import Sidebar, { SIDEBAR_WIDTH } from '@/components/navigation/Sidebar';
import { usePathname } from 'next/navigation';

const CONTENT_MAX_WIDTH = 480;
const CONTENT_PADDING_X = 2; /* theme spacing */
const CONTENT_PADDING_TOP = 3;

/**
 * Reusable AppShell: full-height layout with scrollable content,
 * fixed bottom nav (mobile) or sidebar (desktop), and centered 480px content.
 * Nav is hidden on /onboarding for a focused wizard experience.
 */
export default function AppShell({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const pathname = usePathname();
  const hideNav = pathname === '/onboarding';

  return (
    <Box
      component="main"
      sx={{
        height: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        maxWidth: isDesktop ? undefined : CONTENT_MAX_WIDTH,
        marginLeft: isDesktop && !hideNav ? SIDEBAR_WIDTH : 0,
        mx: isDesktop ? undefined : 'auto',
        backgroundColor: 'background.default',
      }}
    >
      {isDesktop && !hideNav && <Sidebar />}

      {/* Scroll area: full viewport height so content flows underneath the nav (nav has higher z-index). Bottom spacer = nav height so the last content can scroll up to sit just above the navbar. */}
      <Box
        component="div"
        sx={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'auto',
          width: '100%',
          maxWidth: CONTENT_MAX_WIDTH,
          mx: 'auto',
          px: CONTENT_PADDING_X,
          pt: CONTENT_PADDING_TOP,
          pb: CONTENT_PADDING_TOP,
          paddingLeft: `max(${theme.spacing(CONTENT_PADDING_X)}, env(safe-area-inset-left))`,
          paddingRight: `max(${theme.spacing(CONTENT_PADDING_X)}, env(safe-area-inset-right))`,
          transition: 'opacity 0.15s ease-out',
        }}
      >
        <Box
          component="div"
          sx={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            flex: '0 0 auto',
          }}
        >
          {children}
          {/* Spacer so the last content can scroll above the fixed nav; inside this block so scroll height = content + spacer. */}
          {!isDesktop && !hideNav && (
            <Box
              component="div"
              aria-hidden
              sx={{
                flexShrink: 0,
                width: '100%',
                height: '140px',
                minHeight: 'calc(100px + env(safe-area-inset-bottom, 0px))',
              }}
            />
          )}
        </Box>
      </Box>

      {/* Fixed bottom nav: sits on top of content (z) so content flows beneath it */}
      {!isDesktop && !hideNav && <PortionBottomNav />}
    </Box>
  );
}
