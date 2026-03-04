import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { revalidatePath } from 'next/cache';

/**
 * POST /api/log-entry/delete
 * Body: { entryId: string }
 * Hard deletes the DailyLogEntry. Entry must belong to the logged-in user.
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

  const { entryId } = body as Record<string, unknown>;
  if (typeof entryId !== 'string' || entryId.trim() === '') {
    return Response.json(
      { error: 'entryId is required and must be a non-empty string' },
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
    await prisma.dailyLogEntry.delete({ where: { id: entryId.trim() } });
  } catch (err) {
    console.error('[api/log-entry/delete]', err);
    return Response.json(
      { error: 'Failed to delete log entry' },
      { status: 500 }
    );
  }

  revalidatePath('/today');
  return Response.json({ success: true });
}
