// Relative path so the bundler always uses the generated client with current schema
import { PrismaClient } from '../prisma/generated/prisma/client/client';
import { PrismaPg } from '@prisma/adapter-pg';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/** Use sslmode=verify-full to avoid pg SSL semantics warning (prefer/require/verify-ca → verify-full). */
function normalizeConnectionString(url: string): string {
  try {
    const parsed = new URL(url);
    const mode = parsed.searchParams.get('sslmode');
    if (!mode || ['prefer', 'require', 'verify-ca'].includes(mode)) {
      parsed.searchParams.set('sslmode', 'verify-full');
      return parsed.toString();
    }
    return url;
  } catch {
    return url;
  }
}

function createPrismaClient(): PrismaClient {
  const raw = process.env.DATABASE_URL;
  if (!raw) {
    throw new Error('DATABASE_URL is not set');
  }
  const connectionString = normalizeConnectionString(raw);
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
