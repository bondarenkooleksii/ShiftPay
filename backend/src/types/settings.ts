export interface OwnerSettings {
  legalName: string;
  taxId: string;
  currency: string;
  frequency: string;
  cutoff: string;
  notify: { telegram: boolean; email: boolean; shiftChanges: boolean };
}

export interface AdminSettings {
  graceMinutes: number;
}

export interface EmployeeProfile {
  fullName: string;
  phone: string;
  telegram: string;
  iban: string;
  notify: { approved: boolean; payout: boolean };
}

export interface PasswordChange {
  currentPassword: string;
  newPassword: string;
}

export interface Analytics {
  totalHours: number;
  laborCost: number;
  shiftCount: number;
  venueLaborCost: { venue: string; amount: number }[];
  weeklyHours: { day: string; hours: number }[];
  peakHours: { hour: string; load: number }[];
}
