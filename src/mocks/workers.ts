import type { DutyWorker } from '@/types';

export const initialDutyWorkers: DutyWorker[] = [
  {
    id: 'w1',
    name: 'Бондаренко Олексій',
    role: 'Бариста',
    scheduled: '08:00 - 20:00',
    startedMinutesAgo: 342,
    status: 'active',
  },
  {
    id: 'w2',
    name: 'Шевченко Лілія',
    role: 'Бариста',
    scheduled: '08:00 - 16:00',
    startedMinutesAgo: 318,
    status: 'break',
  },
  {
    id: 'w3',
    name: 'Мельник Анна',
    role: 'Касир',
    scheduled: '10:00 - 18:00',
    startedMinutesAgo: 205,
    status: 'active',
  },
  {
    id: 'w4',
    name: 'Коваленко Дмитро',
    role: 'Помічник бариста',
    scheduled: '06:00 - 12:00',
    startedMinutesAgo: 360,
    status: 'finished',
  },
];
