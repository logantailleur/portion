import AppShell from "@/components/navigation/AppShell";

/**
 * Layout for all main app routes (today, week, foods, recipes, me).
 * AppShell provides bottom nav, sidebar on desktop, and mobile-first content area.
 * Root (/) does not use this layout.
 */
export default function MainLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <AppShell>{children}</AppShell>;
}
