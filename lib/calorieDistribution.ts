/**
 * Calorie distribution by meal type.
 * Returns daily calorie target split: breakfast 25%, lunch 30%, dinner 30%, snack 15%.
 * Values are rounded; sum may differ from target by ±1–2 due to rounding.
 */

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export type CalorieDistribution = Record<MealType, number>;

const MEAL_PERCENTAGES: Record<MealType, number> = {
  breakfast: 0.25,
  lunch: 0.3,
  dinner: 0.3,
  snack: 0.15,
} as const;

/**
 * Splits a daily calorie target by meal type (breakfast 25%, lunch 30%, dinner 30%, snack 15%).
 * @param dailyCalorieTarget - Total daily calories to distribute
 * @returns Object keyed by MealType with rounded calorie values
 */
export function getCalorieDistribution(
  dailyCalorieTarget: number
): CalorieDistribution {
  const entries = (
    Object.entries(MEAL_PERCENTAGES) as [MealType, number][]
  ).map(([meal, pct]) => [meal, Math.round(dailyCalorieTarget * pct)] as const);
  return Object.fromEntries(entries) as CalorieDistribution;
}
