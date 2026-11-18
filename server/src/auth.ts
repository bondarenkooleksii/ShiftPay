import crypto from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import type { AuthUser, UserRole } from '@/types';
import { config } from './config';
import { db, type Account } from './db';
import { HttpError } from './http';

interface TokenPayload {
  sub: string;
  jti: string;
  role: UserRole;
  exp: number;
}

declare module 'express-serve-static-core' {
  interface Request {
    user?: AuthUser;
    tokenId?: string;
  }
}

export function toPublicUser(account: Account): AuthUser {
  const { passwordHash: _passwordHash, ...user } = account;
  const worker = db.member(account.memberId);
  return worker ? { ...user, name: worker.name, venue: worker.venue, rate: worker.rate } : user;
}

export function issueToken(account: Account) {
  const jti = crypto.randomUUID();
  const token = jwt.sign({ role: account.role }, config.jwtSecret, {
    subject: account.id,
    jwtid: jti,
    expiresIn: config.tokenTtlSeconds,
  });
  const { exp } = jwt.decode(token) as TokenPayload;
  db.data.sessions[jti] = { userId: account.id, expiresAt: exp * 1000 };
  pruneSessions();
  db.commit();
  return token;
}

export function revokeToken(jti: string) {
  delete db.data.sessions[jti];
  db.commit();
}

function pruneSessions() {
  const now = Date.now();
  for (const [jti, session] of Object.entries(db.data.sessions)) {
    if (session.expiresAt < now) delete db.data.sessions[jti];
  }
}

function readToken(req: Request) {
  const header = req.get('Authorization') ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) return null;
  try {
    return jwt.verify(token, config.jwtSecret) as TokenPayload;
  } catch {
    return null;
  }
}

export function requireAuth(roles?: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const payload = readToken(req);
    const session = payload ? db.data.sessions[payload.jti] : undefined;
    const account = session && db.data.accounts.find((a) => a.id === session.userId);
    if (!payload || !account) {
      return next(new HttpError(401, 'Сесія завершилась, увійдіть знову'));
    }
    if (roles && !roles.includes(account.role)) {
      return next(new HttpError(403, 'Недостатньо прав для цієї дії'));
    }
    req.user = toPublicUser(account);
    req.tokenId = payload.jti;
    next();
  };
}

export const currentUser = (req: Request) => req.user as AuthUser;
