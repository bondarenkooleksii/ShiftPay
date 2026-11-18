export type PayoutMethod = 'iban' | 'cash';

export interface Payslip {
  id: string;
  workerId: string;
  receipt: string;
  paidOn: string;
  period: string;
  year: string;
  month: string;
  hours: number;
  rate: number;
  bonus: number;
  deduction: number;
  method: PayoutMethod;
  shiftIds: string[];
  confirmedAt?: string;
}

export interface PayoutRequest {
  venue?: string;
  method: PayoutMethod;
}

export interface PayoutResult {
  total: number;
  shiftCount: number;
  payslips: Payslip[];
}
