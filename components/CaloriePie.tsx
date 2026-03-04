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
 * Minimal circular progress: consumed vs target.
 * Green when under, neutral when close to target, red when over.
 * SVG-only, no chart library.
 */
export function CaloriePie({ consumed, target }: CaloriePieProps) {
  const theme = useTheme();
  const size = 88;
  const stroke = 6;
  const r = (size - stroke) / 2 - 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const safeTarget = target > 0 ? target : 1;
  const pct = Math.min(consumed / safeTarget, 1);
  const dashOffset = circumference * (1 - pct);
  const color = getColor(consumed, target, theme);

  return (
    <Box
      sx={{
        position: 'relative',
        width: size,
        height: size,
        flexShrink: 0,
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ transform: 'rotate(-90deg)' }}
        aria-hidden
      >
        {/* Track */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={theme.palette.divider}
          strokeWidth={stroke}
        />
        {/* Progress */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          style={{
            transition: 'stroke-dashoffset 0.3s ease, stroke 0.2s ease',
          }}
        />
      </svg>
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
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
