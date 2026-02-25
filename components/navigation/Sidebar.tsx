"use client";

import NextLink from "next/link";
import { usePathname } from "next/navigation";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import { navItems } from "./nav-config";

const SIDEBAR_WIDTH = 240;

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <Box
      component="nav"
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        bottom: 0,
        width: SIDEBAR_WIDTH,
        flexShrink: 0,
        backgroundColor: "background.paper",
        boxShadow: (theme) =>
          theme.palette.mode === "dark"
            ? "1px 0 8px rgba(0,0,0,0.24)"
            : "1px 0 8px rgba(33,33,33,0.06)",
        zIndex: 1200,
      }}
    >
      <List sx={{ pt: 2 }}>
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <ListItem key={item.href} disablePadding sx={{ px: 1, mb: 0.5 }}>
              <ListItemButton
                component={NextLink}
                href={item.href}
                selected={isActive}
                sx={{
                  borderRadius: 2,
                  "&.Mui-selected": {
                    backgroundColor: "action.selected",
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 40,
                    color: isActive ? "primary.main" : "text.secondary",
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? "primary.main" : "text.primary",
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );
}

export { SIDEBAR_WIDTH };
