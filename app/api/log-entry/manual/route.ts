import { authOptions } from '@/lib/auth';
import { getOrCreateTodayLog } from '@/lib/dailyLog';
import { prisma } from '@/lib/db';
import { EntrySource } from '@/prisma/generated/prisma/client/enums';
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
function caloriesFromMacros(
  protein: number,
  carbs: number,
  fat: number
): number {
  return 4 * protein + 4 * carbs + 9 * fat;
}

/**
 * POST /api/log-entry/manual
 * Body: { foodName: string, protein: number, carbs: number, fat: number, mealType: MealType }
 * Creates a manual log entry for today's daily log. entrySource=manual, foodId=null.
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

  const { foodName, protein, carbs, fat, mealType } = body as Record<
    string,
    unknown
  >;

  if (typeof foodName !== 'string' || foodName.trim() === '') {
    return Response.json(
      { error: 'foodName is required and must be a non-empty string' },
      { status: 400 }
    );
  }

  const proteinNum = protein !== undefined ? Number(protein) : undefined;
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

  if (!isMealType(mealType)) {
    return Response.json(
      {
        error: `mealType must be one of: ${MEAL_TYPES.join(', ')}`,
      },
      { status: 400 }
    );
  }

  const caloriesSnapshot = Math.round(
    caloriesFromMacros(proteinNum, carbsNum, fatNum)
  );
  const proteinSnapshot = Math.round(proteinNum);
  const carbsSnapshot = Math.round(carbsNum);
  const fatSnapshot = Math.round(fatNum);
  const grams = proteinSnapshot + carbsSnapshot + fatSnapshot;

  const dailyLog = await getOrCreateTodayLog(userId);

  await prisma.dailyLogEntry.create({
    data: {
      dailyLog: { connect: { id: dailyLog.id } },
      mealType,
      entrySource: EntrySource.manual,
      foodName: foodName.trim(),
      grams,
      caloriesSnapshot,
      proteinSnapshot,
      carbsSnapshot,
      fatSnapshot,
    },
  });

  revalidatePath('/today');
  return Response.json({ success: true });
}
