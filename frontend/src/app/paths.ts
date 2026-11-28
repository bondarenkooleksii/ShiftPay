import type { UserRole } from '@/types';

export const PATHS = {
  login: '/login',
  employee: {
    home: '/employee',
    archive: '/employee/archive',
    settings: '/employee/settings',
  },
  admin: {
    home: '/admin',
    adjustments: '/admin/adjustments',
    workers: '/admin/workers',
    settings: '/admin/settings',
  },
  owner: {
    home: '/owner',
    team: '/owner/team',
    shifts: '/owner/shifts',
    analytics: '/owner/analytics',
    settings: '/owner/settings',
    support: '/owner/support',
  },
} as const;

export const ROLE_HOME: Record<UserRole, string> = {
  employee: PATHS.employee.home,
  admin: PATHS.admin.home,
  owner: PATHS.owner.home,
};

export function roleFromPath(pathname: string): UserRole {
  if (pathname.startsWith(PATHS.owner.home)) return 'owner';
  if (pathname.startsWith(PATHS.admin.home)) return 'admin';
  return 'employee';
}

export function nextRole(role: UserRole): UserRole {
  if (role === 'employee') return 'admin';
  if (role === 'admin') return 'owner';
  return 'employee';
}
