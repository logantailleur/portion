/**
 * Reduces weigh-ins to one per calendar day (UTC), keeping the "best" (lowest weight) for each day.
 */
export function bestWeighInPerDay<
  T extends { id: string; weightKg: number; date: Date },
>(weighIns: T[]): T[] {
  const byDay = new Map<string, T>();
  for (const w of weighIns) {
    const day = w.date.toISOString().slice(0, 10); // YYYY-MM-DD UTC
    const existing = byDay.get(day);
    if (!existing || w.weightKg < existing.weightKg) {
      byDay.set(day, w);
    }
  }
  return [...byDay.values()].sort(
    (a, b) => a.date.getTime() - b.date.getTime()
  );
}
