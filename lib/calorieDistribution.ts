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

/**
 * Returns the current hour (0–23) in the given timezone or UTC.
 * Uses Intl (Node and browser); no client-only APIs.
 */
function getHourInTimezone(timezone?: string): number {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-CA', {
    hour: 'numeric',
    hour12: false,
    ...(timezone && { timeZone: timezone }),
  });
  const parts = formatter.formatToParts(now);
  const hourPart = parts.find((p) => p.type === 'hour');
  return hourPart ? parseInt(hourPart.value, 10) : 0;
}

/**
 * Default meal type by hour (24h): breakfast 5–10, lunch 11–14, dinner 17–20, snack otherwise.
 */
const HOUR_TO_MEAL: Array<{ end: number; meal: MealType }> = [
  { end: 4, meal: 'snack' },
  { end: 10, meal: 'breakfast' },
  { end: 14, meal: 'lunch' },
  { end: 20, meal: 'dinner' },
  { end: 23, meal: 'snack' },
];

/**
 * Returns the default meal type for the current time in user time.
 * Server-safe: uses only Date and Intl (no browser-only APIs).
 * @param timezone - Optional IANA timezone (e.g. 'America/New_York'). If omitted, uses UTC.
 */
export function getDefaultMealType(timezone?: string): MealType {
  const hour = getHourInTimezone(timezone);
  const entry = HOUR_TO_MEAL.find(({ end }) => hour <= end);
  return entry?.meal ?? 'snack';
}
