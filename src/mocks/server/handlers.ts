import { delay, http, HttpResponse } from 'msw';
import { peakHours } from '@/mocks/analytics';
import {
  buildPayslip,
  calcHours,
  canTransition,
  isPayable,
  shiftAmount,
  sumHours,
  todayIso,
  validateShift,
} from '@/shared/lib/payroll';
import type {
  AdminSettings,
  AuthUser,
  DutyUpdate,
  EmployeeProfile,
  LoginRequest,
  NewShift,
  OwnerSettings,
  PasswordChange,
  PayoutRequest,
  Shift,
  ShiftTemplate,
  ShiftUpdate,
  TeamMember,
  UserRole,
  Venue,
} from '@/types';
import { db } from './db';

const API = '/api';
const LATENCY = 250;

type Params = Record<string, string | readonly string[] | undefined>;
interface Ctx<B> {
  request: Request;
  params: Params;
  user: AuthUser;
  body: B;
}

const fail = (status: number, message: string) => HttpResponse.json({ message }, { status });

const ROLE_NAMES: Record<UserRole, string> = {
  owner: 'Власник',
  admin: 'Адміністратор',
  employee: 'Працівник',
};

function toPublicUser(account: (typeof db.data.accounts)[number]): AuthUser {
  const { password: _password, phone: _phone, ...user } = account;
  const worker = db.data.team.find((m) => m.id === account.memberId);
  return worker ? { ...user, name: worker.name, venue: worker.venue, rate: worker.rate } : user;
}

function currentUser(request: Request): AuthUser | null {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  const userId = token ? db.data.sessions[token] : undefined;
  const account = db.data.accounts.find((a) => a.id === userId);
  return account ? toPublicUser(account) : null;
}

function guard<B = undefined>(
  roles: UserRole[] | null,
  resolver: (ctx: Ctx<B>) => Response | Promise<Response>
) {
  return async ({ request, params }: { request: Request; params: Params }) => {
    await delay(LATENCY);
    const user = currentUser(request);
    if (!user) return fail(401, 'Сесія завершилась, увійдіть знову');
    if (roles && !roles.includes(user.role)) return fail(403, 'Недостатньо прав для цієї дії');
    const body = ['POST', 'PUT', 'PATCH'].includes(request.method)
      ? ((await request.json().catch(() => ({}))) as B)
      : (undefined as B);
    return resolver({ request, params, user, body });
  };
}

const member = (id?: string) => db.data.team.find((m) => m.id === id);

function scopeShifts(user: AuthUser, shifts: Shift[]) {
  if (user.role === 'employee') return shifts.filter((s) => s.workerId === user.memberId);
  if (user.role === 'admin') return shifts.filter((s) => s.venue === user.venue);
  return shifts;
}

const sortShifts = (shifts: Shift[]) =>
  [...shifts].sort(
    (a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt)
  );

function venuesWithStaff(): Venue[] {
  return db.data.venues.map((v) => ({
    ...v,
    staffCount: db.data.team.filter((m) => m.active && m.venue === v.name).length,
  }));
}

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

function periodFilter(period: string | null) {
  if (!period || period === 'Вересень 2026') return (s: Shift) => s.date.startsWith('2026-09');
  const days = period === 'Квартал' ? 90 : 30;
  const from = new Date(Date.now() - days * 86_400_000).toISOString().slice(0, 10);
  return (s: Shift) => s.date >= from;
}

