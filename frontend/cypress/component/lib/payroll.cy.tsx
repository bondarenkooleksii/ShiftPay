import {
  buildPayslip,
  calcHours,
  canTransition,
  periodLabel,
  shiftAmount,
  sumHours,
  unpaidBalance,
  validateShift,
} from '../../../src/shared/lib/payroll';
import {
  formatDate,
  formatHours,
  getInitials,
  monthLabel,
  payslipNet,
} from '../../../src/shared/lib/format';
import { seedShifts } from '../../../src/mocks/shifts';

const input = { date: '2026-09-10', start: '08:00', end: '16:00', breakMinutes: 0 };

describe('payroll rules', () => {
  it('calculates hours with breaks and overnight shifts', () => {
    expect(calcHours('08:00', '20:00', 30)).to.eq(11.5);
    expect(calcHours('22:00', '06:00', 0)).to.eq(8);
    expect(calcHours('10:00', '10:00', 0)).to.eq(24);
    expect(calcHours('10:00', '10:30', 60)).to.eq(0);
  });

  it('sums amounts, hours and the unpaid balance', () => {
    expect(shiftAmount({ hours: 7.5, rate: 95 })).to.eq(713);
    expect(sumHours([{ hours: 0.1 }, { hours: 0.2 }])).to.eq(0.3);
    const own = seedShifts.filter((s) => s.workerId === 't1');
    expect(unpaidBalance(own)).to.eq(2070);
  });

  it('validates a submitted shift', () => {
    expect(validateShift(input, [], '2026-09-30')).to.eq(null);
    expect(validateShift({ ...input, date: '10.09.2026' }, [], '2026-09-30')).to.eq(
      'Вкажіть коректну дату зміни'
    );
    expect(validateShift({ ...input, date: '2026-10-01' }, [], '2026-09-30')).to.eq(
      'Не можна подати зміну на майбутню дату'
    );
    expect(validateShift({ ...input, start: '8:00' }, [], '2026-09-30')).to.eq(
      'Вкажіть час початку та завершення'
    );
    expect(validateShift({ ...input, end: '' }, [], '2026-09-30')).to.eq(
      'Вкажіть час початку та завершення'
    );
    expect(validateShift({ ...input, end: '08:30' }, [], '2026-09-30')).to.eq(
      'Тривалість зміни має бути не менше 1 години'
    );
    expect(validateShift({ ...input, end: '07:00' }, [], '2026-09-30')).to.eq(
      'Тривалість зміни не може перевищувати 16 годин'
    );
    expect(validateShift(input, [{ date: '2026-09-10', status: 'pending' }], '2026-09-30')).to.eq(
      'Зміну на цю дату вже подано'
    );
    expect(validateShift(input, [{ date: '2026-09-10', status: 'rejected' }], '2026-09-30')).to.eq(
      null
    );
    expect(validateShift({ ...input, date: '2000-01-01' }, [])).to.eq(null);
  });

  it('allows only valid status transitions', () => {
    expect(canTransition('pending', 'confirmed')).to.eq(true);
    expect(canTransition('paid', 'paid')).to.eq(true);
    expect(canTransition('paid', 'pending')).to.eq(false);
    expect(canTransition('rejected', 'confirmed')).to.eq(false);
  });

  it('builds a payslip for paid shifts', () => {
    const shifts = seedShifts.filter((s) => s.workerId === 't1' && s.status === 'confirmed');
    const payslip = buildPayslip({
      id: 'p',
      receipt: 'SP-1',
      workerId: 't1',
      shifts,
      method: 'iban',
      paidOn: '30.09.2026',
    });
    expect(payslip.period).to.eq(periodLabel(['2026-09-24', '2026-09-22']));
    expect(payslip.period).to.eq('22.09 – 24.09.2026');
    expect(payslip.month).to.eq('Вересень');
    expect(payslip.hours).to.eq(23);
    expect(payslip.rate).to.eq(90);
    expect(payslip.shiftIds).to.deep.eq(['s1', 's2']);
    const empty = buildPayslip({
      id: 'p',
      receipt: 'SP-2',
      workerId: 't1',
      shifts: [{ ...shifts[0], hours: 0 }],
      method: 'cash',
      paidOn: '',
    });
    expect(empty.rate).to.eq(0);
  });
});

describe('format helpers', () => {
  it('formats dates, hours, months, initials and net payouts', () => {
    expect(formatDate('2026-09-24')).to.eq('24.09.2026');
    expect(formatHours(8)).to.eq('8.0 год');
    expect(monthLabel('2026-12-01')).to.eq('Грудень 2026');
    expect(getInitials('Бондаренко Олексій Русланович')).to.eq('БО');
    expect(payslipNet({ hours: 10, rate: 100, bonus: 50, deduction: 20 })).to.eq(1030);
  });
});
