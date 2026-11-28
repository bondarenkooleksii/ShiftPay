import OwnerShiftsPage from '../../../../src/features/owner/OwnerShiftsPage/OwnerShiftsPage';
import PayoutModal from '../../../../src/features/owner/OwnerShiftsPage/PayoutModal';
import { db } from '../../../../src/mocks/server/db';
import { formatUAH } from '../../../../src/shared/lib/format';
import { sumAmount } from '../../../../src/shared/lib/payroll';
import { expectCall, failApi, mountWithApp } from '../../../support/mount';

const mountPage = () => mountWithApp(<OwnerShiftsPage />, { role: 'owner' });
const kpi = (label: string) => cy.contains('span', label).next();
const flow = () => cy.get('section[aria-label="Шлях змін до виплати"]');

describe('OwnerShiftsPage', () => {
  it('shows payroll KPIs and shifts grouped by date', () => {
    const confirmed = db.data.shifts.filter((s) => s.status === 'confirmed');
    const accrued = db.data.shifts.filter((s) => s.status === 'confirmed' || s.status === 'paid');
    mountPage();
    cy.contains('h1', 'Зміни та виплати');
    kpi('Відпрацьовано годин').should(
      'have.text',
      `${accrued.reduce((s, x) => s + x.hours, 0).toFixed(1)} год`
    );
    kpi('Нараховано зарплати').should('have.text', formatUAH(sumAmount(accrued)));
    kpi('Очікує виплати').should('have.text', formatUAH(sumAmount(confirmed)));
    cy.contains(`${confirmed.length} підтверджених змін`);
    cy.get('tbody tr[class*="groupRow"]').first().should('contain', '24.09.2026');
    cy.get('tbody tr').not('[class*="groupRow"]').should('have.length', 10);
    flow().contains('button', 'Виплачено').should('contain', '2');
  });

  it('groups by worker, filters by venue and by stage', () => {
    mountPage();
    cy.contains('[role="tab"]', 'За працівником')
      .click()
      .should('have.attr', 'aria-selected', 'true');
    cy.get('thead th').first().should('have.text', 'Дата');
    cy.contains('tbody tr[class*="groupRow"]', 'Мельник Анна');
    cy.get('[aria-label="Фільтр за закладом"]').click();
    cy.contains('[role="option"]', 'Coffee Corner • Поділ').click();
    cy.get('tbody tr').not('[class*="groupRow"]').should('have.length', 3);
    flow().contains('button', 'Чекає адміністратора').click();
    cy.contains('Показано лише етап «Чекає адміністратора» • 1 змін');
    flow().contains('button', 'До виплати').click();
    cy.contains('Немає змін на етапі «До виплати»');
    cy.contains('button', 'Провести виплату').should('be.disabled');
    cy.contains('[role="tab"]', 'За датою').click();
    cy.get('thead th').first().should('have.text', 'Працівник');
  });

  it('shows an empty venue', () => {
    db.data.venues.push({
      id: 'v3',
      name: 'Порожній',
      type: 'Бар / Паб',
      address: 'Одеса',
      staffCount: 0,
    });
    mountPage();
    cy.get('[aria-label="Фільтр за закладом"]').click();
    cy.contains('[role="option"]', 'Порожній').click();
    cy.contains('У цьому закладі ще немає змін');
  });

  it('pays out confirmed shifts of a venue in cash', () => {
    const centre = db.data.shifts.filter(
      (s) => s.status === 'confirmed' && s.venue === 'Coffee Corner • Центр'
    );
    mountPage();
    cy.get('[aria-label="Фільтр за закладом"]').click();
    cy.contains('[role="option"]', 'Coffee Corner • Центр').click();
    cy.contains('button', 'Провести виплату').click();
    cy.get('[aria-label="Проведення виплати"]').should(
      'contain',
      'Coffee Corner • Центр • період 22.09 – 24.09.2026'
    );
    cy.contains(`До виплати за ${centre.length} змін`);
    cy.contains('button', 'Готівка').click().should('have.attr', 'aria-pressed', 'true');
    cy.contains('button', 'Підтвердити виплату').click();
    expectCall('POST', '/api/payouts', { method: 'cash', venue: 'Coffee Corner • Центр' });
    cy.contains('h4', 'Виплату проведено');
    cy.contains('p', 'видача готівкою').should('contain', `${formatUAH(sumAmount(centre))} •`);
    cy.get('[aria-label="Проведення виплати"]').should('contain', 'період 22.09 – 24.09.2026');
    cy.contains('button', 'Готово').click();
    cy.get('[role="dialog"]').should('not.exist');
    kpi('Очікує виплати').should('have.text', formatUAH(0));
  });

  it('pays out all venues by IBAN and can be cancelled', () => {
    mountPage();
    cy.contains('button', 'Провести виплату').click();
    cy.contains('[role="dialog"] button', 'Скасувати').click();
    cy.get('[role="dialog"]').should('not.exist');
    cy.contains('button', 'Провести виплату').click();
    cy.contains('button', 'Переказ на IBAN').should('have.attr', 'aria-pressed', 'true');
    cy.contains('button', 'Підтвердити виплату').click();
    expectCall('POST', '/api/payouts', { method: 'iban' });
    cy.contains('банківський переказ (IBAN)');
  });

  it('shows the payout error', () => {
    failApi('POST', '/api/payouts', 'Немає підтверджених змін для виплати', 422);
    mountPage();
    cy.contains('button', 'Провести виплату').click();
    cy.contains('button', 'Підтвердити виплату').click();
    cy.get('[role="dialog"] [role="alert"]').should(
      'have.text',
      'Немає підтверджених змін для виплати'
    );
    cy.contains('h4', 'Виплату проведено').should('not.exist');
  });

  it('shows the loading error and retries', () => {
    failApi('GET', '/api/shifts', 'Реєстр недоступний');
    mountPage();
    cy.get('[role="alert"]').should('contain', 'Реєстр недоступний');
    cy.contains('button', 'Спробувати ще раз').click();
    cy.get('tbody tr').not('[class*="groupRow"]').should('have.length', 10);
  });
});

describe('PayoutModal', () => {
  it('shows the pending state and disables an empty payout', () => {
    cy.mount(
      <PayoutModal
        isOpen
        onClose={cy.stub()}
        total={0}
        count={0}
        venueLabel="Усі заклади"
        period="—"
        isPending
        error={null}
        onConfirm={cy.stub().resolves(undefined)}
      />
    );
    cy.contains('button', 'Проводимо…').should('be.disabled');
    cy.get('[aria-label="Проведення виплати"]').should('contain', 'Усі заклади • період —');
  });
});
