import TodayView from '@/app/(main)/today/TodayView';
import { authOptions } from '@/lib/auth';
import { getCalorieDistribution } from '@/lib/calorieDistribution';
import { getOrCreateTodayLog } from '@/lib/dailyLog';
import { summarizeDailyLog } from '@/lib/dailyLogSummary';
import { prisma } from '@/lib/db';
import Box from '@mui/material/Box';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

const DEFAULT_DAILY_CALORIE_TARGET = 2000;

export default async function TodayPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) {
    redirect('/login');
  }

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const [log, user] = await Promise.all([
    getOrCreateTodayLog(userId).then((l) =>
      prisma.dailyLog.findUnique({
        where: { id: l.id },
        include: { entries: true },
      })
    ),
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        calorieTarget: true,
        proteinTarget: true,
        carbsTarget: true,
        fatTarget: true,
      },
    }),
  ]);

  if (!log) {
    redirect('/login');
  }

  const summary = summarizeDailyLog(log);
  const dailyCalorieTarget =
    user?.calorieTarget ?? DEFAULT_DAILY_CALORIE_TARGET;
  const macroTargets =
    user && (user.proteinTarget || user.carbsTarget || user.fatTarget)
      ? {
          ...(user.proteinTarget != null
            ? { protein: user.proteinTarget }
            : {}),
          ...(user.carbsTarget != null ? { carbs: user.carbsTarget } : {}),
          ...(user.fatTarget != null ? { fat: user.fatTarget } : {}),
        }
      : undefined;
  const mealTargets = getCalorieDistribution(dailyCalorieTarget);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <TodayView
        summary={summary}
        dailyCalorieTarget={dailyCalorieTarget}
        mealTargets={mealTargets}
        macroTargets={macroTargets}
      />
    </Box>
  );
}
