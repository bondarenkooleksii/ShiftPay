import AdminShiftRegisterPage from '../../../../src/features/admin/AdminShiftRegisterPage/AdminShiftRegisterPage';
import { db } from '../../../../src/mocks/server/db';
import { expectCall, failApi, mountWithApp } from '../../../support/mount';

const mountPage = () => mountWithApp(<AdminShiftRegisterPage />, { role: 'admin' });
const stat = (label: string) => cy.contains('span', label).next();

describe('AdminShiftRegisterPage', () => {
  it('shows the journal of the latest day with stats', () => {
    mountPage();
    cy.contains('h1', 'Журнал робочих змін');
    cy.contains('Coffee Corner • Центр');
    cy.contains('Зміна активна • 3 на зміні');
    cy.contains('h3', 'Журнал змін за 24.09.2026');
    cy.get('tbody tr').should('have.length', 3);
    stat('Працівників за день').should('have.text', '3');
    stat('Зараховано годин за день').should('have.text', '19.5 год');
    cy.contains('tbody tr', 'Ткаченко Марія')
      .should('contain', '16:00 - 22:30')
      .and('contain', 'Залишилась на вечірнє прибирання');
    cy.contains('button', 'Всі (3)');
  });

  it('filters waiting shifts and confirms one', () => {
    mountPage();
    cy.contains('button', 'Потребують підтвердження').should('contain', '1').click();
    cy.get('tbody tr').should('have.length', 1);
    cy.contains('tbody tr', 'Ткаченко Марія').contains('button', 'Підтвердити').click();
    expectCall('PATCH', '/api/shifts/s6', { status: 'confirmed' });
    cy.contains('За цей день змін ще немає');
    cy.contains('button', 'Всі (3)').click();
    cy.contains('tbody tr', 'Ткаченко Марія').should('contain', 'Підтверджено');
  });

  it('calculates hours of the form and adds a shift for another day', () => {
    mountPage();
    cy.contains('span', 'Всього зараховано:').parent().next().should('have.text', '11.5 год');
    cy.get('button[aria-haspopup="dialog"]').click();
    cy.get('[aria-label="Вибір дати"] [class*="dayBtn"]')
      .not('[class*="dayOtherMonth"]')
      .contains(/^25$/)
      .click();
    cy.contains('h3', 'Журнал змін за 25.09.2026');
    cy.contains('За цей день змін ще немає');
    cy.get('[aria-label="Працівник"]').should('contain', 'Бондаренко Олексій (Бариста)').click();
    cy.contains('[role="option"]', 'Шевченко Лілія').click();
    cy.get('input[type="time"]').first().clear().type('09:00');
    cy.get('input[type="time"]').last().clear().type('17:00');
    cy.contains('[role="combobox"]', '30 хв (обід)').click();
    cy.contains('[role="option"]', '60 хв').click();
    cy.contains('span', 'Всього зараховано:').parent().next().should('have.text', '7.0 год');
    cy.get('input[placeholder^="наприклад, вийшов"]').type('Заміна колеги');
    cy.contains('button', 'Зберегти зміну в журнал').click();
    cy.contains('Зміну успішно збережено в журнал!');
    expectCall('POST', '/api/shifts', {
      workerId: 't2',
      date: '2026-09-25',
      start: '09:00',
      end: '17:00',
      breakMinutes: 60,
      note: 'Заміна колеги',
    });
    cy.contains('tbody tr', 'Шевченко Лілія')
      .should('contain', 'Заміна колеги')
      .and('contain', 'Підтверджено');
    cy.get('input[placeholder^="наприклад, вийшов"]').should('have.value', '');
  });

  it('uses the default note and shows a duplicate error', () => {
    mountPage();
    cy.contains('button', 'Зберегти зміну в журнал').click();
    cy.get('[role="alert"]').should('have.text', 'Зміну на цю дату вже подано');
    expectCall('POST', '/api/shifts', { workerId: 't1', note: 'Внесено адміністратором' });
  });

  it('shows the admin source label for shifts without a note', () => {
    db.data.shifts.find((s) => s.id === 's7')!.date = '2026-09-24';
    mountPage();
    cy.contains('tbody tr', 'Іванов Денис').should('contain', 'Внесено адміністратором');
    cy.contains('tbody tr', 'Бондаренко Олексій').should('contain', '—');
    cy.contains('tbody tr', 'Шевченко Лілія').should('contain', 'Вчасно');
  });

  it('disables saving without active workers and falls back to today', () => {
    db.data.shifts = [];
    db.data.team.forEach((m) => (m.active = false));
    db.data.duty = [];
    mountPage();
    cy.contains('Зміна активна • 0 на зміні');
    cy.contains('button', 'Зберегти зміну в журнал').should('be.disabled');
    cy.contains('За цей день змін ще немає');
  });

  it('shows the loading error and retries', () => {
    failApi('GET', '/api/shifts', 'Журнал недоступний');
    mountPage();
    cy.get('[role="alert"]').should('contain', 'Журнал недоступний');
    cy.contains('button', 'Спробувати ще раз').click();
    cy.get('tbody tr').should('have.length', 3);
  });
});
