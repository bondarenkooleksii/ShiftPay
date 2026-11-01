export interface Payslip {
  id: string;
  receipt: string;
  paidOn: string;
  period: string;
  year: string;
  month: string;
  hours: number;
  rate: number;
  bonus: number;
  deduction: number;
}
