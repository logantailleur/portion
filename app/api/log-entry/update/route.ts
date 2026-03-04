import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { revalidatePath } from 'next/cache';

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'] as const;
type MealType = (typeof MEAL_TYPES)[number];

function isMealType(value: unknown): value is MealType {
  return typeof value === 'string' && MEAL_TYPES.includes(value as MealType);
}

function isNonNegativeNumber(value: unknown): value is number {
  return typeof value === 'number' && !Number.isNaN(value) && value >= 0;
}

/** Calories from macros: 4 cal/g protein, 4 cal/g carbs, 9 cal/g fat */
function caloriesFromMacros(protein: number, carbs: number, fat: number): number {
  return 4 * protein + 4 * carbs + 9 * fat;
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
 * POST /api/log-entry/update
 * Body: { entryId: string, foodName: string, protein: number, carbs: number, fat: number, mealType?: MealType }
 * Updates foodName and macros and optionally mealType; recalculates calories server-side. Entry must belong to the logged-in user.
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

  const { entryId, foodName, protein, carbs, fat, mealType } = body as Record<
    string,
    unknown
  >;

  if (typeof entryId !== 'string' || entryId.trim() === '') {
    return Response.json(
      { error: 'entryId is required and must be a non-empty string' },
      { status: 400 }
    );
  }

  if (typeof foodName !== 'string' || foodName.trim() === '') {
    return Response.json(
      { error: 'foodName is required and must be a non-empty string' },
      { status: 400 }
    );
  }

  const proteinNum =
    protein !== undefined ? Number(protein) : undefined;
  const carbsNum = carbs !== undefined ? Number(carbs) : undefined;
  const fatNum = fat !== undefined ? Number(fat) : undefined;

  if (!isNonNegativeNumber(proteinNum)) {
    return Response.json(
      { error: 'protein is required and must be a non-negative number' },
      { status: 400 }
    );
  }
  if (!isNonNegativeNumber(carbsNum)) {
    return Response.json(
      { error: 'carbs is required and must be a non-negative number' },
      { status: 400 }
    );
  }
  if (!isNonNegativeNumber(fatNum)) {
    return Response.json(
      { error: 'fat is required and must be a non-negative number' },
      { status: 400 }
    );
  }

  let mealTypeToUpdate: MealType | undefined;
  if (mealType !== undefined) {
    if (!isMealType(mealType)) {
      return Response.json(
        { error: `mealType must be one of: ${MEAL_TYPES.join(', ')}` },
        { status: 400 }
      );
    }
    mealTypeToUpdate = mealType;
  }

  const existing = await prisma.dailyLogEntry.findUnique({
    where: { id: entryId.trim() },
    select: { id: true, dailyLog: { select: { userId: true } } },
  });

  if (!existing || existing.dailyLog.userId !== userId) {
    return Response.json({ error: 'Log entry not found' }, { status: 404 });
  }

  const caloriesSnapshot = Math.round(
    caloriesFromMacros(proteinNum, carbsNum, fatNum)
  );
  const proteinSnapshot = Math.round(proteinNum);
  const carbsSnapshot = Math.round(carbsNum);
  const fatSnapshot = Math.round(fatNum);
  const grams = proteinSnapshot + carbsSnapshot + fatSnapshot;

  try {
    const entry = await prisma.dailyLogEntry.update({
      where: { id: entryId.trim() },
      data: {
        foodName: foodName.trim(),
        grams,
        caloriesSnapshot,
        proteinSnapshot,
        carbsSnapshot,
        fatSnapshot,
        ...(mealTypeToUpdate ? { mealType: mealTypeToUpdate } : {}),
      },
      select: ENTRY_SELECT,
    });
    revalidatePath('/today');
    return Response.json(entry);
  } catch (err) {
    console.error('[api/log-entry/update]', err);
    return Response.json(
      { error: 'Failed to update log entry' },
      { status: 500 }
    );
  }
}
