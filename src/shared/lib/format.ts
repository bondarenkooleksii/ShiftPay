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
