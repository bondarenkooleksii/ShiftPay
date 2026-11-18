import { Router } from 'express';
import bcrypt from 'bcryptjs';
import type { LoginRequest, PasswordChange, UserRole } from '@/types';
import { currentUser, issueToken, requireAuth, revokeToken, toPublicUser } from '../auth';
import { db } from '../db';
import { fail } from '../http';

const ROLE_NAMES: Record<UserRole, string> = {
  owner: 'Власник',
  admin: 'Адміністратор',
  employee: 'Працівник',
};

export const authRouter = Router();

authRouter.post('/login', async (req, res) => {
  const { email = '', password = '', role } = (req.body ?? {}) as Partial<LoginRequest>;
  if (!email.trim() || !password || !role) {
    return fail(422, 'Вкажіть email/телефон, пароль і роль');
  }
  const login = email.trim().toLowerCase();
  const digits = login.replace(/\D/g, '');
  const account = db.data.accounts.find(
    (a) =>
      a.email === login ||
      (digits.length >= 9 && db.member(a.memberId)?.phone.replace(/\D/g, '').endsWith(digits))
  );
  if (!account || !(await bcrypt.compare(password, account.passwordHash))) {
    return fail(401, 'Невірний email/телефон або пароль');
  }
  if (account.role !== role) fail(403, `Цей акаунт не має ролі «${ROLE_NAMES[role]}»`);
  if (account.memberId && db.member(account.memberId)?.active === false) {
    fail(403, 'Акаунт деактивовано власником закладу');
  }
  res.json({ token: issueToken(account), user: toPublicUser(account) });
});

authRouter.get('/me', requireAuth(), (req, res) => {
  res.json(currentUser(req));
});

authRouter.post('/logout', requireAuth(), (req, res) => {
  revokeToken(req.tokenId!);
  res.status(204).end();
});

authRouter.post('/password', requireAuth(), async (req, res) => {
  const { currentPassword = '', newPassword = '' } = (req.body ?? {}) as Partial<PasswordChange>;
  const account = db.data.accounts.find((a) => a.id === currentUser(req).id)!;
  if (!(await bcrypt.compare(currentPassword, account.passwordHash))) {
    fail(422, 'Поточний пароль невірний');
  }
  if (newPassword.length < 8) fail(422, 'Новий пароль має містити від 8 символів');
  account.passwordHash = await bcrypt.hash(newPassword, 10);
  for (const [jti, session] of Object.entries(db.data.sessions)) {
    if (session.userId === account.id && jti !== req.tokenId) delete db.data.sessions[jti];
  }
  db.commit();
  res.status(204).end();
});
