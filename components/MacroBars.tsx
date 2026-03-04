'use client';

import type { MacroTotals } from '@/lib/dailyLogSummary';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';

export type MacroBarsProps = {
  totals: MacroTotals;
  /** Optional targets; if provided, bars show consumed/target and turn red when over. */
  targets?: {
    protein?: number;
    carbs?: number;
    fat?: number;
  };
};

const MACROS = [
  { key: 'protein' as const, label: 'Protein' },
  { key: 'carbs' as const, label: 'Carbohydrates' },
  { key: 'fat' as const, label: 'Fat' },
] as const;

export function MacroBars({ totals, targets }: MacroBarsProps) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {MACROS.map(({ key, label }) => {
        const consumed = totals[key];
        const target = targets?.[key];
        const hasTarget = target != null && target > 0;
        const value = hasTarget ? Math.min((consumed / target) * 100, 100) : 0;
        const over = hasTarget && consumed > target;
        return (
          <Box key={key}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 0.25,
              }}
            >
              <Typography variant="caption" color="text.secondary">
                {label}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {consumed}
                {hasTarget ? ` / ${target}g` : 'g'}
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={value}
              color={over ? 'error' : 'primary'}
              sx={{
                height: 6,
                borderRadius: 1,
                '& .MuiLinearProgress-bar': {
                  borderRadius: 1,
                },
              }}
            />
          </Box>
        );
      })}
    </Box>
  );
}
