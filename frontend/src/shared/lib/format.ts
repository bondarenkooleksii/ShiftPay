import { MONTHS_UK } from './payroll';

export const formatUAH = (value: number) =>
  `${value.toLocaleString('uk-UA', { maximumFractionDigits: 0 })} ₴`;

export const getInitials = (name: string) =>
  name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2);

export const payslipNet = (p: { hours: number; rate: number; bonus: number; deduction: number }) =>
  p.hours * p.rate + p.bonus - p.deduction;

export const formatDate = (iso: string) => iso.split('-').reverse().join('.');

export const formatHours = (hours: number) => `${hours.toFixed(1)} год`;

export const monthLabel = (iso: string) =>
  `${MONTHS_UK[Number(iso.slice(5, 7)) - 1]} ${iso.slice(0, 4)}`;
