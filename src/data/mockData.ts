// Mock data for the frontend-only demo. Replace with API calls once a backend exists.

export type UserRole = 'owner' | 'admin' | 'employee';

export interface Venue {
  id: string;
  name: string;
  type: string;
  address: string;
  staffCount: number;
}

export interface EmployeeShift {
  id: string;
  date: string;
  type: string;
  hours: number;
  amount: number;
  status: 'Підтверджено' | 'На модерації';
}

export const VENUE_TYPES = [
  'Кав’ярня',
  'Ресторан',
  'Бар / Паб',
  'Пекарня',
  'Салон краси / Барбершоп',
  'Магазин / Роздріб',
];

export const initialVenues: Venue[] = [
  {
    id: 'v1',
    name: 'Coffee Corner • Центр',
    type: 'Кав’ярня',
    address: 'м. Київ, вул. Хрещатик, 15',
    staffCount: 4,
  },
  {
    id: 'v2',
    name: 'Coffee Corner • Поділ',
    type: 'Кав’ярня',
    address: 'м. Київ, вул. Сагайдачного, 22',
    staffCount: 3,
  },
];

export const initialEmployeeShifts: EmployeeShift[] = [
  {
    id: 's1',
    date: '24.09.2026',
    type: 'Денна зміна (08:00 - 20:00, перерва 30 хв)',
    hours: 11.5,
    amount: 1035,
    status: 'Підтверджено',
  },
  {
    id: 's2',
    date: '22.09.2026',
    type: 'Денна зміна (08:00 - 20:00, перерва 30 хв)',
    hours: 11.5,
    amount: 1035,
    status: 'Підтверджено',
  },
  {
    id: 's3',
    date: '20.09.2026',
    type: 'Денна зміна (08:00 - 16:00, без перерви)',
    hours: 8.0,
    amount: 720,
    status: 'На модерації',
  },
];

export const USERS: Record<
  UserRole,
  { initials: string; name: string; roleLabel: string; venueLabel?: string }
> = {
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

/* ---------- Owner: team ---------- */

export const STAFF_ROLES = ['Бариста', 'Адміністратор', 'Касир', 'Офіціант'];

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  venue: string;
  rate: number;
  active: boolean;
  phone: string;
}

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

/* ---------- Owner: shifts & payroll ---------- */

export interface PayrollShift {
  id: string;
  date: string;
  worker: string;
  role: string;
  venue: string;
  hours: number;
  rate: number;
  status: 'Підтверджено' | 'Очікує' | 'Виплачено';
}

export const initialPayrollShifts: PayrollShift[] = [
  {
    id: 'p1',
    date: '24.09.2026',
    worker: 'Бондаренко Олексій',
    role: 'Бариста',
    venue: 'Coffee Corner • Центр',
    hours: 11.5,
    rate: 90,
    status: 'Підтверджено',
  },
  {
    id: 'p2',
    date: '24.09.2026',
    worker: 'Шевченко Лілія',
    role: 'Бариста',
    venue: 'Coffee Corner • Центр',
    hours: 8,
    rate: 95,
    status: 'Підтверджено',
  },
  {
    id: 'p3',
    date: '24.09.2026',
    worker: 'Мельник Анна',
    role: 'Касир',
    venue: 'Coffee Corner • Поділ',
    hours: 8,
    rate: 85,
    status: 'Очікує',
  },
  {
    id: 'p4',
    date: '23.09.2026',
    worker: 'Іванов Денис',
    role: 'Адміністратор',
    venue: 'Coffee Corner • Центр',
    hours: 10,
    rate: 140,
    status: 'Підтверджено',
  },
  {
    id: 'p5',
    date: '23.09.2026',
    worker: 'Коваленко Дмитро',
    role: 'Офіціант',
    venue: 'Coffee Corner • Поділ',
    hours: 6,
    rate: 80,
    status: 'Виплачено',
  },
  {
    id: 'p6',
    date: '22.09.2026',
    worker: 'Бондаренко Олексій',
    role: 'Бариста',
    venue: 'Coffee Corner • Центр',
    hours: 11.5,
    rate: 90,
    status: 'Виплачено',
  },
  {
    id: 'p7',
    date: '22.09.2026',
    worker: 'Мельник Анна',
    role: 'Касир',
    venue: 'Coffee Corner • Поділ',
    hours: 8,
    rate: 85,
    status: 'Виплачено',
  },
];

/* ---------- Owner: analytics ---------- */

export const ANALYTICS_PERIODS = ['Вересень 2026', 'Останні 30 днів', 'Квартал'];

export const venueLaborCost = [
  { venue: 'Coffee Corner • Центр', amount: 28400 },
  { venue: 'Coffee Corner • Поділ', amount: 19850 },
];

export const weeklyHours = [
  { day: 'Пн', hours: 34 },
  { day: 'Вт', hours: 31 },
  { day: 'Ср', hours: 36 },
  { day: 'Чт', hours: 38 },
  { day: 'Пт', hours: 46 },
  { day: 'Сб', hours: 52 },
  { day: 'Нд', hours: 41 },
];

