import { loginAs, type Role } from './helpers';

const ROUTES: Array<[role: Role, path: string, title: string]> = [
  ['employee', '/employee', 'Особистий кабінет'],
  ['employee', '/employee/archive', 'Архів чеків та виплат'],
  ['employee', '/employee/settings', 'Налаштування профілю'],
  ['admin', '/admin', 'Журнал робочих змін'],
  ['admin', '/admin/adjustments', 'Коригування заявок'],
  ['admin', '/admin/workers', 'Працівники на зміні'],
  ['admin', '/admin/settings', 'Налаштування зміни'],
  ['owner', '/owner', 'Мої заклади'],
  ['owner', '/owner/team', 'Команда та ролі'],
  ['owner', '/owner/shifts', 'Зміни та виплати'],
  ['owner', '/owner/analytics', 'Аналітика'],
  ['owner', '/owner/settings', 'Налаштування'],
  ['owner', '/owner/support', 'Підтримка'],
];

describe('Dashboard routes', () => {
  ROUTES.forEach(([role, path, title]) => {
    it(`renders ${path}`, () => {
      loginAs(role);
      cy.visit(path);
      cy.get('h1').should('contain.text', title);
    });
  });

  it('owner sidebar links navigate to their pages', () => {
    loginAs('owner');
    const links: Array<[label: string, path: string]> = [
      ['Команда та ролі', '/owner/team'],
      ['Зміни та виплати', '/owner/shifts'],
      ['Аналітика', '/owner/analytics'],
      ['Налаштування', '/owner/settings'],
      ['Підтримка', '/owner/support'],
    ];
    links.forEach(([label, path]) => {
      cy.get('aside nav').contains('button', label).click();
      cy.location('pathname').should('eq', path);
    });
  });

  it('admin sidebar links navigate to their pages', () => {
    loginAs('admin');
    cy.get('aside nav').contains('button', 'Коригування заявок').click();
    cy.location('pathname').should('eq', '/admin/adjustments');
    cy.get('aside nav').contains('button', 'Працівники на зміні').click();
    cy.location('pathname').should('eq', '/admin/workers');
    cy.get('aside nav').contains('button', 'Налаштування зміни').click();
    cy.location('pathname').should('eq', '/admin/settings');
  });

  it('employee sidebar links navigate to their pages', () => {
    loginAs('employee');
    cy.get('aside nav').contains('button', 'Архів чеків та виплат').click();
    cy.location('pathname').should('eq', '/employee/archive');
    cy.get('aside nav').contains('button', 'Налаштування профілю').click();
    cy.location('pathname').should('eq', '/employee/settings');
  });

  it('adjustments badge disappears after all requests are decided', () => {
    loginAs('admin');
    cy.visit('/admin/adjustments');
    cy.get('aside nav').should('contain.text', '2 на розгляді');
    cy.contains('button', 'Погодити як подано').click();
    cy.get('aside nav').should('contain.text', '1 на розгляді');
    cy.contains('button', 'Погодити як подано').click();
    cy.get('aside nav').should('not.contain.text', 'на розгляді');
  });

  it('team page opens the invite modal and shows an invite link', () => {
    loginAs('owner');
    cy.visit('/owner/team');
    cy.contains('button', 'Запросити працівника').click();
    cy.get('#inviteName').type('Ковальчук Ірина');
    cy.contains('button', 'Згенерувати запрошення').click();
    cy.get('input[aria-label="Посилання-запрошення"]')
      .invoke('val')
      .should('match', /^https:\/\/shiftpay\.ua\/invite\//);
  });
});
