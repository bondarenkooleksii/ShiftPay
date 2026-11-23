import type { AdminSettings, EmployeeProfile, OwnerSettings } from '@/types';

export const seedOwnerSettings: OwnerSettings = {
  legalName: 'ФОП Бондаренко О. В.',
  taxId: '3245109876',
  currency: 'UAH — гривня',
  frequency: 'Раз на два тижні',
  cutoff: '15 та останній день місяця',
  notify: { telegram: true, email: true, shiftChanges: false },
};

export const seedAdminSettings: AdminSettings = {
  graceMinutes: 10,
};

export const seedProfiles: Record<string, EmployeeProfile> = {
  t1: {
    fullName: 'Бондаренко Олексій',
    phone: '+380 67 123 45 67',
    telegram: '@oleksii_barista',
    iban: 'UA21 3223 1300 0002 6007 2335 6600 1',
    notify: { approved: true, payout: true },
  },
};
