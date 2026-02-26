"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { signOut } from "next-auth/react";

export default function MePage() {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Box>
        <Typography component="h1" variant="h4" sx={{ mb: 1 }}>
          Me
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Your profile, goals, and settings. Adjust targets and preferences here.
        </Typography>
      </Box>
      <Paper variant="elevation" elevation={0} sx={{ p: 3, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
        <Typography variant="body2" color="text.secondary">
          Profile and settings will appear here.
        </Typography>
      </Paper>
      <Paper variant="elevation" elevation={0} sx={{ p: 3, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
          <Typography variant="subtitle2" color="text.secondary">
            Sign out of your account
          </Typography>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            Log out
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
