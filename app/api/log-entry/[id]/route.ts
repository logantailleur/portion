import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'] as const;
type MealType = (typeof MEAL_TYPES)[number];

function isMealType(value: unknown): value is MealType {
  return typeof value === 'string' && MEAL_TYPES.includes(value as MealType);
}

/**
 * PATCH /api/log-entry/[id]
 * Body: { mealType: MealType }
 * Updates only the mealType of the entry. Entry must belong to the logged-in user.
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (body === null || typeof body !== 'object') {
    return Response.json({ error: 'Body must be an object' }, { status: 400 });
  }

  const { mealType } = body as Record<string, unknown>;
  if (!isMealType(mealType)) {
    return Response.json(
      { error: `mealType must be one of: ${MEAL_TYPES.join(', ')}` },
      { status: 400 }
    );
  }

  const existing = await prisma.dailyLogEntry.findUnique({
    where: { id },
    select: { id: true, dailyLog: { select: { userId: true } } },
  });

  if (!existing || existing.dailyLog.userId !== userId) {
    return Response.json({ error: 'Log entry not found' }, { status: 404 });
  }

  const entry = await prisma.dailyLogEntry.update({
    where: { id },
    data: { mealType },
    select: {
      id: true,
      dailyLogId: true,
      foodId: true,
      mealType: true,
      entrySource: true,
      foodName: true,
      notes: true,
      grams: true,
      caloriesSnapshot: true,
      proteinSnapshot: true,
      carbsSnapshot: true,
      fatSnapshot: true,
    },
  });

  return Response.json(entry);
}
