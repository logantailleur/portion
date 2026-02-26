'use client';

import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import { useThemeMode } from '@/app/ThemeModeContext';
import { colors } from '@/theme';

const PALETTE_SWATCHES = [
  { name: 'Primary', hex: colors.primary, themeKey: 'primary.main' as const },
  {
    name: 'Secondary',
    hex: colors.secondary,
    themeKey: 'secondary.main' as const,
  },
  {
    name: 'Light neutral',
    hex: colors.lightNeutral,
    themeKey: 'background.default' as const,
    showBorder: true,
  },
  {
    name: 'Dark neutral',
    hex: colors.darkNeutral,
    themeKey: 'text.primary' as const,
  },
  {
    name: 'Accent / feedback',
    hex: colors.accentFeedback,
    themeKey: 'error.main' as const,
  },
  {
    name: 'Success accent',
    hex: colors.successAccent,
    themeKey: 'success.main' as const,
  },
];

export default function ThemeDemoPage() {
  const { mode, toggleMode } = useThemeMode();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        pb: 6,
      }}
    >
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <Typography variant="h6" component="span" sx={{ flexGrow: 1 }}>
            Theme demo
          </Typography>
          <Button color="inherit" onClick={toggleMode}>
            {mode === 'light' ? 'Dark' : 'Light'} mode
          </Button>
        </Toolbar>
      </AppBar>

      <Box sx={{ maxWidth: 960, mx: 'auto', py: 4, px: 2 }}>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Palette and core components. Toggle mode with the app bar button.
        </Typography>

        <Stack spacing={3}>
          {/* Palette */}
          <Card>
            <CardHeader title="Palette" subheader="Design tokens" />
            <CardContent>
              <Stack spacing={2}>
                {PALETTE_SWATCHES.map((swatch) => (
                  <Stack
                    key={swatch.name}
                    direction={{ xs: 'column', sm: 'row' }}
                    alignItems={{ sm: 'center' }}
                    gap={2}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: 'background.paper',
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Box
                      sx={{
                        width: { xs: '100%', sm: 120 },
                        height: 56,
                        borderRadius: 2,
                        backgroundColor: swatch.hex,
                        ...(swatch.showBorder
                          ? {
                              border: '1px solid',
                              borderColor: 'divider' as const,
                            }
                          : {}),
                        flexShrink: 0,
                      }}
                    />
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="subtitle2">{swatch.name}</Typography>
                      <Typography
                        variant="caption"
                        fontFamily="monospace"
                        color="text.secondary"
                      >
                        {swatch.hex}
                      </Typography>
                    </Box>
                  </Stack>
                ))}
              </Stack>
            </CardContent>
          </Card>

          {/* Buttons */}
          <Card>
            <CardHeader title="Buttons" />
            <CardContent>
              <Stack direction="row" flexWrap="wrap" gap={2}>
                <Button variant="contained">Contained</Button>
                <Button variant="contained" color="secondary">
                  Secondary
                </Button>
                <Button variant="outlined">Outlined</Button>
                <Button variant="text">Text</Button>
              </Stack>
            </CardContent>
          </Card>

          {/* Form */}
          <Card>
            <CardHeader title="Form" />
            <CardContent>
              <TextField
                label="Text field"
                placeholder="Placeholder"
                fullWidth
                sx={{ maxWidth: 400 }}
              />
            </CardContent>
          </Card>

          {/* Alerts */}
          <Card>
            <CardHeader title="Alerts" />
            <CardContent>
              <Stack spacing={1.5}>
                <Alert severity="success">Success</Alert>
                <Alert severity="warning">Warning</Alert>
                <Alert severity="error">Error</Alert>
              </Stack>
            </CardContent>
          </Card>

          {/* Paper */}
          <Card>
            <CardHeader title="Paper" />
            <CardContent>
              <Stack direction="row" flexWrap="wrap" gap={2}>
                <Paper sx={{ p: 2, minWidth: 120, textAlign: 'center' }}>
                  Default
                </Paper>
                <Paper
                  variant="outlined"
                  sx={{ p: 2, minWidth: 120, textAlign: 'center' }}
                >
                  Outlined
                </Paper>
                <Paper
                  elevation={3}
                  sx={{ p: 2, minWidth: 120, textAlign: 'center' }}
                >
                  Elevation 3
                </Paper>
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Box>
    </Box>
  );
}
