import fs from 'node:fs';
import path from 'node:path';
import bcrypt from 'bcryptjs';
import { seedAccounts } from './seed/users';
import { seedTeam } from './seed/team';
import { seedVenues } from './seed/venues';
import { seedShifts, seedTemplates } from './seed/shifts';
import { seedPayslips } from './seed/payslips';
import { seedDutyWorkers } from './seed/workers';
import { seedAdminSettings, seedOwnerSettings, seedProfiles } from './seed/settings';
import type {
  AdminSettings,
  AuthUser,
  DutyWorker,
  EmployeeProfile,
  OwnerSettings,
  Payslip,
  Shift,
  ShiftTemplate,
  TeamMember,
  Venue,
} from './types';
import { config } from './config';

export interface Account extends AuthUser {
  passwordHash: string;
}

export interface Session {
  userId: string;
  expiresAt: number;
}

export interface Database {
  accounts: Account[];
  sessions: Record<string, Session>;
  team: TeamMember[];
  venues: Venue[];
  shifts: Shift[];
  templates: ShiftTemplate[];
  payslips: Payslip[];
  duty: DutyWorker[];
  ownerSettings: OwnerSettings;
  adminSettings: AdminSettings;
  profiles: Record<string, EmployeeProfile>;
  seq: number;
}

function createSeed(): Database {
  const accounts = seedAccounts.map(({ password, phone: _phone, ...user }) => ({
    ...user,
    passwordHash: bcrypt.hashSync(password, 10),
  }));
  return structuredClone({
    accounts,
    sessions: {},
    team: seedTeam,
    venues: seedVenues,
    shifts: seedShifts,
    templates: seedTemplates,
    payslips: seedPayslips,
    duty: seedDutyWorkers(),
    ownerSettings: seedOwnerSettings,
    adminSettings: seedAdminSettings,
    profiles: seedProfiles,
    seq: 1,
  });
}

function load(): Database {
  try {
    return JSON.parse(fs.readFileSync(config.dbFile, 'utf8')) as Database;
  } catch {
    const seed = createSeed();
    save(seed);
    return seed;
  }
}

function save(data: Database) {
  fs.mkdirSync(path.dirname(config.dbFile), { recursive: true });
  const tmp = `${config.dbFile}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
  fs.renameSync(tmp, config.dbFile);
}

let state = load();

export const db = {
  get data() {
    return state;
  },
  commit() {
    save(state);
  },
  reset() {
    const sessions = state.sessions;
    state = createSeed();
    state.sessions = sessions;
    save(state);
  },
  nextId(prefix: string) {
    state.seq += 1;
    return `${prefix}${Date.now().toString(36)}${state.seq}`;
  },
  member(id?: string) {
    return state.team.find((m) => m.id === id);
  },
};
