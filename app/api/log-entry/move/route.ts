import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { revalidatePath } from 'next/cache';

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'] as const;
type MealType = (typeof MEAL_TYPES)[number];

function isMealType(value: unknown): value is MealType {
  return typeof value === 'string' && MEAL_TYPES.includes(value as MealType);
}

const ENTRY_SELECT = {
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
} as const;

/**
 * POST /api/log-entry/move
 * Body: { entryId: string, newMealType: MealType }
 * Updates only the mealType of the entry. Entry must belong to the logged-in user.
 */
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (body === null || typeof body !== 'object') {
    return Response.json({ error: 'Body must be an object' }, { status: 400 });
  }

  const { entryId, newMealType } = body as Record<string, unknown>;

  if (typeof entryId !== 'string' || entryId.trim() === '') {
    return Response.json(
      { error: 'entryId is required and must be a non-empty string' },
      { status: 400 }
    );
  }

  if (!isMealType(newMealType)) {
    return Response.json(
      { error: `newMealType must be one of: ${MEAL_TYPES.join(', ')}` },
      { status: 400 }
    );
  }

  const existing = await prisma.dailyLogEntry.findUnique({
    where: { id: entryId.trim() },
    select: { id: true, dailyLog: { select: { userId: true } } },
  });

  if (!existing || existing.dailyLog.userId !== userId) {
    return Response.json({ error: 'Log entry not found' }, { status: 404 });
  }

  try {
    const entry = await prisma.dailyLogEntry.update({
      where: { id: entryId.trim() },
      data: { mealType: newMealType },
      select: ENTRY_SELECT,
    });
    revalidatePath('/today');
    return Response.json(entry);
  } catch (err) {
    console.error('[api/log-entry/move]', err);
    return Response.json(
      { error: 'Failed to move log entry' },
      { status: 500 }
    );
  }
}