export const peakHours = [
  { hour: '08:00', load: 55 },
  { hour: '10:00', load: 70 },
  { hour: '12:00', load: 92 },
  { hour: '14:00', load: 78 },
  { hour: '16:00', load: 64 },
  { hour: '18:00', load: 88 },
  { hour: '20:00', load: 40 },
];

/* ---------- Employee: payout archive ---------- */

export interface Payslip {
  id: string;
  receipt: string;
  paidOn: string;
  period: string;
  year: string;
  month: string;
  hours: number;
  rate: number;
  bonus: number;
  deduction: number;
}

export const payslips: Payslip[] = [
  {
    id: 'ps1',
    receipt: 'SP-2026-0918',
    paidOn: '30.09.2026',
    period: '16.09 – 30.09.2026',
    year: '2026',
    month: 'Вересень',
    hours: 92,
    rate: 90,
    bonus: 500,
    deduction: 0,
  },
  {
    id: 'ps2',
    receipt: 'SP-2026-0907',
    paidOn: '15.09.2026',
    period: '01.09 – 15.09.2026',
    year: '2026',
    month: 'Вересень',
    hours: 84,
    rate: 90,
    bonus: 0,
    deduction: 150,
  },
  {
    id: 'ps3',
    receipt: 'SP-2026-0822',
    paidOn: '31.08.2026',
    period: '16.08 – 31.08.2026',
    year: '2026',
    month: 'Серпень',
    hours: 96,
    rate: 85,
    bonus: 300,
    deduction: 0,
  },
  {
    id: 'ps4',
    receipt: 'SP-2026-0811',
    paidOn: '15.08.2026',
    period: '01.08 – 15.08.2026',
    year: '2026',
    month: 'Серпень',
    hours: 80,
    rate: 85,
    bonus: 0,
    deduction: 0,
  },
  {
    id: 'ps5',
    receipt: 'SP-2026-0719',
    paidOn: '31.07.2026',
    period: '16.07 – 31.07.2026',
    year: '2026',
    month: 'Липень',
    hours: 88,
    rate: 85,
    bonus: 200,
    deduction: 100,
  },
  {
    id: 'ps6',
    receipt: 'SP-2025-1220',
    paidOn: '31.12.2025',
    period: '16.12 – 31.12.2025',
    year: '2025',
    month: 'Грудень',
    hours: 90,
    rate: 80,
    bonus: 1000,
    deduction: 0,
  },
];

/* ---------- Admin: workers on duty ---------- */

export type DutyStatus = 'active' | 'break' | 'finished';

export interface DutyWorker {
  id: string;
  name: string;
  role: string;
  scheduled: string;
  startedMinutesAgo: number;
  status: DutyStatus;
}

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

/* ---------- Admin: adjustment requests ---------- */

export interface AdjustmentRequest {
  id: string;
  worker: string;
  role: string;
  date: string;
  submittedStart: string;
  submittedEnd: string;
  submittedBreak: number;
  scheduledStart: string;
  scheduledEnd: string;
  scheduledBreak: number;
  workerNote: string;
  status: 'pending' | 'approved' | 'rejected' | 'clarify';
}

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

/* ---------- Admin: shift templates ---------- */

export interface ShiftTemplate {
  id: string;
  name: string;
  start: string;
  end: string;
  breakMinutes: number;
}

export const initialTemplates: ShiftTemplate[] = [
  { id: 'tpl1', name: 'Денна зміна', start: '08:00', end: '20:00', breakMinutes: 30 },
  { id: 'tpl2', name: 'Ранкова зміна', start: '08:00', end: '16:00', breakMinutes: 0 },
  { id: 'tpl3', name: 'Вечірня зміна', start: '16:00', end: '22:00', breakMinutes: 0 },
];

/* ---------- Owner: support FAQ ---------- */

export const faqItems = [
  {
    q: 'Як розраховується сума виплати?',
    a: 'Сума виплати = підтверджені години × погодинна ставка працівника + бонуси − утримання. Перерви не входять до оплачуваного часу.',
  },
  {
    q: 'Хто підтверджує зміни працівників?',
    a: 'Зміни підтверджує старший адміністратор закладу. Якщо час відрізняється від графіка, заявка потрапляє у розділ «Коригування заявок».',
  },
  {
    q: 'Як запросити нового працівника?',
    a: 'Перейдіть у «Команда та ролі», натисніть «Запросити працівника», заповніть форму та надішліть згенероване посилання або QR-код.',
  },
  {
    q: 'Чи можна змінити графік виплат?',
    a: 'Так, у розділі «Налаштування» оберіть частоту виплат: щотижня, раз на два тижні або щомісяця.',
  },
];

export const SUPPORT_CATEGORIES = [
  'Розрахунок виплат',
  'Підтвердження змін',
  'Запрошення працівників',
  'Технічна проблема',
  'Інше',
];

export const formatUAH = (value: number) =>
  `${value.toLocaleString('uk-UA', { maximumFractionDigits: 0 })} ₴`;
