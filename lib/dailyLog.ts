import { prisma } from '@/lib/db';

/**
 * Returns today's DailyLog for the user, creating it if it doesn't exist.
 * Date is interpreted as today at 00:00:00 UTC.
 */
export async function getOrCreateTodayLog(userId: string) {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const existing = await prisma.dailyLog.findUnique({
    where: {
      userId_date: { userId, date: today },
    },
  });

  if (existing) return existing;

  return prisma.dailyLog.create({
    data: {
      userId,
      date: today,
    },
  });
}
