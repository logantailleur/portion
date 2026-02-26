import { calculateCaloriePlan } from '@/lib/calorieEngine';
import type { ActivityLevel, Sex } from '@/lib/calorieEngine';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import type { Prisma } from '@/prisma/generated/prisma/client/client';
import { getServerSession } from 'next-auth';

const SEX_VALUES: Sex[] = ['male', 'female', 'other'];
const ACTIVITY_LEVELS: ActivityLevel[] = [
  'sedentary',
  'light',
  'moderate',
  'active',
  'very_active',
];

function isValidGoalValue(value: unknown): value is number {
  return (
    typeof value === 'number' &&
    !Number.isNaN(value) &&
    Number.isInteger(value) &&
    value >= 0
  );
}

function isValidFloat(value: unknown): value is number {
  return typeof value === 'number' && !Number.isNaN(value) && value >= 0;
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Body metrics (optional)
    const currentWeight =
      body.currentWeight !== undefined ? Number(body.currentWeight) : undefined;
    const targetWeight =
      body.targetWeight !== undefined ? Number(body.targetWeight) : undefined;
    const heightCm =
      body.heightCm !== undefined ? Number(body.heightCm) : undefined;
    const age = body.age !== undefined ? Number(body.age) : undefined;
    const sex = body.sex as Sex | undefined;
    const activityLevel = body.activityLevel as ActivityLevel | undefined;

    // Recalculate targets from metrics (optional)
    const recalculate = body.recalculate === true;

    // Override targets (optional)
    const calorieTarget = body.calorieTarget;
    const proteinTarget = body.proteinTarget;
    const carbsTarget = body.carbsTarget;
    const fatTarget = body.fatTarget;

    const hasTargetOverride =
      calorieTarget !== undefined ||
      proteinTarget !== undefined ||
      carbsTarget !== undefined ||
      fatTarget !== undefined;

    // Validate body metrics when provided
    if (currentWeight !== undefined && !isValidFloat(currentWeight)) {
      return Response.json(
        { error: 'Invalid currentWeight: must be a non-negative number' },
        { status: 400 }
      );
    }
    if (targetWeight !== undefined && !isValidFloat(targetWeight)) {
      return Response.json(
        { error: 'Invalid targetWeight: must be a non-negative number' },
        { status: 400 }
      );
    }
    if (heightCm !== undefined && !isValidFloat(heightCm)) {
      return Response.json(
        { error: 'Invalid heightCm: must be a non-negative number' },
        { status: 400 }
      );
    }
    if (
      age !== undefined &&
      (typeof age !== 'number' ||
        Number.isNaN(age) ||
        age < 0 ||
        !Number.isInteger(age))
    ) {
      return Response.json(
        { error: 'Invalid age: must be a non-negative integer' },
        { status: 400 }
      );
    }
    if (sex !== undefined && !SEX_VALUES.includes(sex)) {
      return Response.json(
        { error: 'Invalid sex: must be male, female, or other' },
        { status: 400 }
      );
    }
    if (
      activityLevel !== undefined &&
      !ACTIVITY_LEVELS.includes(activityLevel)
    ) {
      return Response.json(
        {
          error:
            'Invalid activityLevel: must be sedentary, light, moderate, active, or very_active',
        },
        { status: 400 }
      );
    }

    if (hasTargetOverride) {
      if (!isValidGoalValue(calorieTarget)) {
        return Response.json(
          { error: 'Invalid calorieTarget: must be a non-negative integer' },
          { status: 400 }
        );
      }
      if (!isValidGoalValue(proteinTarget)) {
        return Response.json(
          { error: 'Invalid proteinTarget: must be a non-negative integer' },
          { status: 400 }
        );
      }
      if (!isValidGoalValue(carbsTarget)) {
        return Response.json(
          { error: 'Invalid carbsTarget: must be a non-negative integer' },
          { status: 400 }
        );
      }
      if (!isValidGoalValue(fatTarget)) {
        return Response.json(
          { error: 'Invalid fatTarget: must be a non-negative integer' },
          { status: 400 }
        );
      }
    }

    // Load current user to merge metrics and decide recalc
    const existing = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        currentWeight: true,
        targetWeight: true,
        heightCm: true,
        age: true,
        sex: true,
        activityLevel: true,
      },
    });

    const merged = {
      currentWeight: currentWeight ?? existing?.currentWeight ?? undefined,
      targetWeight: targetWeight ?? existing?.targetWeight ?? undefined,
      heightCm: heightCm ?? existing?.heightCm ?? undefined,
      age: age ?? existing?.age ?? undefined,
      sex: sex ?? existing?.sex ?? undefined,
      activityLevel: activityLevel ?? existing?.activityLevel ?? undefined,
    };

    const hasAllMetrics =
      merged.currentWeight != null &&
      merged.targetWeight != null &&
      merged.heightCm != null &&
      merged.age != null &&
      merged.sex != null &&
      merged.activityLevel != null;

    const data: Prisma.UserUpdateInput = {};

    // Apply body metrics
    if (currentWeight !== undefined) data.currentWeight = currentWeight;
    if (targetWeight !== undefined) data.targetWeight = targetWeight;
    if (heightCm !== undefined) data.heightCm = heightCm;
    if (age !== undefined) data.age = age;
    if (sex !== undefined) data.sex = sex;
    if (activityLevel !== undefined) data.activityLevel = activityLevel;

    // Targets: override from request, or recalculate from metrics
    if (hasTargetOverride) {
      data.calorieTarget = calorieTarget;
      data.proteinTarget = proteinTarget;
      data.carbsTarget = carbsTarget;
      data.fatTarget = fatTarget;
    } else if (recalculate && hasAllMetrics) {
      const plan = calculateCaloriePlan({
        currentWeightKg: merged.currentWeight!,
        targetWeightKg: merged.targetWeight!,
        heightCm: merged.heightCm!,
        age: merged.age!,
        sex: merged.sex as Sex,
        activityLevel: merged.activityLevel as ActivityLevel,
      });
      data.calorieTarget = plan.calorieTarget;
      data.proteinTarget = plan.proteinGrams;
      data.carbsTarget = plan.carbsGrams;
      data.fatTarget = plan.fatGrams;
    }

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data,
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
      },
      { status: 200 }
    );
  } catch (err) {
    console.error('update-goals:', err);
    return Response.json({ error: 'Failed to update goals' }, { status: 500 });
  }
}
