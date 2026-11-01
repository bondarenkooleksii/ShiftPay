import { seedAccounts, type SeedAccount } from '@/mocks/users';
import { seedTeam } from '@/mocks/team';
import { seedVenues } from '@/mocks/venues';
import { seedShifts, seedTemplates } from '@/mocks/shifts';
import { seedPayslips } from '@/mocks/payslips';
import { seedDutyWorkers } from '@/mocks/workers';
import { seedAdminSettings, seedOwnerSettings, seedProfiles } from '@/mocks/settings';
import type {
  AdminSettings,
  DutyWorker,
  EmployeeProfile,
  OwnerSettings,
  Payslip,
  Shift,
  ShiftTemplate,
  TeamMember,
  Venue,
} from '@/types';

const STORAGE_KEY = 'shiftpay.mockdb.v1';

export interface MockDb {
  accounts: SeedAccount[];
  sessions: Record<string, string>;
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

const createSeed = (): MockDb =>
  structuredClone({
    accounts: seedAccounts,
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

function load(): MockDb {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as MockDb;
  } catch {
    return createSeed();
  }
  return createSeed();
}

let state = load();

export const db = {
  get data() {
    return state;
  },
  commit() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      return;
    }
  },
  reset() {
    const sessions = state.sessions;
    state = createSeed();
    state.sessions = sessions;
    db.commit();
  },
  nextId(prefix: string) {
    state.seq += 1;
    return `${prefix}${Date.now().toString(36)}${state.seq}`;
  },
};
