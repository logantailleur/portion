import { calculateCaloriePlan } from '@/lib/calorieEngine';
import type { ActivityLevel, Sex } from '@/lib/calorieEngine';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import {
  ACTIVITY_LEVELS,
  SEX_VALUES,
  isValidAge,
  isValidFloat,
} from '@/lib/userValidation';
const GOAL_TYPES = ['lose', 'maintain', 'gain'] as const;
type GoalType = (typeof GOAL_TYPES)[number];

/** Extra calories added for gain goal (server-side; never trust client math). */
const SURPLUS_CAL = 300;

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
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
    const goalType = body.goalType as GoalType | undefined;

    // Require all fields
    if (currentWeight === undefined || !isValidFloat(currentWeight)) {
      return Response.json(
        { error: 'Invalid currentWeight: must be a non-negative number' },
        { status: 400 }
      );
    }
    if (targetWeight === undefined || !isValidFloat(targetWeight)) {
      return Response.json(
        { error: 'Invalid targetWeight: must be a non-negative number' },
        { status: 400 }
      );
    }
    if (heightCm === undefined || !isValidFloat(heightCm)) {
      return Response.json(
        { error: 'Invalid heightCm: must be a non-negative number' },
        { status: 400 }
      );
    }
    if (age === undefined || !isValidAge(age, { min: 13, max: 120 })) {
      return Response.json(
        { error: 'Invalid age: must be an integer between 13 and 120' },
        { status: 400 }
      );
    }
    if (!sex || !SEX_VALUES.includes(sex)) {
      return Response.json(
        { error: 'Invalid sex: must be male, female, or other' },
        { status: 400 }
      );
    }
    if (!activityLevel || !ACTIVITY_LEVELS.includes(activityLevel)) {
      return Response.json(
        {
          error:
            'Invalid activityLevel: must be sedentary, light, moderate, active, or very_active',
        },
        { status: 400 }
      );
    }
    if (!goalType || !GOAL_TYPES.includes(goalType)) {
      return Response.json(
        { error: 'Invalid goalType: must be lose, maintain, or gain' },
        { status: 400 }
      );
    }

    // Server-side calculation: never trust client math
    const targetWeightForEngine =
      goalType === 'maintain' ? currentWeight : targetWeight;
    const plan = calculateCaloriePlan({
      currentWeightKg: currentWeight,
      targetWeightKg: targetWeightForEngine,
      heightCm,
      age,
      sex,
      activityLevel,
    });

    let calorieTarget = plan.calorieTarget;
    let proteinTarget = plan.proteinGrams;
    let fatTarget = plan.fatGrams;
    let carbsTarget = plan.carbsGrams;

    if (goalType === 'gain') {
      calorieTarget = plan.calorieTarget + SURPLUS_CAL;
      carbsTarget = plan.carbsGrams + Math.round(SURPLUS_CAL / 4);
    }

    const targetWeightToSave =
      goalType === 'maintain' ? currentWeight : targetWeight;

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        currentWeight,
        targetWeight: targetWeightToSave,
        heightCm,
        age,
        sex,
        activityLevel,
        calorieTarget,
        proteinTarget,
        fatTarget,
        carbsTarget,
        onboardingComplete: true,
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
        onboardingComplete: user.onboardingComplete,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error('complete-onboarding:', err);
    return Response.json(
      { error: 'Failed to complete onboarding' },
      { status: 500 }
    );
  }
}
