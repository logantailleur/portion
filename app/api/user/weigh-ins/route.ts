import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';

function isValidFloat(value: unknown): value is number {
  return typeof value === 'number' && !Number.isNaN(value) && value >= 0;
}

/**
 * GET /api/user/weigh-ins
 * Returns weigh-ins for the current user, ordered by date ascending.
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const weighIns = await prisma.weighIn.findMany({
    where: { userId },
    orderBy: { date: 'asc' },
    select: { id: true, weightKg: true, date: true },
  });

  return Response.json({ weighIns });
}

/**
 * POST /api/user/weigh-ins
 * Body: { weightKg: number, date?: string (ISO) }
 * Adds a weigh-in. If date is omitted, uses start of today (UTC).
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
    date = new Date(dateRaw);
    if (Number.isNaN(date.getTime())) {
      return Response.json(
        { error: 'date must be a valid ISO date string' },
        { status: 400 }
      );
    }
    date.setUTCHours(0, 0, 0, 0);
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
