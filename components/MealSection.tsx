'use client';

import { LogEntryItem } from '@/components/LogEntryItem';
import { QuickAddButton } from '@/components/QuickAddButton';
import type { MealType } from '@/lib/calorieDistribution';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

export type MealSectionEntry = {
  id: string;
  foodName: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

export type MealSectionProps = {
  mealType: MealType;
  entries: MealSectionEntry[];
  mealCalorieTarget: number;
  logHref: string;
};

const MEAL_TITLES: Record<MealType, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snack',
};

export function MealSection({
  mealType,
  entries,
  mealCalorieTarget,
  logHref,
}: MealSectionProps) {
  const consumed = entries.reduce((sum, e) => sum + e.calories, 0);
  const title = MEAL_TITLES[mealType];

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 2.5,
        boxShadow: (t) =>
          t.palette.mode === 'light'
            ? '0 1px 3px rgba(0,0,0,0.06)'
            : '0 1px 3px rgba(0,0,0,0.2)',
        overflow: 'hidden',
      }}
    >
      <Stack spacing={0}>
        {/* Header: title + calories */}
        <Box sx={{ px: 2, pt: 2, pb: 1 }}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            flexWrap="wrap"
            gap={1}
          >
            <Typography variant="subtitle1" fontWeight={600}>
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {consumed} / {mealCalorieTarget} kcal
            </Typography>
          </Stack>
        </Box>

        {/* Entry list */}
        {entries.length > 0 ? (
          <List disablePadding sx={{ pt: 0, pb: 1 }}>
            {entries.map((entry) => (
              <LogEntryItem
                key={entry.id}
                id={entry.id}
                foodName={entry.foodName}
                calories={entry.calories}
                protein={entry.protein}
                carbs={entry.carbs}
                fat={entry.fat}
                currentMealType={mealType}
              />
            ))}
          </List>
        ) : (
          <Box sx={{ px: 2, pb: 2 }}>
            <Typography variant="caption" color="text.secondary">
              No entries yet
            </Typography>
          </Box>
        )}

        {/* Log button */}
        <Box sx={{ px: 2, pb: 1.5, textAlign: 'right' }}>
          <QuickAddButton href={logHref} />
        </Box>
      </Stack>
    </Paper>
  );
}
