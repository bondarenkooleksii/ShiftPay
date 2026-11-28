import OwnerAnalyticsPage from '../../../../src/features/owner/OwnerAnalyticsPage/OwnerAnalyticsPage';
import { db } from '../../../../src/mocks/server/db';
import { formatUAH } from '../../../../src/shared/lib/format';
import { shiftAmount } from '../../../../src/shared/lib/payroll';
import { expectCall, failApi, mountWithApp } from '../../../support/mount';

const mountPage = () => mountWithApp(<OwnerAnalyticsPage />, { role: 'owner' });
const kpi = (label: string) => cy.contains('span', label).next();

const septemberCounted = () =>
  db.data.shifts.filter(
    (s) => s.date.startsWith('2026-09') && (s.status === 'confirmed' || s.status === 'paid')
  );

describe('OwnerAnalyticsPage', () => {
  it('shows costs, rates, peak hour and charts for September', () => {
    const counted = septemberCounted();
    const cost = counted.reduce((sum, s) => sum + shiftAmount(s), 0);
    const hours = counted.reduce((sum, s) => sum + s.hours, 0);
    mountPage();
    cy.contains('h1', 'Аналітика');
    kpi('Загальні витрати на персонал').should('have.text', formatUAH(cost));
    kpi('Середня ставка в мережі').should('have.text', `${Math.round(cost / hours)} ₴/год`);
    cy.contains(`${counted.length} змін • ${hours} год`);
    kpi('Пікова година навантаження').should('have.text', '12:00');
    cy.contains('92% персоналу задіяно');
    cy.contains('[class*="hBarRow"]', 'Coffee Corner • Центр').should('exist');
    cy.get('[role="img"][aria-label="Графік годин по днях тижня"] [class*="vBarCol"]').should(
      'have.length',
      7
    );
    cy.get('[class*="vBarPeak"]').should('have.length.at.least', 1);
    cy.contains(`${Math.round((cost / 60000) * 100)}%`);
    cy.contains('span', 'залишок').should('contain', formatUAH(60000 - cost));
    expectCall(
      'GET',
      '/api/analytics?period=%D0%92%D0%B5%D1%80%D0%B5%D1%81%D0%B5%D0%BD%D1%8C%202026'
    );
  });

  it('switches the period to one without shifts', () => {
    mountPage();
    cy.get('[aria-label="Період звіту"]').click();
    cy.contains('[role="option"]', 'Останні 30 днів').click();
    kpi('Загальні витрати на персонал').should('have.text', formatUAH(0));
    kpi('Середня ставка в мережі').should('have.text', '0 ₴/год');
    cy.contains('Останні 30 днів');
    cy.get('[aria-label="Період звіту"]').click();
    cy.contains('[role="option"]', 'Квартал').click();
    expectCall('GET', '/api/analytics?period=%D0%9A%D0%B2%D0%B0%D1%80%D1%82%D0%B0%D0%BB');
  });

  it('caps the budget gauge above 100%', () => {
    db.data.shifts.forEach((s) => {
      s.status = 'confirmed';
      s.rate = 2000;
    });
    mountPage();
    cy.get('[class*="gaugeValue"]')
      .invoke('text')
      .should('match', /^\d{3,}%/);
  });

  it('exports the CSV report', () => {
    mountPage();
    cy.window().then((win) => {
      cy.stub(win.HTMLAnchorElement.prototype, 'click').as('download');
    });
    kpi('Пікова година навантаження').should('have.text', '12:00');
    cy.contains('button', 'Експорт звіту').click();
    cy.get('@download')
      .should('have.been.calledOnce')
      .its('firstCall.thisValue.download')
      .should('eq', 'shiftpay-report-Вересень-2026.csv');
  });

  it('shows the loading error with placeholders and retries', () => {
    failApi('GET', '/api/analytics', 'Аналітика недоступна');
    mountPage();
    cy.get('[role="alert"]').should('contain', 'Аналітика недоступна');
    cy.contains('button', 'Експорт звіту').should('be.disabled');
    kpi('Пікова година навантаження').should('have.text', '—');
    cy.contains('0 змін • 0 год');
    cy.contains('button', 'Спробувати ще раз').click();
    kpi('Пікова година навантаження').should('have.text', '12:00');
  });
});
