import { loginAs } from './helpers';

describe('ShiftPay Login & Routing Flow', () => {
  it('loads the login page and switches roles', () => {
    cy.visit('/');
    cy.contains('Вхід у систему').should('be.visible');
    cy.contains('Власник').click();
    cy.contains('owner@shiftpay.ua').should('be.visible');
    cy.contains('Працівник').click();
    cy.contains('barista@shiftpay.ua').should('be.visible');
  });

  it('logs in an employee and navigates to the employee page', () => {
    loginAs('employee');
    cy.contains('Особистий кабінет').should('be.visible');
  });

  it('shows an error for a wrong password', () => {
    cy.visit('/login');
    cy.get('#loginEmail').type('barista@shiftpay.ua');
    cy.get('#loginPassword').type('wrong-password');
    cy.get('button[type="submit"]').click();
    cy.get('[role="alert"]').should('contain.text', 'Невірний email/телефон або пароль');
    cy.location('pathname').should('eq', '/login');
  });

  it('rejects an account that does not have the selected role', () => {
    cy.visit('/login');
    cy.get('[role="tablist"]').contains('button', 'Власник').click();
    cy.get('#loginEmail').type('barista@shiftpay.ua');
    cy.get('#loginPassword').type('barista123');
    cy.get('button[type="submit"]').click();
    cy.get('[role="alert"]').should('contain.text', 'не має ролі');
  });

  it('redirects to login when a protected page is opened without a session', () => {
    cy.visit('/owner');
    cy.location('pathname').should('eq', '/login');
  });

  it('sends a user to their own home page when they open another role page', () => {
    loginAs('employee');
    cy.visit('/owner/team');
    cy.location('pathname').should('eq', '/employee');
  });

  it('logs out and protects pages again', () => {
    loginAs('admin');
    cy.get('button[title="Вийти з акаунту"]').click();
    cy.location('pathname').should('eq', '/login');
    cy.visit('/admin');
    cy.location('pathname').should('eq', '/login');
  });

  it('renders 404 page for unknown routes and allows return to login', () => {
    cy.visit('/unknown-route-shiftpay-test');
    cy.contains('404').should('be.visible');
    cy.contains('Сторінку не знайдено').should('be.visible');
    cy.contains('Повернутися до входу').click();
    cy.url().should('include', '/login');
  });
});
