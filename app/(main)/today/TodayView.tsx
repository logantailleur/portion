'use client';

import { CaloriePie } from '@/components/CaloriePie';
import { MacroBars } from '@/components/MacroBars';
import { MealSection, type MealSectionEntry } from '@/components/MealSection';
import type { CalorieDistribution } from '@/lib/calorieDistribution';
import type { DailyLogSummary } from '@/lib/dailyLogSummary';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';

export type TodayViewProps = {
  summary: DailyLogSummary;
  dailyCalorieTarget: number;
  mealTargets: CalorieDistribution;
  onLogClick?: () => void;
};

function toMealSectionEntries(
  entries: DailyLogSummary['byMeal']['breakfast']['entries']
): MealSectionEntry[] {
  return entries.map((e) => ({
    id: e.id,
    foodName: e.foodName,
    calories: e.caloriesSnapshot,
    protein: e.proteinSnapshot,
    carbs: e.carbsSnapshot,
    fat: e.fatSnapshot,
  }));
}

const MEAL_ORDER = ['breakfast', 'lunch', 'dinner', 'snack'] as const;

export default function TodayView({
  summary,
  dailyCalorieTarget,
  mealTargets,
  onLogClick,
}: TodayViewProps) {
  return (
    <Stack spacing={3}>
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <CaloriePie
          consumed={summary.totals.calories}
          target={dailyCalorieTarget}
        />
      </Box>

      <MacroBars totals={summary.totals} />

      {MEAL_ORDER.map((mealType) => (
        <MealSection
          key={mealType}
          mealType={mealType}
          entries={toMealSectionEntries(summary.byMeal[mealType].entries)}
          mealCalorieTarget={mealTargets[mealType]}
          {...(onLogClick ? { onLogClick } : {})}
        />
      ))}
    </Stack>
  );
}
