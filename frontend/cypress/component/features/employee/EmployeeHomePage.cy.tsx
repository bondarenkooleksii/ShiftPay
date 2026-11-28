import EmployeeHomePage from '../../../../src/features/employee/EmployeeHomePage/EmployeeHomePage';
import { db } from '../../../../src/mocks/server/db';
import { formatUAH, payslipNet } from '../../../../src/shared/lib/format';
import type { Shift } from '../../../../src/types';
import { expectCall, failApi, mountWithApp } from '../../../support/mount';

const extraShift = (patch: Partial<Shift>): Shift => ({
  id: `x${Math.random()}`,
  workerId: 't1',
  workerName: 'Бондаренко Олексій',
  role: 'Бариста',
  venue: 'Coffee Corner • Центр',
  date: '2026-09-18',
  start: '10:00',
  end: '14:00',
  breakMinutes: 0,
  hours: 4,
  rate: 90,
  status: 'rejected',
  source: 'employee',
  createdAt: '2026-09-25T09:00:00.000Z',
  ...patch,
});

const mountHome = (onOpen = cy.stub()) =>
  mountWithApp(<EmployeeHomePage onOpenSubmitShiftModal={onOpen} />, { role: 'employee' });

describe('EmployeeHomePage', () => {
  it('shows balance, hours, rate and the shifts of the month', () => {
    mountHome();
    cy.contains('h1', 'Особистий кабінет');
    cy.contains('Coffee Corner • Центр');
    cy.contains('Поточний баланс')
      .parents('[class*="metricCard"]')
      .should('contain', formatUAH(2070));
    cy.contains('2 підтв. змін чекають виплати');
    cy.contains(`(На модерації: ${formatUAH(720)})`);
    cy.contains('Відпрацьований час')
      .parents('[class*="metricCard"]')
      .should('contain', '23.0 год')
      .and('contain', '14% плану');
    cy.contains('Моя ставка').parents('[class*="metricCard"]').should('contain', '90 ₴');
    cy.contains('h2', 'Мої зміни • Вересень 2026');
    cy.get('tbody tr').should('have.length', 3);
    cy.contains('tbody tr', '24.09.2026')
      .should('contain', 'Денна зміна (08:00 – 20:00, перерва 30 хв)')
      .and('contain', 'Підтверджено');
    cy.contains('Усього змін: 3');
  });

  it('filters shifts by stage and resets the filter', () => {
    db.data.shifts.push(extraShift({ adminReason: 'Зміну не погоджено' }));
    mountHome();
    cy.get('tbody tr').should('have.length', 4);
    cy.contains('tbody tr', '18.09.2026')
      .should('contain', 'Коментар адміністратора: Зміну не погоджено')
      .and('contain', '10:00 – 14:00');
    cy.contains('section[aria-label^="Шлях ваших змін"] button', 'На перевірці').click();
    cy.get('tbody tr').should('have.length', 1);
    cy.contains('Показано лише зміни зі статусом «На перевірці»');
    cy.contains('button', 'Показати всі (4)').click();
    cy.get('tbody tr').should('have.length', 4);
    cy.contains('section[aria-label^="Шлях ваших змін"] button', 'Виплачено').click();
    cy.contains('немає змін зі статусом «Виплачено»');
    cy.contains('button', 'Показати всі зміни').click();
    cy.get('tbody tr').should('have.length', 4);
  });

  it('switches the month and offers to submit a shift for an empty month', () => {
    db.data.shifts.push(extraShift({ date: '2026-08-10', status: 'paid' }));
    const onOpen = cy.stub().as('open');
    mountHome(onOpen);
    cy.get('[aria-label="Оберіть розрахунковий місяць"]').click();
    cy.contains('[role="option"]', 'Серпень 2026').click();
    cy.contains('h2', 'Мої зміни • Серпень 2026');
    cy.get('tbody tr').should('have.length', 1).and('contain', 'Виплачено');
    cy.contains('button', 'Подати зміну').click();
    cy.get('@open').should('have.been.calledOnce');
  });

  it('shows the empty state when the worker has no shifts', () => {
    db.data.shifts = db.data.shifts.filter((s) => s.workerId !== 't1');
    db.data.payslips = [];
    const onOpen = cy.stub().as('open');
    mountHome(onOpen);
    cy.contains('ви ще не подавали змін');
    cy.contains('button', '+ Подати зміну').click();
    cy.get('@open').should('have.been.calledOnce');
    cy.contains('Остання виплата').should('not.exist');
  });

  it('opens the receipt of the unconfirmed payout and confirms it', () => {
    mountHome();
    cy.contains('p', 'Власник надіслав виплату')
      .find('strong')
      .should('have.text', formatUAH(payslipNet(db.data.payslips[0])));
    cy.contains('button', 'Переглянути квитанцію').click();
    cy.get('[role="dialog"]')
      .should('contain', 'Платіжне доручення №SP-2026-0918')
      .and('contain', 'IBAN: UA•••6001');
    cy.get('button[aria-label="Закрити квитанцію"]').click();
    cy.get('[role="dialog"]').should('not.exist');
    cy.contains('button', 'Гроші прийшли').click();
    expectCall('PATCH', '/api/payslips/ps1/confirm');
    cy.contains('Отримання виплати').should('contain', 'підтверджено');
    cy.contains('Остання виплата').parent().should('contain', '16.09.2026');
    cy.contains('Отримано');
    cy.contains('button', 'Закрити').click();
    cy.contains('Отримання виплати').should('not.exist');
  });

  it('shows a cash receipt from the archive block', () => {
    db.data.payslips = db.data.payslips.filter((p) => p.method === 'cash');
    mountHome();
    cy.contains('Власник надіслав виплату').should('not.exist');
    cy.contains('Оплачено').should('not.exist');
    cy.contains('button', 'Переглянути чек').click();
    cy.get('[role="dialog"]').should('contain', 'готівка');
    cy.get('[role="dialog"]').contains('button', 'Закрити').click();
    cy.get('[role="dialog"]').should('not.exist');
  });

  it('shows the error when confirming fails', () => {
    failApi('PATCH', '/api/payslips', 'Не вдалося підтвердити', 500);
    mountHome();
    cy.contains('button', 'Гроші прийшли').click();
    cy.get('[role="alert"]').should('have.text', 'Не вдалося підтвердити');
  });

  it('shows the error state for shifts and retries', () => {
    failApi('GET', '/api/shifts', 'Сервер недоступний');
    mountHome();
    cy.get('[role="alert"]').should('contain', 'Сервер недоступний');
    cy.contains('button', 'Спробувати ще раз').click();
    cy.get('tbody tr').should('have.length', 3);
  });

  it('renders the masked iban placeholder without a profile', () => {
    delete db.data.profiles.t1;
    mountHome();
    cy.contains('button', 'Переглянути квитанцію').click();
    cy.get('[role="dialog"]').should('contain', 'IBAN: —');
  });
});
