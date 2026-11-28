import OwnerTeamPage from '../../../../src/features/owner/OwnerTeamPage/OwnerTeamPage';
import InviteModal from '../../../../src/features/owner/OwnerTeamPage/InviteModal';
import { db } from '../../../../src/mocks/server/db';
import { expectCall, failApi, mountWithApp } from '../../../support/mount';

const mountPage = () => mountWithApp(<OwnerTeamPage />, { role: 'owner' });
const kpi = (label: string) => cy.contains('span', label).next();
const row = (name: string) => cy.contains('tbody tr', name);

describe('OwnerTeamPage', () => {
  it('shows team KPIs and members', () => {
    mountPage();
    cy.contains('h1', 'Команда та ролі');
    kpi('Усього в команді').should('have.text', '6');
    cy.contains('у 2 закладах');
    kpi('Активні працівники').should('have.text', '5');
    cy.contains('1 деактивовано');
    kpi('Середня ставка').should('have.text', '96 ₴/год');
    cy.get('tbody tr').should('have.length', 6);
    row('Коваленко Дмитро').should('contain', 'Деактивований').and('have.attr', 'class');
    row('Бондаренко Олексій')
      .should('contain', '+380 67 123 45 67')
      .and('contain', '90 ₴/год')
      .and('contain', 'Активний');
  });

  it('filters by name and role', () => {
    mountPage();
    cy.get('input[aria-label="Пошук працівника"]').type('мельник');
    cy.get('tbody tr').should('have.length', 1);
    cy.get('input[aria-label="Пошук працівника"]').clear();
    cy.get('[aria-label="Фільтр за роллю"]').click();
    cy.contains('[role="option"]', 'Бариста').click();
    cy.get('tbody tr').should('have.length', 3);
    cy.get('input[aria-label="Пошук працівника"]').type('немає такого');
    cy.contains('Нікого не знайдено за цими фільтрами');
  });

  it('changes the hourly rate', () => {
    mountPage();
    row('Шевченко Лілія').contains('button', 'Змінити ставку').click();
    cy.get('[aria-label="Змінити погодинну ставку"]')
      .should('contain', 'Шевченко Лілія')
      .and('contain', 'Поточна ставка: 95 ₴/год');
    cy.get('#editRate').clear().type('0');
    cy.get('[role="dialog"] form').submit();
    cy.contains('Ставка має бути більшою за 0');
    cy.get('#editRate').clear().type('110');
    cy.contains('[role="dialog"] button', 'Зберегти').click();
    expectCall('PATCH', '/api/team/t2', { rate: 110 });
    cy.get('[role="dialog"]').should('not.exist');
    row('Шевченко Лілія').should('contain', '110 ₴/год');
    row('Бондаренко Олексій').contains('button', 'Змінити ставку').click();
    cy.contains('[role="dialog"] button', 'Скасувати').click();
    cy.get('[role="dialog"]').should('not.exist');
  });

  it('deactivates and activates a member', () => {
    mountPage();
    row('Ткаченко Марія').contains('button', 'Деактивувати').click();
    cy.get('[aria-label="Деактивувати працівника?"]').should(
      'contain',
      'Ткаченко Марія більше не зможе подавати зміни'
    );
    cy.contains('[role="dialog"] button', 'Скасувати').click();
    row('Ткаченко Марія').contains('button', 'Деактивувати').click();
    cy.get('[role="dialog"]').contains('button', 'Деактивувати').click();
    expectCall('PATCH', '/api/team/t6', { active: false });
    row('Ткаченко Марія').should('contain', 'Деактивований');
    row('Коваленко Дмитро').contains('button', 'Активувати').click();
    expectCall('PATCH', '/api/team/t5', { active: true });
    row('Коваленко Дмитро').should('contain', 'Активний');
  });

  it('opens the invite modal from the header', () => {
    mountPage();
    cy.contains('button', 'Запросити працівника').click();
    cy.get('[aria-label="Запросити працівника"]').should('exist');
    cy.contains('[role="dialog"] button', 'Скасувати').click();
    cy.get('[role="dialog"]').should('not.exist');
  });

  it('shows the empty team and the loading error', () => {
    failApi('GET', '/api/team', 'Команда недоступна');
    db.data.team = [];
    mountPage();
    cy.get('[role="alert"]').should('contain', 'Команда недоступна');
    kpi('Середня ставка').should('have.text', '0 ₴/год');
    cy.contains('button', 'Спробувати ще раз').click();
    cy.contains('Нікого не знайдено за цими фільтрами');
  });
});

describe('InviteModal', () => {
  const venues = () => db.data.venues;

  it('generates an invite link with QR code and copies it', () => {
    const onClose = cy.stub().as('close');
    mountWithApp(<InviteModal isOpen onClose={onClose} venues={venues()} />, { role: 'owner' });
    cy.window().then((win) => {
      cy.stub(win.navigator.clipboard, 'writeText').as('copy').resolves();
    });
    cy.get('#inviteName').type('Петренко Ігор');
    cy.contains('[role="combobox"]', 'Бариста').click();
    cy.contains('[role="option"]', 'Касир').click();
    cy.contains('[role="combobox"]', 'Coffee Corner • Центр').click();
    cy.contains('[role="option"]', 'Coffee Corner • Поділ').click();
    cy.get('#inviteRate').clear().type('100');
    cy.contains('button', 'Згенерувати запрошення').click();
    expectCall('POST', '/api/team', {
      name: 'Петренко Ігор',
      role: 'Касир',
      venue: 'Coffee Corner • Поділ',
      rate: 100,
    });
    cy.get('[aria-label="Запрошення створено"]').should(
      'contain',
      'Надішліть посилання для Петренко Ігор'
    );
    cy.get('svg[aria-label="QR-код запрошення"]').should('exist');
    cy.get('input[aria-label="Посилання-запрошення"]')
      .invoke('val')
      .should('match', /^https:\/\/shiftpay\.ua\/invite\//);
    cy.contains('Касир • Coffee Corner • Поділ • 100 ₴/год');
    cy.contains('button', 'Копіювати').click();
    cy.get('@copy').should('have.been.calledOnce');
    cy.contains('button', '✓ Скопійовано');
    cy.contains('button', 'Створити ще одне').click();
    cy.get('#inviteName').should('have.value', 'Петренко Ігор');
    cy.contains('button', 'Згенерувати запрошення').click();
    cy.contains('button', 'Готово').click();
    cy.get('@close').should('have.been.calledOnce');
  });

  it('shows the server validation error', () => {
    mountWithApp(<InviteModal isOpen onClose={cy.stub()} venues={venues()} />, { role: 'owner' });
    cy.get('#inviteName').type('Без ставки');
    cy.get('#inviteRate').clear().type('0');
    cy.get('form').submit();
    cy.get('[role="alert"]').should('have.text', 'Ставка має бути більшою за 0');
  });

  it('works without venues', () => {
    mountWithApp(<InviteModal isOpen onClose={cy.stub()} venues={[]} />, { role: 'owner' });
    cy.get('#inviteName').type('Хтось');
    cy.get('form').submit();
    cy.get('[role="alert"]').should('have.text', 'Оберіть заклад');
  });
});
