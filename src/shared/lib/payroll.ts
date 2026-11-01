import type { Payslip, PayoutMethod, Shift, ShiftStatus } from '@/types';

export const MONTHS_UK = [
  'Січень',
  'Лютий',
  'Березень',
  'Квітень',
  'Травень',
  'Червень',
  'Липень',
  'Серпень',
  'Вересень',
  'Жовтень',
  'Листопад',
  'Грудень',
];

export const SHIFT_STATUS_LABEL: Record<ShiftStatus, string> = {
  pending: 'На модерації',
  confirmed: 'Підтверджено',
  clarify: 'Потрібне уточнення',
  rejected: 'Відхилено',
  paid: 'Виплачено',
};

export const toMinutes = (time: string) => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};

export function calcHours(start: string, end: string, breakMinutes: number) {
  let minutes = toMinutes(end) - toMinutes(start);
  if (minutes <= 0) minutes += 24 * 60;
  return Math.max(0, Math.round(((minutes - breakMinutes) / 60) * 100) / 100);
}

export const shiftAmount = (shift: Pick<Shift, 'hours' | 'rate'>) =>
  Math.round(shift.hours * shift.rate);

export const sumHours = (shifts: Pick<Shift, 'hours'>[]) =>
  Math.round(shifts.reduce((sum, s) => sum + s.hours, 0) * 100) / 100;

export const sumAmount = (shifts: Pick<Shift, 'hours' | 'rate'>[]) =>
  shifts.reduce((sum, s) => sum + shiftAmount(s), 0);

export const isPayable = (shift: Shift) => shift.status === 'confirmed';

export const unpaidBalance = (shifts: Shift[]) => sumAmount(shifts.filter(isPayable));

export const todayIso = () => {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
};

export function validateShift(
  input: { date: string; start: string; end: string; breakMinutes: number },
  existing: Pick<Shift, 'date' | 'status'>[],
  today = todayIso()
): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date)) return 'Вкажіть коректну дату зміни';
  if (input.date > today) return 'Не можна подати зміну на майбутню дату';
  if (!/^\d{2}:\d{2}$/.test(input.start) || !/^\d{2}:\d{2}$/.test(input.end)) {
    return 'Вкажіть час початку та завершення';
  }
  const hours = calcHours(input.start, input.end, input.breakMinutes);
  if (hours < 1) return 'Тривалість зміни має бути не менше 1 години';
  if (hours > 16) return 'Тривалість зміни не може перевищувати 16 годин';
  if (existing.some((s) => s.date === input.date && s.status !== 'rejected')) {
    return 'Зміну на цю дату вже подано';
  }
  return null;
}

const ALLOWED_TRANSITIONS: Record<ShiftStatus, ShiftStatus[]> = {
  pending: ['confirmed', 'rejected', 'clarify'],
  clarify: ['confirmed', 'rejected', 'pending'],
  confirmed: ['pending', 'rejected'],
  rejected: ['pending'],
  paid: [],
};

export const canTransition = (from: ShiftStatus, to: ShiftStatus) =>
  from === to || ALLOWED_TRANSITIONS[from].includes(to);

const shortDate = (iso: string) => `${iso.slice(8, 10)}.${iso.slice(5, 7)}`;

export function periodLabel(dates: string[]) {
  const sorted = [...dates].sort();
  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  return `${shortDate(first)} – ${shortDate(last)}.${last.slice(0, 4)}`;
}

export function buildPayslip(params: {
  id: string;
  receipt: string;
  workerId: string;
  shifts: Shift[];
  method: PayoutMethod;
  paidOn: string;
}): Payslip {
  const { shifts } = params;
  const hours = sumHours(shifts);
  const amount = sumAmount(shifts);
  const lastDate = [...shifts.map((s) => s.date)].sort().pop()!;
  return {
    id: params.id,
    workerId: params.workerId,
    receipt: params.receipt,
    paidOn: params.paidOn,
    period: periodLabel(shifts.map((s) => s.date)),
    year: lastDate.slice(0, 4),
    month: MONTHS_UK[Number(lastDate.slice(5, 7)) - 1],
    hours,
    rate: hours > 0 ? Math.round((amount / hours) * 100) / 100 : 0,
    bonus: 0,
    deduction: 0,
    method: params.method,
    shiftIds: shifts.map((s) => s.id),
  };
}
