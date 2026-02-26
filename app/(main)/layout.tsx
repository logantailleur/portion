import AppShell from '@/components/navigation/AppShell';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

/**
 * Layout for all main app routes (today, week, foods, recipes, me, onboarding).
 * AppShell provides bottom nav, sidebar on desktop, and mobile-first content area.
 * Root (/) does not use this layout.
 * Protected: redirects to /login if no session (server-side, no flicker).
 * If user has not completed onboarding, redirects to /onboarding (unless already there).
 */
export default async function MainLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  let session = null;
  try {
    session = await getServerSession(authOptions);
  } catch (err) {
    // Invalid or stale session (e.g. NEXTAUTH_SECRET changed, corrupt cookie)
    redirect('/login');
  }
  if (!session?.user?.id) {
    redirect('/login');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { onboardingComplete: true },
  });

  const pathname = (await headers()).get('x-pathname') ?? '';
  if (!user?.onboardingComplete && pathname !== '/onboarding') {
    redirect('/onboarding');
  }

  return <AppShell>{children}</AppShell>;
}
