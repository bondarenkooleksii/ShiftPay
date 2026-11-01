import type { AdjustmentRequest } from '@/types';

export const initialAdjustments: AdjustmentRequest[] = [
  {
    id: 'a1',
    worker: 'Коваленко Дмитро',
    role: 'Помічник бариста',
    date: '24.09.2026',
    submittedStart: '12:00',
    submittedEnd: '20:30',
    submittedBreak: 30,
    scheduledStart: '12:00',
    scheduledEnd: '20:00',
    scheduledBreak: 30,
    workerNote: 'Залишився на вечірнє прибирання після закриття',
    status: 'pending',
  },
  {
    id: 'a2',
    worker: 'Шевченко Лілія',
    role: 'Бариста',
    date: '23.09.2026',
    submittedStart: '08:00',
    submittedEnd: '15:30',
    submittedBreak: 0,
    scheduledStart: '08:00',
    scheduledEnd: '16:00',
    scheduledBreak: 0,
    workerNote: 'Пішла на 30 хв раніше через низьку кількість відвідувачів',
    status: 'approved',
  },
];
