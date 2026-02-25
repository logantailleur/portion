"use client";

import NextLink from "next/link";
import { usePathname } from "next/navigation";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import AddIcon from "@mui/icons-material/Add";
import { bottomNavItems } from "./nav-config";

const PILL_HEIGHT = 72;
const PILL_BOTTOM_INSET = 12;
const PILL_HORIZONTAL_INSET = 16;
const PILL_BORDER_RADIUS = 28;
const CENTER_BUTTON_SIZE = 88; /* larger than pill (72) so it overlaps above and below */

export const MOBILE_NAV_TOTAL_HEIGHT =
  PILL_HEIGHT + PILL_BOTTOM_INSET + 8; /* extra for safe area */

function NavAction({
  href,
  label,
  icon,
  isActive,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
}) {
  return (
    <IconButton
      component={NextLink}
      href={href}
      aria-label={label}
      sx={{
        flex: 1,
        flexDirection: "column",
        color: isActive ? "primary.main" : "text.secondary",
        borderRadius: 0,
        "& .MuiSvgIcon-root": {
          fontSize: "1.5rem",
        },
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.25 }}>
        {icon}
        <Box
          component="span"
          sx={{
            fontSize: "0.7rem",
            fontWeight: 500,
            lineHeight: 1,
          }}
        >
          {label}
        </Box>
      </Box>
    </IconButton>
  );
}

export default function BottomNav() {
  const pathname = usePathname();

  const leftItems = bottomNavItems.slice(0, 2); // Today, Week
  const rightItems = bottomNavItems.slice(2, 4); // Foods, Me

  return (
    <Box
      component="nav"
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        px: `${PILL_HORIZONTAL_INSET}px`,
        pb: `${PILL_BOTTOM_INSET}px`,
        pt: 1,
        zIndex: 1400,
      }}
    >
      <Box
        sx={{
          position: "relative",
          width: "100%",
          maxWidth: 480,
          height: PILL_HEIGHT,
          borderRadius: PILL_BORDER_RADIUS,
          backgroundColor: "background.paper",
          boxShadow: (theme) =>
            theme.palette.mode === "dark"
              ? "0 4px 24px rgba(0,0,0,0.4)"
              : "0 4px 24px rgba(0,0,0,0.08)",
          overflow: "visible",
          display: "flex",
          alignItems: "stretch",
        }}
      >
        <Box sx={{ flex: 1, display: "flex" }}>
          {leftItems.map((item) => (
            <NavAction
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              isActive={
                pathname === item.href ||
                pathname.startsWith(`${item.href}/`)
              }
            />
          ))}
        </Box>

        <Box
          sx={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <IconButton
            aria-label="Quick log food"
            sx={{
              width: CENTER_BUTTON_SIZE,
              height: CENTER_BUTTON_SIZE,
              backgroundColor: "primary.main",
              color: "primary.contrastText",
              boxShadow: (theme) =>
                theme.palette.mode === "dark"
                  ? "0 4px 20px rgba(0,0,0,0.5)"
                  : "0 4px 20px rgba(13, 148, 136, 0.4)",
              "&:hover": {
                backgroundColor: "primary.dark",
              },
              "& .MuiSvgIcon-root": {
                fontSize: "2.25rem",
              },
            }}
          >
            <AddIcon />
          </IconButton>
        </Box>

        <Box sx={{ flex: 1, display: "flex" }}>
          {rightItems.map((item) => (
            <NavAction
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              isActive={
                pathname === item.href ||
                pathname.startsWith(`${item.href}/`)
              }
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
}
