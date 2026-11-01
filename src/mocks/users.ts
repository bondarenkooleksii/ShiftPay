import type { AuthUser } from '@/types';

export interface SeedAccount extends AuthUser {
  password: string;
  phone?: string;
}

export const seedAccounts: SeedAccount[] = [
  {
    id: 'u-owner',
    email: 'owner@shiftpay.ua',
    password: 'owner123',
    name: 'Олексій Бондаренко',
    role: 'owner',
    roleLabel: 'Власник бізнесу',
  },
  {
    id: 'u-admin',
    email: 'admin@shiftpay.ua',
    password: 'admin123',
    name: 'Денис Іванов',
    role: 'admin',
    roleLabel: 'Старший адміністратор',
    memberId: 't3',
    venue: 'Coffee Corner • Центр',
  },
  {
    id: 'u-employee',
    email: 'barista@shiftpay.ua',
    password: 'barista123',
    name: 'Олексій Бондаренко',
    role: 'employee',
    roleLabel: 'Бариста / Працівник',
    memberId: 't1',
    venue: 'Coffee Corner • Центр',
  },
];

export const DEMO_CREDENTIALS = seedAccounts.map(({ role, email, password }) => ({
  role,
  email,
  password,
}));
