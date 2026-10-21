describe('ShiftPay Login & Routing Flow', () => {
  it('loads the login page and switches roles', () => {
    cy.visit('/');
    cy.contains('Вхід у систему').should('be.visible');
    cy.contains('Власник').click();
    cy.contains('Працівник').click();
  });

  it('submits login form and navigates to employee page', () => {
    cy.visit('/login');
    cy.get('#loginEmail').type('barista@shiftpay.ua');
    cy.get('#loginPassword').type('secret123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/employee');
    cy.contains('Мій баланс і зміни').should('be.visible');
  });

  it('navigates directly to owner and admin routes', () => {
    cy.visit('/owner');
    cy.url().should('include', '/owner');
    cy.contains('Мої заклади').should('be.visible');

    cy.visit('/admin');
    cy.url().should('include', '/admin');
    cy.contains('Внесення та журнал змін').should('be.visible');
  });

  it('renders 404 page for unknown routes and allows return to login', () => {
    cy.visit('/unknown-route-shiftpay-test');
    cy.contains('404').should('be.visible');
    cy.contains('Сторінку не знайдено').should('be.visible');
    cy.contains('Повернутися до входу').click();
    cy.url().should('include', '/login');
  });
});
