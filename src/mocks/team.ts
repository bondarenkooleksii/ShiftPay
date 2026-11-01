import type { TeamMember } from '@/types';

export const initialTeam: TeamMember[] = [
  {
    id: 't1',
    name: 'Бондаренко Олексій',
    role: 'Бариста',
    venue: 'Coffee Corner • Центр',
    rate: 90,
    active: true,
    phone: '+380 67 123 45 67',
  },
  {
    id: 't2',
    name: 'Шевченко Лілія',
    role: 'Бариста',
    venue: 'Coffee Corner • Центр',
    rate: 95,
    active: true,
    phone: '+380 63 222 11 00',
  },
  {
    id: 't3',
    name: 'Іванов Денис',
    role: 'Адміністратор',
    venue: 'Coffee Corner • Центр',
    rate: 140,
    active: true,
    phone: '+380 50 765 43 21',
  },
  {
    id: 't4',
    name: 'Мельник Анна',
    role: 'Касир',
    venue: 'Coffee Corner • Поділ',
    rate: 85,
    active: true,
    phone: '+380 97 555 12 34',
  },
  {
    id: 't5',
    name: 'Коваленко Дмитро',
    role: 'Офіціант',
    venue: 'Coffee Corner • Поділ',
    rate: 80,
    active: false,
    phone: '+380 66 909 80 70',
  },
];
