import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { bestWeighInPerDay } from '@/lib/weighIns';
import { getServerSession } from 'next-auth';

function isValidFloat(value: unknown): value is number {
  return typeof value === 'number' && !Number.isNaN(value) && value >= 0;
}

/**
 * GET /api/user/weigh-ins
 * Returns weigh-ins for the current user, ordered by date ascending.
 * Query: ?all=true to return every weigh-in (for full report); otherwise returns best per day.
 */
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const all = searchParams.get('all') === 'true';

  const rows = await prisma.weighIn.findMany({
    where: { userId },
    orderBy: { date: 'asc' },
    select: { id: true, weightKg: true, date: true },
  });

  const weighIns = all ? rows : bestWeighInPerDay(rows);
  return Response.json({ weighIns });
}

const DATE_ONLY_REGEX = /^\d{4}-\d{2}-\d{2}$/;

/**
 * POST /api/user/weigh-ins
 * Body: { weightKg: number, date?: string (YYYY-MM-DD) }
 * Stores only the calendar date (no time); date is saved as that day at 00:00:00 UTC.
 * If date is omitted, client should send today as YYYY-MM-DD.
 * Also updates the user's currentWeight to this weight so profile stays in sync.
 */
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const weightKg =
    body.weightKg !== undefined ? Number(body.weightKg) : undefined;
  const dateRaw = body.date;

  if (weightKg === undefined || !isValidFloat(weightKg)) {
    return Response.json(
      { error: 'weightKg is required and must be a non-negative number' },
      { status: 400 }
    );
  }

  let date: Date;
  if (dateRaw === undefined || dateRaw === null || dateRaw === '') {
    date = new Date();
    date.setUTCHours(0, 0, 0, 0);
  } else {
    const dateStr =
      typeof dateRaw === 'string' && DATE_ONLY_REGEX.test(dateRaw)
        ? dateRaw
        : new Date(dateRaw).toISOString().slice(0, 10);
    if (!DATE_ONLY_REGEX.test(dateStr)) {
      return Response.json(
        { error: 'date must be YYYY-MM-DD or a valid date string' },
        { status: 400 }
      );
    }
    date = new Date(`${dateStr}T00:00:00.000Z`);
  }

  const [weighIn] = await prisma.$transaction([
    prisma.weighIn.create({
      data: { userId, weightKg, date },
      select: { id: true, weightKg: true, date: true },
    }),
    prisma.user.update({
      where: { id: userId },
      data: { currentWeight: weightKg },
    }),
  ]);

  return Response.json({ weighIn });
}
