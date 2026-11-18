import { Router } from 'express';
import type { AdminSettings, EmployeeProfile, OwnerSettings } from '@/types';
import { currentUser, requireAuth } from '../auth';
import { db } from '../db';
import { fail } from '../http';

export const settingsRouter = Router();

settingsRouter.get('/owner', requireAuth(['owner']), (_req, res) => {
  res.json(db.data.ownerSettings);
});

settingsRouter.put('/owner', requireAuth(['owner']), (req, res) => {
  const body = (req.body ?? {}) as OwnerSettings;
  if (!/^\d{10}$/.test(body.taxId ?? '')) fail(422, 'ІПН має містити 10 цифр');
  db.data.ownerSettings = body;
  db.commit();
  res.json(body);
});

settingsRouter.get('/admin', requireAuth(['admin']), (_req, res) => {
  res.json(db.data.adminSettings);
});

settingsRouter.put('/admin', requireAuth(['admin']), (req, res) => {
  const body = (req.body ?? {}) as AdminSettings;
  if (!(body.graceMinutes >= 0 && body.graceMinutes <= 60)) {
    fail(422, 'Допуск має бути від 0 до 60 хвилин');
  }
  db.data.adminSettings = body;
  db.commit();
  res.json(body);
});

export const profileRouter = Router();

profileRouter.get('/', requireAuth(['employee']), (req, res) => {
  const user = currentUser(req);
  const worker = db.member(user.memberId);
  res.json(
    db.data.profiles[user.memberId ?? ''] ?? {
      fullName: worker?.name ?? user.name,
      phone: worker?.phone ?? '',
      telegram: '',
      iban: '',
      notify: { approved: true, payout: true },
    }
  );
});

profileRouter.put('/', requireAuth(['employee']), (req, res) => {
  const user = currentUser(req);
  const body = (req.body ?? {}) as EmployeeProfile;
  const iban = (body.iban ?? '').replace(/\s/g, '');
  if (iban && !/^UA\d{27}$/.test(iban)) fail(422, 'Невірний формат IBAN');
  if (!body.fullName?.trim()) fail(422, 'Вкажіть ПІБ');
  db.data.profiles[user.memberId ?? user.id] = body;
  const worker = db.member(user.memberId);
  if (worker) {
    worker.name = body.fullName.trim();
    worker.phone = body.phone;
  }
  db.commit();
  res.json(body);
});

export const supportRouter = Router();

supportRouter.post('/tickets', requireAuth(), (req, res) => {
  const message = String(req.body?.message ?? '').trim();
  if (message.length < 10) fail(422, 'Опишіть проблему детальніше (від 10 символів)');
  res.status(201).json({ ticketId: `#SP-${Math.floor(1000 + Math.random() * 9000)}` });
});
