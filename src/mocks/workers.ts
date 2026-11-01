import type { DutyWorker } from '@/types';

const minutesAgo = (minutes: number) => new Date(Date.now() - minutes * 60_000).toISOString();

export const seedDutyWorkers = (): DutyWorker[] => [
  {
    id: 'w1',
    workerId: 't1',
    name: 'Бондаренко Олексій',
    role: 'Бариста',
    scheduled: '08:00 - 20:00',
    startedAt: minutesAgo(342),
    status: 'active',
  },
  {
    id: 'w2',
    workerId: 't2',
    name: 'Шевченко Лілія',
    role: 'Бариста',
    scheduled: '08:00 - 16:00',
    startedAt: minutesAgo(318),
    status: 'break',
  },
  {
    id: 'w3',
    workerId: 't6',
    name: 'Ткаченко Марія',
    role: 'Бариста',
    scheduled: '10:00 - 18:00',
    startedAt: minutesAgo(205),
    status: 'active',
  },
];
