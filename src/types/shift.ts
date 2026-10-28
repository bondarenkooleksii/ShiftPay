export interface EmployeeShift {
  id: string;
  date: string;
  type: string;
  hours: number;
  amount: number;
  status: 'Підтверджено' | 'На модерації';
}

export interface PayrollShift {
  id: string;
  date: string;
  worker: string;
  role: string;
  venue: string;
  hours: number;
  rate: number;
  status: 'Підтверджено' | 'Очікує' | 'Виплачено';
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
  name: string;
  role: string;
  scheduled: string;
  startedMinutesAgo: number;
  status: DutyStatus;
}

export interface AdjustmentRequest {
  id: string;
  worker: string;
  role: string;
  date: string;
  submittedStart: string;
  submittedEnd: string;
  submittedBreak: number;
  scheduledStart: string;
  scheduledEnd: string;
  scheduledBreak: number;
  workerNote: string;
  status: 'pending' | 'approved' | 'rejected' | 'clarify';
}
