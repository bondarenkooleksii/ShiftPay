import type { UserProfile, UserRole } from '@/types';

export const USERS: Record<UserRole, UserProfile> = {
  owner: { initials: 'ОБ', name: 'Олексій Бондаренко', roleLabel: 'Власник бізнесу' },
  admin: {
    initials: 'ДІ',
    name: 'Денис Іванов',
    roleLabel: 'Старший адміністратор',
    venueLabel: 'Coffee Corner Центр',
  },
  employee: {
    initials: 'ОБ',
    name: 'Олексій Бондаренко',
    roleLabel: 'Бариста / Працівник',
    venueLabel: 'Coffee Corner Центр',
  },
};
