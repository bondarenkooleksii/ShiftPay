import AdminWorkersPage from '../../../../src/features/admin/AdminWorkersPage/AdminWorkersPage';
import { db } from '../../../../src/mocks/server/db';
import { todayIso } from '../../../../src/shared/lib/payroll';
import { expectCall, failApi, mountWithApp } from '../../../support/mount';

const mountPage = () => mountWithApp(<AdminWorkersPage />, { role: 'admin' });
const kpi = (label: string) => cy.contains('span', label).next();
const workerCard = (name: string) => cy.contains('article', name);

describe('AdminWorkersPage', () => {
  it('shows counters and worker cards of the venue', () => {
    mountPage();
    cy.contains('h1', 'Працівники на зміні');
    kpi('Зараз на зміні').should('have.text', '2');
    kpi('На перерві').should('have.text', '1');
    kpi('Завершили зміну').should('have.text', '0');
    cy.get('article').should('have.length', 3);
    workerCard('Бондаренко Олексій')
      .should('contain', '08:00 - 20:00')
      .and('contain', '5 год 42 хв')
      .and('contain', 'На зміні');
    workerCard('Шевченко Лілія').should('contain', 'На перерві (30 хв)');
  });

  it('sends a worker on a break and back', () => {
    mountPage();
    workerCard('Бондаренко Олексій').contains('button', 'Відправити на перерву').click();
    expectCall('PATCH', '/api/duty/w1', { status: 'break' });
    kpi('На перерві').should('have.text', '2');
    workerCard('Шевченко Лілія').contains('button', 'Повернути з перерви').click();
    expectCall('PATCH', '/api/duty/w2', { status: 'active' });
    workerCard('Шевченко Лілія').should('contain', 'На зміні');
  });

  it('finishes a shift early with adjusted hours and logs it', () => {
    mountPage();
    workerCard('Ткаченко Марія').contains('button', 'Завершити раніше').click();
    cy.get('[aria-label="Завершити зміну раніше?"]').should(
      'contain',
      'Зміну працівника Ткаченко Марія'
    );
    cy.get('#adjustedHours').should('have.value', '3.4').clear().type('3');
    cy.contains('button', 'Завершити зміну').click();
    expectCall('PATCH', '/api/duty/w3', { status: 'finished', workedMinutes: 180 });
    kpi('Завершили зміну').should('have.text', '1');
    workerCard('Ткаченко Марія').should('contain', 'Зміну завершено').and('contain', '3 год 0 хв');
    workerCard('Ткаченко Марія').find('button').should('not.exist');
    cy.wrap(null).should(() => {
      expect(db.data.shifts.some((s) => s.workerId === 't6' && s.date === todayIso())).to.eq(true);
    });
  });

  it('uses the elapsed time when hours are cleared and can cancel', () => {
    mountPage();
    workerCard('Бондаренко Олексій').contains('button', 'Завершити раніше').click();
    cy.contains('[role="dialog"] button', 'Скасувати').click();
    cy.get('[role="dialog"]').should('not.exist');
    workerCard('Бондаренко Олексій').contains('button', 'Завершити раніше').click();
    cy.get('#adjustedHours').clear();
    cy.contains('button', 'Завершити зміну').click();
    expectCall('PATCH', '/api/duty/w1', { status: 'finished', workedMinutes: 342 });
  });

  it('shows an update error', () => {
    mountPage();
    cy.window().then(() => {
      db.data.duty[1].status = 'finished';
    });
    workerCard('Шевченко Лілія').contains('button', 'Повернути з перерви').click();
    cy.get('[role="alert"]').should('contain', 'Зміну вже завершено');
  });

  it('refreshes the timer every minute', () => {
    const now = Date.now();
    cy.clock(now, ['setInterval', 'Date']);
    db.data.duty[0].startedAt = new Date(now - 59 * 60_000).toISOString();
    mountPage();
    workerCard('Бондаренко Олексій').should('contain', '0 год 59 хв');
    cy.tick(60_000);
    workerCard('Бондаренко Олексій').should('contain', '1 год 0 хв');
  });

  it('shows the loading error and retries', () => {
    failApi('GET', '/api/duty', 'Відвідуваність недоступна');
    mountPage();
    cy.get('[role="alert"]').should('contain', 'Відвідуваність недоступна');
    cy.contains('button', 'Спробувати ще раз').click();
    cy.get('article').should('have.length', 3);
  });
});
