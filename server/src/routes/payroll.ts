import { Router } from 'express';
import { peakHours } from '@/mocks/analytics';
import { buildPayslip, isPayable, shiftAmount, sumHours, todayIso } from '@/shared/lib/payroll';
import type { PayoutRequest, Shift } from '@/types';
import { currentUser, requireAuth } from '../auth';
import { db } from '../db';
import { fail } from '../http';

const WEEKDAYS = ['Нд', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

function periodFilter(period?: string) {
  if (!period || period === 'Вересень 2026') return (s: Shift) => s.date.startsWith('2026-09');
  const days = period === 'Квартал' ? 90 : 30;
  const from = new Date(Date.now() - days * 86_400_000).toISOString().slice(0, 10);
  return (s: Shift) => s.date >= from;
}

export const payoutsRouter = Router();

payoutsRouter.post('/', requireAuth(['owner']), (req, res) => {
  const body = (req.body ?? {}) as PayoutRequest;
  const payable = db.data.shifts.filter(
    (s) => isPayable(s) && (!body.venue || s.venue === body.venue)
  );
  if (payable.length === 0) fail(422, 'Немає підтверджених змін для виплати');
  const paidOn = todayIso().split('-').reverse().join('.');
  const byWorker = new Map<string, Shift[]>();
  payable.forEach((s) => byWorker.set(s.workerId, [...(byWorker.get(s.workerId) ?? []), s]));
  const payslips = [...byWorker.entries()].map(([workerId, shifts]) => {
    shifts.forEach((s) => (s.status = 'paid'));
    const number = String(db.data.payslips.length + 1).padStart(4, '0');
    return buildPayslip({
      id: db.nextId('ps'),
      receipt: `SP-${todayIso().slice(0, 4)}-${number}`,
      workerId,
      shifts,
      method: body.method,
      paidOn,
    });
  });
  db.data.payslips.unshift(...payslips);
  db.commit();
  res.json({
    total: payable.reduce((sum, s) => sum + shiftAmount(s), 0),
    shiftCount: payable.length,
    payslips,
  });
});

export const payslipsRouter = Router();

payslipsRouter.get('/', requireAuth(), (req, res) => {
  const user = currentUser(req);
  res.json(
    user.role === 'employee'
      ? db.data.payslips.filter((p) => p.workerId === user.memberId)
      : db.data.payslips
  );
});

payslipsRouter.patch('/:id/confirm', requireAuth(['employee']), (req, res) => {
  const user = currentUser(req);
  const payslip = db.data.payslips.find(
    (p) => p.id === req.params.id && p.workerId === user.memberId
  );
  if (!payslip) return fail(404, 'Чек не знайдено');
  payslip.confirmedAt ??= new Date().toISOString();
  db.commit();
  res.json(payslip);
});

export const analyticsRouter = Router();

analyticsRouter.get('/', requireAuth(['owner']), (req, res) => {
  const period = typeof req.query.period === 'string' ? req.query.period : undefined;
  const inPeriod = periodFilter(period);
  const counted = db.data.shifts.filter(
    (s) => inPeriod(s) && (s.status === 'confirmed' || s.status === 'paid')
  );
  res.json({
    totalHours: sumHours(counted),
    laborCost: counted.reduce((sum, s) => sum + shiftAmount(s), 0),
    shiftCount: counted.length,
    venueLaborCost: db.data.venues.map((v) => ({
      venue: v.name,
      amount: counted.filter((s) => s.venue === v.name).reduce((sum, s) => sum + shiftAmount(s), 0),
    })),
    weeklyHours: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'].map((day) => ({
      day,
      hours: sumHours(counted.filter((s) => WEEKDAYS[new Date(s.date).getDay()] === day)),
    })),
    peakHours,
  });
});
