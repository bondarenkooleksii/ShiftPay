import type { SidebarItem } from '@/shared/layout/Sidebar';
import type { UserRole } from '@/types';
import { PATHS } from './paths';

export interface NavItem extends SidebarItem {
  to?: string;
  action?: 'submit-shift';
}

export const ROLE_NAMES: Record<UserRole, string> = {
  employee: 'Працівник',
  admin: 'Адміністратор',
  owner: 'Власник',
};

export const NAV_ITEMS: Record<UserRole, NavItem[]> = {
  owner: [
    { id: 'venues', label: 'Мої заклади', icon: 'building', to: PATHS.owner.home },
    { id: 'team', label: 'Команда та ролі', icon: 'users', to: PATHS.owner.team },
    { id: 'shifts', label: 'Зміни та виплати', icon: 'calendar', to: PATHS.owner.shifts },
    { id: 'analytics', label: 'Аналітика', icon: 'chart', to: PATHS.owner.analytics },
    {
      id: 'settings',
      label: 'Налаштування',
      icon: 'settings',
      to: PATHS.owner.settings,
      dividerBefore: true,
    },
    { id: 'support', label: 'Підтримка', icon: 'help', to: PATHS.owner.support },
  ],
  admin: [
    { id: 'register', label: 'Внесення та журнал змін', icon: 'clock', to: PATHS.admin.home },
    {
      id: 'adjustments',
      label: 'Коригування заявок',
      icon: 'pencil',
      to: PATHS.admin.adjustments,
    },
    { id: 'workers', label: 'Працівники на зміні', icon: 'users', to: PATHS.admin.workers },
    {
      id: 'settings',
      label: 'Налаштування зміни',
      icon: 'settings',
      to: PATHS.admin.settings,
      dividerBefore: true,
    },
  ],
  employee: [
    { id: 'balance', label: 'Мій баланс і зміни', icon: 'coin', to: PATHS.employee.home },
    { id: 'submit-shift', label: 'Подати зміну', icon: 'plusCircle', action: 'submit-shift' },
    {
      id: 'archive',
      label: 'Архів чеків та виплат',
      icon: 'document',
      to: PATHS.employee.archive,
    },
    {
      id: 'profile-settings',
      label: 'Налаштування профілю',
      icon: 'user',
      to: PATHS.employee.settings,
      dividerBefore: true,
    },
  ],
};

export function activeNavId(role: UserRole, pathname: string): string | undefined {
  return NAV_ITEMS[role].find((item) => item.to === pathname)?.id;
}
