'use client';

import type { ThemePreference } from '@/app/ThemeModeContext';
import { useThemeMode } from '@/app/ThemeModeContext';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import { signOut } from 'next-auth/react';

export default function MeUserSettings() {
  const { preference, setPreference } = useThemeMode();

  const handleThemeChange = (
    _event: React.MouseEvent<HTMLElement>,
    value: ThemePreference | null
  ) => {
    if (value !== null) setPreference(value);
  };

  return (
    <Paper
      variant="outlined"
      sx={{
        borderRadius: 2,
        overflow: 'hidden',
        borderColor: 'divider',
        boxShadow: 1,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2.5,
          py: 2,
        }}
      >
        <Typography variant="h5" color="text.primary" fontWeight={500}>
          User settings
        </Typography>
      </Box>
      <Divider />
      <Box sx={{ px: 2.5, py: 2 }}>
        <Stack spacing={2}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2,
            }}
          >
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Theme
            </Typography>
            <ToggleButtonGroup
              value={preference}
              exclusive
              onChange={handleThemeChange}
              aria-label="Theme"
              size="small"
              sx={{ flexWrap: 'wrap' }}
            >
              <ToggleButton value="light" aria-label="Light">
                Light
              </ToggleButton>
              <ToggleButton value="dark" aria-label="Dark">
                Dark
              </ToggleButton>
              <ToggleButton value="system" aria-label="System">
                System
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 2,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Sign out of your account
            </Typography>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => signOut({ callbackUrl: '/login' })}
            >
              Log out
            </Button>
          </Box>
        </Stack>
      </Box>
    </Paper>
  );
}