const WEEKDAYS = ['Нд', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

export const handlers = [
  http.post(`${API}/auth/login`, async ({ request }) => {
    await delay(LATENCY * 2);
    const { email, password, role } = (await request.json()) as LoginRequest;
    const login = email.trim().toLowerCase();
    const digits = login.replace(/\D/g, '');
    const account = db.data.accounts.find(
      (a) =>
        a.email === login ||
        (digits.length >= 9 && member(a.memberId)?.phone.replace(/\D/g, '').endsWith(digits))
    );
    if (!account || account.password !== password) {
      return fail(401, 'Невірний email/телефон або пароль');
    }
    if (account.role !== role) {
      return fail(403, `Цей акаунт не має ролі «${ROLE_NAMES[role]}»`);
    }
    if (account.memberId && member(account.memberId)?.active === false) {
      return fail(403, 'Акаунт деактивовано власником закладу');
    }
    const token = `mock.${account.id}.${crypto.randomUUID()}`;
    db.data.sessions[token] = account.id;
    db.commit();
    return HttpResponse.json({ token, user: toPublicUser(account) });
  }),

  http.get(
    `${API}/auth/me`,
    guard(null, ({ user }) => HttpResponse.json(user))
  ),

  http.post(
    `${API}/auth/logout`,
    guard(null, ({ request }) => {
      const token = request.headers.get('Authorization')?.replace('Bearer ', '') ?? '';
      delete db.data.sessions[token];
      db.commit();
      return new HttpResponse(null, { status: 204 });
    })
  ),

  http.post(
    `${API}/auth/password`,
    guard<PasswordChange>(null, ({ user, body }) => {
      const account = db.data.accounts.find((a) => a.id === user.id)!;
      if (account.password !== body.currentPassword) return fail(422, 'Поточний пароль невірний');
      if (body.newPassword.length < 8) return fail(422, 'Новий пароль має містити від 8 символів');
      account.password = body.newPassword;
      db.commit();
      return new HttpResponse(null, { status: 204 });
    })
  ),

  http.get(
    `${API}/shifts`,
    guard(null, ({ request, user }) => {
      const url = new URL(request.url);
      const status = url.searchParams.get('status');
      const venue = url.searchParams.get('venue');
      let shifts = scopeShifts(user, db.data.shifts);
      if (status) shifts = shifts.filter((s) => status.split(',').includes(s.status));
      if (venue) shifts = shifts.filter((s) => s.venue === venue);
      return HttpResponse.json(sortShifts(shifts));
    })
  ),

  http.post(
    `${API}/shifts`,
    guard<NewShift>(['employee', 'admin'], ({ user, body }) => {
      const workerId = user.role === 'employee' ? user.memberId : body.workerId;
      const worker = member(workerId);
      if (!worker) return fail(422, 'Оберіть працівника');
      if (!worker.active) return fail(422, 'Працівника деактивовано — зміну подати не можна');
      if (user.role === 'admin' && worker.venue !== user.venue) {
        return fail(403, 'Працівник належить до іншого закладу');
      }
      const own = db.data.shifts.filter((s) => s.workerId === worker.id);
      const error = validateShift(body, own);
      if (error) return fail(422, error);
      const shift = createShift(worker, body, user.role === 'admin' ? 'admin' : 'employee');
      db.commit();
      return HttpResponse.json(shift, { status: 201 });
    })
  ),

  http.patch(
    `${API}/shifts/:id`,
    guard<ShiftUpdate>(['admin', 'owner'], ({ params, user, body }) => {
      const shift = scopeShifts(user, db.data.shifts).find((s) => s.id === params.id);
      if (!shift) return fail(404, 'Зміну не знайдено');
      if (shift.status === 'paid') return fail(409, 'Виплачену зміну змінити не можна');
      if (body.status && !canTransition(shift.status, body.status)) {
        return fail(409, 'Недопустима зміна статусу');
      }
      if (body.status === 'rejected' && !body.adminReason?.trim()) {
        return fail(422, 'Вкажіть причину відхилення');
      }
      Object.assign(shift, {
        start: body.start ?? shift.start,
        end: body.end ?? shift.end,
        breakMinutes: body.breakMinutes ?? shift.breakMinutes,
        status: body.status ?? shift.status,
        adminReason: body.adminReason?.trim() || shift.adminReason,
      });
      shift.hours = calcHours(shift.start, shift.end, shift.breakMinutes);
      db.commit();
      return HttpResponse.json(shift);
    })
  ),

  http.post(
    `${API}/payouts`,
    guard<PayoutRequest>(['owner'], ({ body }) => {
      const payable = db.data.shifts.filter(
        (s) => isPayable(s) && (!body.venue || s.venue === body.venue)
      );
      if (payable.length === 0) return fail(422, 'Немає підтверджених змін для виплати');
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
      return HttpResponse.json({
        total: payable.reduce((sum, s) => sum + shiftAmount(s), 0),
        shiftCount: payable.length,
        payslips,
      });
    })
  ),

  http.get(
    `${API}/payslips`,
    guard(null, ({ user }) => {
      const list =
        user.role === 'employee'
          ? db.data.payslips.filter((p) => p.workerId === user.memberId)
          : db.data.payslips;
      return HttpResponse.json(list);
    })
  ),

  http.patch(
    `${API}/payslips/:id/confirm`,
    guard(['employee'], ({ params, user }) => {
      const payslip = db.data.payslips.find(
        (p) => p.id === params.id && p.workerId === user.memberId
      );
      if (!payslip) return fail(404, 'Чек не знайдено');
      payslip.confirmedAt ??= new Date().toISOString();
      db.commit();
      return HttpResponse.json(payslip);
    })
  ),

  http.get(
    `${API}/team`,
    guard(['owner', 'admin'], ({ user }) => {
      const team =
        user.role === 'admin' ? db.data.team.filter((m) => m.venue === user.venue) : db.data.team;
      const safe = user.role === 'admin' ? team.map((m) => ({ ...m, rate: 0 })) : team;
      return HttpResponse.json(safe);
    })
  ),

  http.post(
    `${API}/team`,
    guard<Omit<TeamMember, 'id' | 'active'>>(['owner'], ({ body }) => {
      if (!body.name?.trim()) return fail(422, 'Вкажіть імʼя працівника');
      if (!(body.rate > 0)) return fail(422, 'Ставка має бути більшою за 0');
      if (!db.data.venues.some((v) => v.name === body.venue)) return fail(422, 'Оберіть заклад');
      const created: TeamMember = {
        ...body,
        name: body.name.trim(),
        id: db.nextId('t'),
        active: true,
      };
      db.data.team.push(created);
      db.commit();
      return HttpResponse.json(
        { member: created, inviteLink: `https://shiftpay.ua/invite/${created.id}` },
        { status: 201 }
      );
    })
  ),

  http.patch(
    `${API}/team/:id`,
    guard<Partial<TeamMember>>(['owner'], ({ params, body }) => {
      const target = member(params.id as string);
      if (!target) return fail(404, 'Працівника не знайдено');
      if (body.rate !== undefined && !(body.rate > 0)) {
        return fail(422, 'Ставка має бути більшою за 0');
      }
      Object.assign(target, {
        rate: body.rate ?? target.rate,
        active: body.active ?? target.active,
        role: body.role ?? target.role,
        venue: body.venue ?? target.venue,
      });
      db.commit();
      return HttpResponse.json(target);
    })
  ),

  http.get(
    `${API}/venues`,
    guard(null, () => HttpResponse.json(venuesWithStaff()))
  ),

  http.post(
    `${API}/venues`,
    guard<Pick<Venue, 'name' | 'type' | 'address'>>(['owner'], ({ body }) => {
      const name = body.name?.trim();
      if (!name || !body.address?.trim()) return fail(422, 'Заповніть назву та адресу');
      if (db.data.venues.some((v) => v.name.toLowerCase() === name.toLowerCase())) {
        return fail(409, 'Заклад з такою назвою вже існує');
      }
      const venue: Venue = {
        id: db.nextId('v'),
        name,
        type: body.type,
        address: body.address.trim(),
        staffCount: 0,
      };
      db.data.venues.push(venue);
      db.commit();
      return HttpResponse.json(venue, { status: 201 });
    })
  ),

  http.get(
    `${API}/templates`,
    guard(null, () => HttpResponse.json(db.data.templates))
  ),

  http.post(
    `${API}/templates`,
    guard<Omit<ShiftTemplate, 'id'>>(['admin', 'owner'], ({ body }) => {
      if (!body.name?.trim()) return fail(422, 'Вкажіть назву шаблону');
      if (calcHours(body.start, body.end, body.breakMinutes) < 1) {
        return fail(422, 'Шаблон має тривати щонайменше 1 годину');
      }
      const template: ShiftTemplate = { ...body, name: body.name.trim(), id: db.nextId('tpl') };
      db.data.templates.push(template);
      db.commit();
      return HttpResponse.json(template, { status: 201 });
    })
  ),

  http.delete(
    `${API}/templates/:id`,
    guard(['admin', 'owner'], ({ params }) => {
      db.data.templates = db.data.templates.filter((t) => t.id !== params.id);
      db.commit();
      return new HttpResponse(null, { status: 204 });
    })
  ),

  http.get(
    `${API}/duty`,
    guard(['admin'], ({ user }) => {
      const duty = db.data.duty.filter((d) => member(d.workerId)?.venue === user.venue);
      return HttpResponse.json(duty);
    })
  ),

  http.patch(
    `${API}/duty/:id`,
    guard<DutyUpdate>(['admin'], ({ params, body }) => {
      const record = db.data.duty.find((d) => d.id === params.id);
      if (!record) return fail(404, 'Запис не знайдено');
      if (record.status === 'finished') return fail(409, 'Зміну вже завершено');
      record.status = body.status;
      if (body.status === 'finished') {
        const minutes =
          body.workedMinutes ?? Math.round((Date.now() - Date.parse(record.startedAt)) / 60_000);
        record.workedMinutes = minutes;
        const worker = member(record.workerId);
        const started = new Date(record.startedAt);
        const start = started.toTimeString().slice(0, 5);
        const endDate = new Date(started.getTime() + minutes * 60_000);
        const date = todayIso();
        const exists = db.data.shifts.some(
          (s) => s.workerId === record.workerId && s.date === date
        );
        if (worker && minutes >= 60 && !exists) {
          createShift(
            worker,
            {
              date,
              start,
              end: endDate.toTimeString().slice(0, 5),
              breakMinutes: 0,
              note: 'Закрито адміністратором',
            },
            'admin'
          );
        }
      }
      db.commit();
      return HttpResponse.json(record);
    })
  ),

  http.get(
    `${API}/settings/owner`,
    guard(['owner'], () => HttpResponse.json(db.data.ownerSettings))
  ),

  http.put(
    `${API}/settings/owner`,
    guard<OwnerSettings>(['owner'], ({ body }) => {
      if (!/^\d{10}$/.test(body.taxId)) return fail(422, 'ІПН має містити 10 цифр');
      db.data.ownerSettings = body;
      db.commit();
      return HttpResponse.json(body);
    })
  ),

  http.get(
    `${API}/settings/admin`,
    guard(['admin'], () => HttpResponse.json(db.data.adminSettings))
  ),

  http.put(
    `${API}/settings/admin`,
    guard<AdminSettings>(['admin'], ({ body }) => {
      if (body.graceMinutes < 0 || body.graceMinutes > 60) {
        return fail(422, 'Допуск має бути від 0 до 60 хвилин');
      }
      db.data.adminSettings = body;
      db.commit();
      return HttpResponse.json(body);
    })
  ),

  http.get(
    `${API}/profile`,
    guard(['employee'], ({ user }) => {
      const worker = member(user.memberId);
      const profile = db.data.profiles[user.memberId ?? ''] ?? {
        fullName: worker?.name ?? user.name,
        phone: worker?.phone ?? '',
        telegram: '',
        iban: '',
        notify: { approved: true, payout: true },
      };
      return HttpResponse.json(profile);
    })
  ),

  http.put(
    `${API}/profile`,
    guard<EmployeeProfile>(['employee'], ({ user, body }) => {
      const iban = body.iban.replace(/\s/g, '');
      if (iban && !/^UA\d{27}$/.test(iban)) return fail(422, 'Невірний формат IBAN');
      if (!body.fullName.trim()) return fail(422, 'Вкажіть ПІБ');
      db.data.profiles[user.memberId ?? user.id] = body;
      const worker = member(user.memberId);
      if (worker) {
        worker.name = body.fullName.trim();
        worker.phone = body.phone;
      }
      db.commit();
      return HttpResponse.json(body);
    })
  ),

  http.get(
    `${API}/analytics`,
    guard(['owner'], ({ request }) => {
      const period = new URL(request.url).searchParams.get('period');
      const inPeriod = periodFilter(period);
      const counted = db.data.shifts.filter(
        (s) => inPeriod(s) && (s.status === 'confirmed' || s.status === 'paid')
      );
      const venueLaborCost = db.data.venues.map((v) => ({
        venue: v.name,
        amount: counted
          .filter((s) => s.venue === v.name)
          .reduce((sum, s) => sum + shiftAmount(s), 0),
      }));
      const weeklyHours = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'].map((day) => ({
        day,
        hours: sumHours(counted.filter((s) => WEEKDAYS[new Date(s.date).getDay()] === day)),
      }));
      return HttpResponse.json({
        totalHours: sumHours(counted),
        laborCost: counted.reduce((sum, s) => sum + shiftAmount(s), 0),
        shiftCount: counted.length,
        venueLaborCost,
        weeklyHours,
        peakHours,
      });
    })
  ),

  http.post(
    `${API}/support/tickets`,
    guard<{ category: string; message: string }>(null, ({ body }) => {
      if (!body.message?.trim() || body.message.trim().length < 10) {
        return fail(422, 'Опишіть проблему детальніше (від 10 символів)');
      }
      return HttpResponse.json(
        { ticketId: `#SP-${Math.floor(1000 + Math.random() * 9000)}` },
        { status: 201 }
      );
    })
  ),

  http.post(`${API}/dev/reset`, () => {
    db.reset();
    return new HttpResponse(null, { status: 204 });
  }),
];
