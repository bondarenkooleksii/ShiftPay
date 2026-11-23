export type ShiftStatus = 'pending' | 'confirmed' | 'clarify' | 'rejected' | 'paid';

export interface Shift {
  id: string;
  workerId: string;
  workerName: string;
  role: string;
  venue: string;
  date: string;
  start: string;
  end: string;
  breakMinutes: number;
  hours: number;
  rate: number;
  status: ShiftStatus;
  source: 'employee' | 'admin';
  templateId?: string;
  note?: string;
  adminReason?: string;
  createdAt: string;
}

export interface NewShift {
  workerId?: string;
  date: string;
  start: string;
  end: string;
  breakMinutes: number;
  templateId?: string;
  note?: string;
}

export interface ShiftUpdate {
  status?: ShiftStatus;
  start?: string;
  end?: string;
  breakMinutes?: number;
  adminReason?: string;
}

export interface ShiftTemplate {
  id: string;
  name: string;
  start: string;
  end: string;
  breakMinutes: number;
}

export type DutyStatus = 'active' | 'break' | 'finished';

export interface DutyWorker {
  id: string;
  workerId: string;
  name: string;
  role: string;
  scheduled: string;
  startedAt: string;
  workedMinutes?: number;
  status: DutyStatus;
}

export interface DutyUpdate {
  status: DutyStatus;
  workedMinutes?: number;
}
