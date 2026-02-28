import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';

const DATE_ONLY_REGEX = /^\d{4}-\d{2}-\d{2}$/;

function isValidFloat(value: unknown): value is number {
  return typeof value === 'number' && !Number.isNaN(value) && value >= 0;
}

function parseDateOnly(dateRaw: unknown): Date | null {
  if (dateRaw === undefined || dateRaw === null || dateRaw === '') return null;
  const dateStr =
    typeof dateRaw === 'string' && DATE_ONLY_REGEX.test(dateRaw)
      ? dateRaw
      : new Date(dateRaw as string).toISOString().slice(0, 10);
  if (!DATE_ONLY_REGEX.test(dateStr)) return null;
  return new Date(`${dateStr}T00:00:00.000Z`);
}

/**
 * PATCH /api/user/weigh-ins/[id]
 * Body: { weightKg?: number, date?: string (YYYY-MM-DD) }
 * Updates a weigh-in. Only provided fields are updated.
 * If weightKg is updated, also updates the user's currentWeight when this is their latest weigh-in.
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
  const body = await request.json();
  const weightKg =
    body.weightKg !== undefined ? Number(body.weightKg) : undefined;
  const dateRaw = body.date;

  const existing = await prisma.weighIn.findFirst({
    where: { id, userId },
    select: { id: true, date: true },
  });
  if (!existing) {
    return Response.json({ error: 'Weigh-in not found' }, { status: 404 });
  }

  if (weightKg !== undefined && !isValidFloat(weightKg)) {
    return Response.json(
      { error: 'weightKg must be a non-negative number' },
      { status: 400 }
    );
  }

  const date = parseDateOnly(dateRaw);
  if (dateRaw !== undefined && dateRaw !== null && dateRaw !== '' && date === null) {
    return Response.json(
      { error: 'date must be YYYY-MM-DD or a valid date string' },
      { status: 400 }
    );
  }

  const data: { weightKg?: number; date?: Date } = {};
  if (weightKg !== undefined) data.weightKg = weightKg;
  if (date !== null) data.date = date;

  if (Object.keys(data).length === 0) {
    const weighIn = await prisma.weighIn.findUnique({
      where: { id },
      select: { id: true, weightKg: true, date: true },
    });
    return Response.json({ weighIn });
  }

  const weighIn = await prisma.weighIn.update({
    where: { id },
    data,
    select: { id: true, weightKg: true, date: true },
  });

  if (weightKg !== undefined) {
    const latest = await prisma.weighIn.findFirst({
      where: { userId },
      orderBy: { date: 'desc' },
      select: { id: true, weightKg: true },
    });
    if (latest?.id === id) {
      await prisma.user.update({
        where: { id: userId },
        data: { currentWeight: latest.weightKg },
      });
    }
  }

  return Response.json({ weighIn });
}

/**
 * DELETE /api/user/weigh-ins/[id]
 * Deletes a weigh-in. Optionally updates user.currentWeight to the next latest weigh-in.
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  const existing = await prisma.weighIn.findFirst({
    where: { id, userId },
    select: { id: true, date: true, weightKg: true },
  });
  if (!existing) {
    return Response.json({ error: 'Weigh-in not found' }, { status: 404 });
  }

  const latest = await prisma.weighIn.findFirst({
    where: { userId },
    orderBy: { date: 'desc' },
    select: { id: true, weightKg: true },
  });

  const isLatest = latest?.id === id;
  const nextWeighIn = isLatest
    ? await prisma.weighIn.findFirst({
        where: { userId, id: { not: id } },
        orderBy: { date: 'desc' },
        select: { weightKg: true },
      })
    : null;

  await prisma.weighIn.delete({ where: { id } });
  if (isLatest) {
    await prisma.user.update({
      where: { id: userId },
      data: { currentWeight: nextWeighIn?.weightKg ?? null },
    });
  }

  return Response.json({ deleted: true });
}
