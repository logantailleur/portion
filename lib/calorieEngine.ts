/**
 * Calorie engine: BMR (Mifflin-St Jeor), TDEE, sustainable deficit,
 * and macro targets (protein 0.8g/lb target, fat 0.3g/lb current, carbs from remainder).
 * All weights/heights in metric; outputs rounded numbers.
 */

const KG_TO_LB = 2.20462;
const CAL_PER_G_PROTEIN = 4;
const CAL_PER_G_CARB = 4;
const CAL_PER_G_FAT = 9;

/** Activity multipliers for TDEE (Mifflin-St Jeor base). */
const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
} as const;

/**
 * Max sustainable deficit (cal) and as fraction of TDEE.
 * Deficit is applied only when currentWeightKg > targetWeightKg.
 * Formula: deficit = min(MAX_DEFICIT_CAL, round(TDEE * MAX_DEFICIT_FRACTION)).
 * Calorie target = TDEE - deficit. External calculators may differ due to
 * different BMR formula (we use Mifflin-St Jeor), activity multipliers, or
 * user-selectable deficit (e.g. 500 vs 1000 cal); we cap at 500 cal and 20%.
 */
const MAX_DEFICIT_CAL = 500;
const MAX_DEFICIT_FRACTION = 0.2;

export type Sex = 'male' | 'female' | 'other';
export type ActivityLevel =
  | 'sedentary'
  | 'light'
  | 'moderate'
  | 'active'
  | 'very_active';

export interface CalorieEngineInput {
  /** Current weight in kg. */
  currentWeightKg: number;
  /** Target weight in kg. */
  targetWeightKg: number;
  /** Height in cm. */
  heightCm: number;
  /** Age in years. */
  age: number;
  sex: Sex;
  activityLevel: ActivityLevel;
}

export interface CalorieEngineResult {
  bmr: number;
  tdee: number;
  calorieTarget: number;
  deficit: number;
  proteinGrams: number;
  fatGrams: number;
  carbsGrams: number;
  proteinCalories: number;
  fatCalories: number;
  carbsCalories: number;
}

/**
 * BMR via Mifflin-St Jeor (metric).
 * Men: 10*weight(kg) + 6.25*height(cm) - 5*age + 5
 * Women: 10*weight(kg) + 6.25*height(cm) - 5*age - 161
 * Other: average of male/female constant => -78
 * Result is floored to match reference calculators (e.g. calculator.net).
 */
function bmrMifflinStJeor(
  weightKg: number,
  heightCm: number,
  age: number,
  sex: Sex
): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  const constant = sex === 'male' ? 5 : sex === 'female' ? -161 : -78;
  return base + constant;
}

/**
 * Pure function: compute BMR, TDEE, sustainable deficit, and macro targets.
 * Weights in kg, height in cm. Returns rounded integers for all outputs.
 */
export function calculateCaloriePlan(
  input: CalorieEngineInput
): CalorieEngineResult {
  const { currentWeightKg, targetWeightKg, heightCm, age, sex, activityLevel } =
    input;

  const bmr = bmrMifflinStJeor(currentWeightKg, heightCm, age, sex);
  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel];
  const tdee = bmr * multiplier;

  const needsDeficit = currentWeightKg > targetWeightKg;
  const deficit = needsDeficit
    ? Math.min(MAX_DEFICIT_CAL, Math.round(tdee * MAX_DEFICIT_FRACTION))
    : 0;
  const calorieTarget = Math.round(tdee - deficit);

  const currentWeightLb = currentWeightKg * KG_TO_LB;
  const targetWeightLb = targetWeightKg * KG_TO_LB;

  const proteinGrams = Math.round(0.8 * targetWeightLb);
  const fatGrams = Math.round(0.3 * currentWeightLb);

  const proteinCalories = proteinGrams * CAL_PER_G_PROTEIN;
  const fatCalories = fatGrams * CAL_PER_G_FAT;
  const carbsCalories = Math.max(
    0,
    calorieTarget - proteinCalories - fatCalories
  );
  const carbsGrams = Math.round(carbsCalories / CAL_PER_G_CARB);

  return {
    bmr: Math.floor(bmr),
    tdee: Math.round(tdee),
    calorieTarget,
    deficit,
    proteinGrams,
    fatGrams,
    carbsGrams,
    proteinCalories: Math.round(proteinCalories),
    fatCalories: Math.round(fatCalories),
    carbsCalories: Math.round(carbsCalories),
  };
}

/** 1 kg body fat ≈ 7716 cal */
const CAL_PER_KG_FAT = 3500 * KG_TO_LB;

export interface GoalEstimateInput {
  currentWeightKg: number;
  targetWeightKg: number;
  heightCm: number;
  age: number;
  sex: Sex;
  activityLevel: ActivityLevel;
  /** User's actual daily calorie target (may differ from engine suggestion). */
  calorieTarget: number;
}

/**
 * Returns estimated goal date and target weight if user is in a deficit and has full metrics; null otherwise.
 */
export function getGoalEstimate(
  input: GoalEstimateInput
): { estimatedDate: Date; targetWeightKg: number } | null {
  const {
    currentWeightKg,
    targetWeightKg,
    heightCm,
    age,
    sex,
    activityLevel,
    calorieTarget,
  } = input;

  const weightDiffKg = currentWeightKg - targetWeightKg;
  if (weightDiffKg <= 0) return null;

  const plan = calculateCaloriePlan({
    currentWeightKg,
    targetWeightKg,
    heightCm,
    age,
    sex,
    activityLevel,
  });
  const dailyDeficit = plan.tdee - calorieTarget;
  if (dailyDeficit <= 0) return null;

  const caloriesToLose = weightDiffKg * CAL_PER_KG_FAT;
  const weeklyDeficit = dailyDeficit * 7;
  const weeks = caloriesToLose / weeklyDeficit;
  const estimatedDate = new Date();
  estimatedDate.setDate(estimatedDate.getDate() + Math.round(weeks * 7));
  estimatedDate.setUTCHours(0, 0, 0, 0);

  return { estimatedDate, targetWeightKg };
}
