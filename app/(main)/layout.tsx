import AppShell from '@/components/navigation/AppShell';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

/**
 * Layout for all main app routes (today, week, foods, recipes, me).
 * AppShell provides bottom nav, sidebar on desktop, and mobile-first content area.
 * Root (/) does not use this layout.
 * Protected: redirects to /login if no session (server-side, no flicker).
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
  if (!session) {
    redirect('/login');
  }
  return <AppShell>{children}</AppShell>;
}
