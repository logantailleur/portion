import { calculateCaloriePlan } from '@/lib/calorieEngine';
import type { ActivityLevel, Sex } from '@/lib/calorieEngine';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';

const SEX_VALUES: Sex[] = ['male', 'female', 'other'];
const ACTIVITY_LEVELS: ActivityLevel[] = [
  'sedentary',
  'light',
  'moderate',
  'active',
  'very_active',
];

function isValidFloat(value: unknown): value is number {
  return typeof value === 'number' && !Number.isNaN(value) && value >= 0;
}

function isValidAge(value: unknown): value is number {
  return (
    typeof value === 'number' &&
    !Number.isNaN(value) &&
    value >= 0 &&
    Number.isInteger(value)
  );
}

/**
 * POST /api/user/update-body-and-targets
 *
 * Authenticated. Accepts body metrics, computes targets via calorieEngine,
 * saves both to the logged-in user. userId is derived from session only.
 *
 * Body: { currentWeight, targetWeight, heightCm, age, sex, activityLevel }
 * All required. Weights and height in kg/cm.
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    const currentWeight =
      body.currentWeight !== undefined ? Number(body.currentWeight) : undefined;
    const targetWeight =
      body.targetWeight !== undefined ? Number(body.targetWeight) : undefined;
    const heightCm =
      body.heightCm !== undefined ? Number(body.heightCm) : undefined;
    const age = body.age !== undefined ? Number(body.age) : undefined;
    const sex = body.sex as Sex | undefined;
    const activityLevel = body.activityLevel as ActivityLevel | undefined;

    if (currentWeight === undefined || !isValidFloat(currentWeight)) {
      return Response.json(
        {
          error:
            'currentWeight is required and must be a non-negative number (kg)',
        },
        { status: 400 }
      );
    }
    if (targetWeight === undefined || !isValidFloat(targetWeight)) {
      return Response.json(
        {
          error:
            'targetWeight is required and must be a non-negative number (kg)',
        },
        { status: 400 }
      );
    }
    if (heightCm === undefined || !isValidFloat(heightCm)) {
      return Response.json(
        { error: 'heightCm is required and must be a non-negative number' },
        { status: 400 }
      );
    }
    if (age === undefined || !isValidAge(age)) {
      return Response.json(
        { error: 'age is required and must be a non-negative integer' },
        { status: 400 }
      );
    }
    if (sex === undefined || !SEX_VALUES.includes(sex)) {
      return Response.json(
        { error: 'sex is required and must be one of: male, female, other' },
        { status: 400 }
      );
    }
    if (
      activityLevel === undefined ||
      !ACTIVITY_LEVELS.includes(activityLevel)
    ) {
      return Response.json(
        {
          error:
            'activityLevel is required and must be one of: sedentary, light, moderate, active, very_active',
        },
        { status: 400 }
      );
    }

    const plan = calculateCaloriePlan({
      currentWeightKg: currentWeight,
      targetWeightKg: targetWeight,
      heightCm,
      age,
      sex,
      activityLevel,
    });

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        currentWeight,
        targetWeight,
        heightCm,
        age,
        sex,
        activityLevel,
        calorieTarget: plan.calorieTarget,
        proteinTarget: plan.proteinGrams,
        carbsTarget: plan.carbsGrams,
        fatTarget: plan.fatGrams,
      },
    });

    return Response.json(
      {
        currentWeight: user.currentWeight,
        targetWeight: user.targetWeight,
        heightCm: user.heightCm,
        age: user.age,
        sex: user.sex,
        activityLevel: user.activityLevel,
        calorieTarget: user.calorieTarget,
        proteinTarget: user.proteinTarget,
        carbsTarget: user.carbsTarget,
        fatTarget: user.fatTarget,
        // For verification vs external calculators: BMR, TDEE, and applied deficit
        bmr: plan.bmr,
        tdee: plan.tdee,
        deficit: plan.deficit,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error('update-body-and-targets:', err);
    return Response.json(
      { error: 'Failed to update body and targets' },
      { status: 500 }
    );
  }
}
