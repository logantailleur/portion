'use client';

import Box from '@mui/material/Box';
import type { Theme } from '@mui/material/styles';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

export type CaloriePieProps = {
  consumed: number;
  target: number;
};

/** Within this fraction of target, show neutral (e.g. 0.95–1.05 = "close"). */
const CLOSE_THRESHOLD = 0.05;

function getColor(consumed: number, target: number, theme: Theme): string {
  if (target <= 0) return theme.palette.text.secondary;
  const ratio = consumed / target;
  if (ratio > 1 + CLOSE_THRESHOLD) return theme.palette.error.main;
  if (ratio >= 1 - CLOSE_THRESHOLD && ratio <= 1 + CLOSE_THRESHOLD)
    return theme.palette.text.secondary;
  return theme.palette.success.main;
}

/**
 * Circular progress (donut) via CSS conic-gradient.
 * Green under target, neutral when close, red when over.
 * Centered text: consumed / target. Mobile-optimized, clean style.
 */
export function CaloriePie({ consumed, target }: CaloriePieProps) {
  const theme = useTheme();
  const safeTarget = target > 0 ? target : 1;
  const pct = Math.min(consumed / safeTarget, 1);
  const color = getColor(consumed, target, theme);
  const trackColor = theme.palette.divider;
  const size = 88;
  const stroke = 6;

  return (
    <Box
      sx={{
        position: 'relative',
        width: size,
        height: size,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          background: `conic-gradient(from -90deg, ${color} 0deg, ${color} ${pct * 360}deg, ${trackColor} ${pct * 360}deg)`,
          transition: 'background 0.3s ease',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          inset: stroke,
          borderRadius: '50%',
          bgcolor: 'background.paper',
        }}
      />
      <Box
        sx={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1,
        }}
      >
        <Typography
          variant="body2"
          fontWeight={600}
          color="text.primary"
          component="span"
        >
          {consumed}
        </Typography>
        <Typography variant="caption" color="text.secondary" component="span">
          / {target}
        </Typography>
      </Box>
    </Box>
  );
}
