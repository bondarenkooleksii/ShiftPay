import { Router } from 'express';
import { calcHours } from '../lib/payroll';
import type { ShiftTemplate, TeamMember, Venue } from '../types';
import { currentUser, requireAuth } from '../auth';
import { db } from '../db';
import { fail } from '../http';

export const teamRouter = Router();

teamRouter.get('/', requireAuth(['owner', 'admin']), (req, res) => {
  const user = currentUser(req);
  if (user.role === 'owner') return res.json(db.data.team);
  res.json(db.data.team.filter((m) => m.venue === user.venue).map((m) => ({ ...m, rate: 0 })));
});

teamRouter.post('/', requireAuth(['owner']), (req, res) => {
  const body = (req.body ?? {}) as Omit<TeamMember, 'id' | 'active'>;
  if (!body.name?.trim()) fail(422, 'Вкажіть імʼя працівника');
  if (!(Number(body.rate) > 0)) fail(422, 'Ставка має бути більшою за 0');
  if (!db.data.venues.some((v) => v.name === body.venue)) fail(422, 'Оберіть заклад');
  const created: TeamMember = {
    name: body.name.trim(),
    role: body.role,
    venue: body.venue,
    rate: Number(body.rate),
    phone: body.phone ?? '',
    id: db.nextId('t'),
    active: true,
  };
  db.data.team.push(created);
  db.commit();
  res.status(201).json({ member: created, inviteLink: `https://shiftpay.ua/invite/${created.id}` });
});

teamRouter.patch('/:id', requireAuth(['owner']), (req, res) => {
  const body = (req.body ?? {}) as Partial<TeamMember>;
  const target = db.member(String(req.params.id));
  if (!target) return fail(404, 'Працівника не знайдено');
  if (body.rate !== undefined && !(body.rate > 0)) fail(422, 'Ставка має бути більшою за 0');
  if (body.venue !== undefined && !db.data.venues.some((v) => v.name === body.venue)) {
    fail(422, 'Оберіть заклад');
  }
  Object.assign(target, {
    rate: body.rate ?? target.rate,
    active: body.active ?? target.active,
    role: body.role ?? target.role,
    venue: body.venue ?? target.venue,
  });
  db.commit();
  res.json(target);
});

export const venuesRouter = Router();

venuesRouter.get('/', requireAuth(), (_req, res) => {
  res.json(
    db.data.venues.map((v) => ({
      ...v,
      staffCount: db.data.team.filter((m) => m.active && m.venue === v.name).length,
    }))
  );
});

venuesRouter.post('/', requireAuth(['owner']), (req, res) => {
  const body = (req.body ?? {}) as Pick<Venue, 'name' | 'type' | 'address'>;
  const name = body.name?.trim();
  const address = body.address?.trim();
  if (!name || !address) return fail(422, 'Заповніть назву та адресу');
  if (db.data.venues.some((v) => v.name.toLowerCase() === name.toLowerCase())) {
    fail(409, 'Заклад з такою назвою вже існує');
  }
  const venue: Venue = { id: db.nextId('v'), name, type: body.type, address, staffCount: 0 };
  db.data.venues.push(venue);
  db.commit();
  res.status(201).json(venue);
});

export const templatesRouter = Router();

templatesRouter.get('/', requireAuth(), (_req, res) => {
  res.json(db.data.templates);
});

templatesRouter.post('/', requireAuth(['admin', 'owner']), (req, res) => {
  const body = (req.body ?? {}) as Omit<ShiftTemplate, 'id'>;
  if (!body.name?.trim()) fail(422, 'Вкажіть назву шаблону');
  if (!/^\d{2}:\d{2}$/.test(body.start ?? '') || !/^\d{2}:\d{2}$/.test(body.end ?? '')) {
    fail(422, 'Вкажіть час початку та завершення');
  }
  if (calcHours(body.start, body.end, Number(body.breakMinutes) || 0) < 1) {
    fail(422, 'Шаблон має тривати щонайменше 1 годину');
  }
  const template: ShiftTemplate = { ...body, name: body.name.trim(), id: db.nextId('tpl') };
  db.data.templates.push(template);
  db.commit();
  res.status(201).json(template);
});

templatesRouter.delete('/:id', requireAuth(['admin', 'owner']), (req, res) => {
  db.data.templates = db.data.templates.filter((t) => t.id !== req.params.id);
  db.commit();
  res.status(204).end();
});
