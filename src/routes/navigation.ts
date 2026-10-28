import type { UserRole } from '../data/mockData';

// Sidebar nav id -> URL. 'settings' depends on role, so it is resolved in navPathFor.
const NAV_PATHS: Record<string, string> = {
  venues: '/owner',
  team: '/owner/team',
  shifts: '/owner/shifts',
  analytics: '/owner/analytics',
  support: '/owner/support',
  register: '/admin',
  adjustments: '/admin/adjustments',
  workers: '/admin/workers',
  balance: '/employee',
  archive: '/employee/archive',
  'profile-settings': '/employee/settings',
};

export function navPathFor(navId: string, role: UserRole): string | null {
  if (navId === 'settings') return role === 'owner' ? '/owner/settings' : '/admin/settings';
  return NAV_PATHS[navId] ?? null;
}

export function roleFromPath(pathname: string): UserRole {
  if (pathname.startsWith('/owner')) return 'owner';
  if (pathname.startsWith('/admin')) return 'admin';
  return 'employee';
}

export function activeNavFromPath(pathname: string): string {
  const [, section, sub] = pathname.split('/');
  if (section === 'owner') {
    if (!sub) return 'venues';
    return sub; // team | shifts | analytics | settings | support
  }
  if (section === 'admin') {
    if (!sub) return 'register';
    return sub; // adjustments | workers | settings
  }
  if (sub === 'archive') return 'archive';
  if (sub === 'settings') return 'profile-settings';
  return 'balance';
}
