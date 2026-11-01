const ROUTES: Array<[path: string, title: string]> = [
  ['/employee', 'Особистий кабінет'],
  ['/employee/archive', 'Архів чеків та виплат'],
  ['/employee/settings', 'Налаштування профілю'],
  ['/admin', 'Журнал робочих змін'],
  ['/admin/adjustments', 'Коригування заявок'],
  ['/admin/workers', 'Працівники на зміні'],
  ['/admin/settings', 'Налаштування зміни'],
  ['/owner', 'Мої заклади'],
  ['/owner/team', 'Команда та ролі'],
  ['/owner/shifts', 'Зміни та виплати'],
  ['/owner/analytics', 'Аналітика'],
  ['/owner/settings', 'Налаштування'],
  ['/owner/support', 'Підтримка'],
];

describe('Dashboard routes', () => {
  ROUTES.forEach(([path, title]) => {
    it(`renders ${path}`, () => {
      cy.visit(path);
      cy.get('h1').should('contain.text', title);
    });
  });

  it('owner sidebar links navigate to their pages', () => {
    cy.visit('/owner');
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
    cy.visit('/admin');
    cy.get('aside nav').contains('button', 'Коригування заявок').click();
    cy.location('pathname').should('eq', '/admin/adjustments');
    cy.get('aside nav').contains('button', 'Працівники на зміні').click();
    cy.location('pathname').should('eq', '/admin/workers');
    cy.get('aside nav').contains('button', 'Налаштування зміни').click();
    cy.location('pathname').should('eq', '/admin/settings');
  });

  it('employee sidebar links navigate to their pages', () => {
    cy.visit('/employee');
    cy.get('aside nav').contains('button', 'Архів чеків та виплат').click();
    cy.location('pathname').should('eq', '/employee/archive');
    cy.get('aside nav').contains('button', 'Налаштування профілю').click();
    cy.location('pathname').should('eq', '/employee/settings');
  });

  it('adjustments badge disappears after the last request is decided', () => {
    cy.visit('/admin/adjustments');
    cy.get('aside nav').should('contain.text', '1 на розгляді');
    cy.contains('button', 'Погодити з коригуванням').click();
    cy.get('aside nav').should('not.contain.text', 'на розгляді');
  });

  it('team page opens the invite modal and shows an invite link', () => {
    cy.visit('/owner/team');
    cy.contains('button', 'Запросити працівника').click();
    cy.get('#inviteName').type('Ткаченко Марія');
    cy.contains('button', 'Згенерувати запрошення').click();
    cy.get('input[aria-label="Посилання-запрошення"]')
      .invoke('val')
      .should('match', /^https:\/\/shiftpay\.app\/invite\//);
  });
});
