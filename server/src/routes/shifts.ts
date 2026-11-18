import { Router } from 'express';
import { calcHours, canTransition, todayIso, validateShift } from '@/shared/lib/payroll';
import type { AuthUser, DutyUpdate, NewShift, Shift, ShiftUpdate, TeamMember } from '@/types';
import { currentUser, requireAuth } from '../auth';
import { db } from '../db';
import { fail } from '../http';

const DUTY_STATUSES: DutyUpdate['status'][] = ['active', 'break', 'finished'];

export function scopeShifts(user: AuthUser, shifts: Shift[]) {
  if (user.role === 'employee') return shifts.filter((s) => s.workerId === user.memberId);
  if (user.role === 'admin') return shifts.filter((s) => s.venue === user.venue);
  return shifts;
}

const sortShifts = (shifts: Shift[]) =>
  [...shifts].sort(
    (a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt)
  );

function createShift(worker: TeamMember, input: NewShift, source: Shift['source']) {
  const shift: Shift = {
    id: db.nextId('s'),
    workerId: worker.id,
    workerName: worker.name,
    role: worker.role,
    venue: worker.venue,
    date: input.date,
    start: input.start,
    end: input.end,
    breakMinutes: input.breakMinutes,
    hours: calcHours(input.start, input.end, input.breakMinutes),
    rate: worker.rate,
    status: source === 'admin' ? 'confirmed' : 'pending',
    source,
    templateId: input.templateId,
    note: input.note?.trim() || undefined,
    createdAt: new Date().toISOString(),
  };
  db.data.shifts.push(shift);
  return shift;
}

export const shiftsRouter = Router();

shiftsRouter.get('/', requireAuth(), (req, res) => {
  const status = typeof req.query.status === 'string' ? req.query.status : '';
  const venue = typeof req.query.venue === 'string' ? req.query.venue : '';
  let shifts = scopeShifts(currentUser(req), db.data.shifts);
  if (status) shifts = shifts.filter((s) => status.split(',').includes(s.status));
  if (venue) shifts = shifts.filter((s) => s.venue === venue);
  res.json(sortShifts(shifts));
});

shiftsRouter.post('/', requireAuth(['employee', 'admin']), (req, res) => {
  const user = currentUser(req);
  const body = (req.body ?? {}) as NewShift;
  const worker = db.member(user.role === 'employee' ? user.memberId : body.workerId);
  if (!worker) return fail(422, 'Оберіть працівника');
  if (!worker.active) fail(422, 'Працівника деактивовано — зміну подати не можна');
  if (user.role === 'admin' && worker.venue !== user.venue) {
    fail(403, 'Працівник належить до іншого закладу');
  }
  const input = { ...body, breakMinutes: Number(body.breakMinutes) || 0 };
  const error = validateShift(
    input,
    db.data.shifts.filter((s) => s.workerId === worker.id)
  );
  if (error) fail(422, error);
  const shift = createShift(worker, input, user.role === 'admin' ? 'admin' : 'employee');
  db.commit();
  res.status(201).json(shift);
});

shiftsRouter.patch('/:id', requireAuth(['admin', 'owner']), (req, res) => {
  const body = (req.body ?? {}) as ShiftUpdate;
  const shift = scopeShifts(currentUser(req), db.data.shifts).find((s) => s.id === req.params.id);
  if (!shift) return fail(404, 'Зміну не знайдено');
  if (shift.status === 'paid') fail(409, 'Виплачену зміну змінити не можна');
  if (body.status && !canTransition(shift.status, body.status)) {
    fail(409, 'Недопустима зміна статусу');
  }
  if (body.status === 'rejected' && !body.adminReason?.trim()) {
    fail(422, 'Вкажіть причину відхилення');
  }
  const start = body.start ?? shift.start;
  const end = body.end ?? shift.end;
  const breakMinutes = body.breakMinutes ?? shift.breakMinutes;
  Object.assign(shift, {
    start,
    end,
    breakMinutes,
    hours: calcHours(start, end, breakMinutes),
    status: body.status ?? shift.status,
    adminReason: body.adminReason?.trim() || shift.adminReason,
  });
  db.commit();
  res.json(shift);
});

export const dutyRouter = Router();

dutyRouter.get('/', requireAuth(['admin']), (req, res) => {
  const user = currentUser(req);
  res.json(db.data.duty.filter((d) => db.member(d.workerId)?.venue === user.venue));
});

dutyRouter.patch('/:id', requireAuth(['admin']), (req, res) => {
  const body = (req.body ?? {}) as DutyUpdate;
  const user = currentUser(req);
  const record = db.data.duty.find(
    (d) => d.id === req.params.id && db.member(d.workerId)?.venue === user.venue
  );
  if (!record) return fail(404, 'Запис не знайдено');
  if (record.status === 'finished') fail(409, 'Зміну вже завершено');
  if (!DUTY_STATUSES.includes(body.status)) fail(422, 'Невідомий статус');
  record.status = body.status;
  if (body.status === 'finished') {
    const minutes =
      body.workedMinutes ?? Math.round((Date.now() - Date.parse(record.startedAt)) / 60_000);
    record.workedMinutes = minutes;
    const worker = db.member(record.workerId);
    const started = new Date(record.startedAt);
    const endDate = new Date(started.getTime() + minutes * 60_000);
    const date = todayIso();
    const exists = db.data.shifts.some((s) => s.workerId === record.workerId && s.date === date);
    if (worker && minutes >= 60 && !exists) {
      createShift(
        worker,
        {
          date,
          start: started.toTimeString().slice(0, 5),
          end: endDate.toTimeString().slice(0, 5),
          breakMinutes: 0,
          note: 'Закрито адміністратором',
        },
        'admin'
      );
    }
  }
  db.commit();
  res.json(record);
});
