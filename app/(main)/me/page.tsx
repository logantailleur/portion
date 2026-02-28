import { calculateCaloriePlan, getGoalEstimate } from '@/lib/calorieEngine';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { bestWeighInPerDay } from '@/lib/weighIns';
import Box from '@mui/material/Box';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import MeGoalsSummary from './MeGoalsSummary';
import MeUserSettings from './MeUserSettings';
import MeWeighIns from './MeWeighIns';

export default async function MePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect('/login');
  }

  const [user, weighIns] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        currentWeight: true,
        targetWeight: true,
        heightCm: true,
        age: true,
        sex: true,
        activityLevel: true,
        calorieTarget: true,
        proteinTarget: true,
        carbsTarget: true,
        fatTarget: true,
      },
    }),
    prisma.weighIn.findMany({
      where: { userId: session.user.id },
      orderBy: { date: 'asc' },
      select: { id: true, weightKg: true, date: true },
    }),
  ]);

  const onePerDay = bestWeighInPerDay(weighIns);
  const initialWeighIns = onePerDay.map((w) => ({
    id: w.id,
    weightKg: w.weightKg,
    date: w.date.toISOString(),
  }));
  const allWeighIns = weighIns.map((w) => ({
    id: w.id,
    weightKg: w.weightKg,
    date: w.date.toISOString(),
  }));

  const initialBodyMetrics = {
    currentWeight: user?.currentWeight ?? null,
    targetWeight: user?.targetWeight ?? null,
    heightCm: user?.heightCm ?? null,
    age: user?.age ?? null,
    sex: user?.sex ?? null,
    activityLevel: user?.activityLevel ?? null,
  };

  const initialGoals = {
    calorieTarget: user?.calorieTarget ?? null,
    proteinTarget: user?.proteinTarget ?? null,
    carbsTarget: user?.carbsTarget ?? null,
    fatTarget: user?.fatTarget ?? null,
  };

  const goalPoint =
    initialBodyMetrics.currentWeight != null &&
    initialBodyMetrics.targetWeight != null &&
    initialBodyMetrics.heightCm != null &&
    initialBodyMetrics.age != null &&
    initialBodyMetrics.sex != null &&
    initialBodyMetrics.activityLevel != null &&
    initialGoals.calorieTarget != null
      ? getGoalEstimate({
          currentWeightKg: initialBodyMetrics.currentWeight,
          targetWeightKg: initialBodyMetrics.targetWeight,
          heightCm: initialBodyMetrics.heightCm,
          age: initialBodyMetrics.age,
          sex: initialBodyMetrics.sex,
          activityLevel: initialBodyMetrics.activityLevel,
          calorieTarget: initialGoals.calorieTarget,
        })
      : null;

  const planBreakdown =
    initialBodyMetrics.currentWeight != null &&
    initialBodyMetrics.targetWeight != null &&
    initialBodyMetrics.heightCm != null &&
    initialBodyMetrics.age != null &&
    initialBodyMetrics.sex != null &&
    initialBodyMetrics.activityLevel != null
      ? calculateCaloriePlan({
          currentWeightKg: initialBodyMetrics.currentWeight,
          targetWeightKg: initialBodyMetrics.targetWeight,
          heightCm: initialBodyMetrics.heightCm,
          age: initialBodyMetrics.age,
          sex: initialBodyMetrics.sex,
          activityLevel: initialBodyMetrics.activityLevel,
        })
      : null;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <MeGoalsSummary
        initialBodyMetrics={initialBodyMetrics}
        initialGoals={initialGoals}
        planBreakdown={planBreakdown}
      />
      <MeWeighIns
        initialWeighIns={initialWeighIns}
        allWeighIns={allWeighIns}
        goalPoint={
          goalPoint
            ? {
                date: goalPoint.estimatedDate.toISOString(),
                weightKg: goalPoint.targetWeightKg,
              }
            : null
        }
        currentWeightKg={initialBodyMetrics.currentWeight}
      />
      <MeUserSettings />
    </Box>
  );
}
