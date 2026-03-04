import type { MealType } from '@/lib/calorieDistribution';

const MEAL_TYPES: readonly MealType[] = [
  'breakfast',
  'lunch',
  'dinner',
  'snack',
];

/** Minimal entry shape required for grouping and macro sums (matches Prisma DailyLogEntry). */
export interface DailyLogEntryLike {
  id: string;
  mealType: MealType;
  foodName: string;
  caloriesSnapshot: number;
  proteinSnapshot: number;
  carbsSnapshot: number;
  fatSnapshot: number;
}

/** DailyLog with entries array (e.g. Prisma DailyLog + include: { entries: true }). */
export interface DailyLogWithEntries {
  id: string;
  userId: string;
  date: Date;
  entries: DailyLogEntryLike[];
}

/** Macro totals for a set of entries. */
export interface MacroTotals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

/** One meal group: entries and their summed macros. */
export interface MealGroup {
  entries: DailyLogEntryLike[];
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

/** Full summary: by meal type and overall totals. */
export interface DailyLogSummary {
  byMeal: Record<MealType, MealGroup>;
  totals: MacroTotals;
}

function emptyMealGroup(): MealGroup {
  return {
    entries: [],
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  };
}

function emptyMacroTotals(): MacroTotals {
  return { calories: 0, protein: 0, carbs: 0, fat: 0 };
}

/**
 * Groups daily log entries by mealType and computes calories, protein, carbs, and fat
 * for each group and overall. Uses snapshot values from each entry.
 */
export function summarizeDailyLog(log: DailyLogWithEntries): DailyLogSummary {
  const byMeal: Record<MealType, MealGroup> = {
    breakfast: emptyMealGroup(),
    lunch: emptyMealGroup(),
    dinner: emptyMealGroup(),
    snack: emptyMealGroup(),
  };

  const totals = emptyMacroTotals();

  for (const entry of log.entries) {
    const mealType = entry.mealType;
    if (!MEAL_TYPES.includes(mealType)) continue;

    const group = byMeal[mealType];
    group.entries.push(entry);
    group.calories += entry.caloriesSnapshot;
    group.protein += entry.proteinSnapshot;
    group.carbs += entry.carbsSnapshot;
    group.fat += entry.fatSnapshot;

    totals.calories += entry.caloriesSnapshot;
    totals.protein += entry.proteinSnapshot;
    totals.carbs += entry.carbsSnapshot;
    totals.fat += entry.fatSnapshot;
  }

  return { byMeal, totals };
}
