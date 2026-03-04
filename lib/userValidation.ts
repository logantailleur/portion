import type { ActivityLevel, Sex } from '@/lib/calorieEngine';

export const SEX_VALUES: Sex[] = ['male', 'female', 'other'];

export const ACTIVITY_LEVELS: ActivityLevel[] = [
  'sedentary',
  'light',
  'moderate',
  'active',
  'very_active',
];

export function isValidFloat(value: unknown): value is number {
  return typeof value === 'number' && !Number.isNaN(value) && value >= 0;
}

export function isValidAge(
  value: unknown,
  options: { min?: number; max?: number; requireInteger?: boolean } = {}
): value is number {
  const { min = 0, max = Number.POSITIVE_INFINITY, requireInteger = true } =
    options;
  if (typeof value !== 'number' || Number.isNaN(value)) return false;
  if (requireInteger && !Number.isInteger(value)) return false;
  if (value < min || value > max) return false;
  return true;
}

