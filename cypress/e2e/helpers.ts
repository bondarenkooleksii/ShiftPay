export type Role = 'employee' | 'admin' | 'owner';

const ACCOUNTS: Record<Role, { tab: string; email: string; password: string }> = {
  employee: { tab: 'Працівник', email: 'barista@shiftpay.ua', password: 'barista123' },
  admin: { tab: 'Адміністратор', email: 'admin@shiftpay.ua', password: 'admin123' },
  owner: { tab: 'Власник', email: 'owner@shiftpay.ua', password: 'owner123' },
};

export function loginAs(role: Role) {
  const account = ACCOUNTS[role];
  cy.window().then((win) => {
    win.localStorage.removeItem('shiftpay.token');
    win.sessionStorage.removeItem('shiftpay.token');
  });
  cy.visit('/login');
  cy.get('[role="tablist"]').contains('button', account.tab).click();
  cy.get('#loginEmail').type(account.email);
  cy.get('#loginPassword').type(account.password);
  cy.get('button[type="submit"]').click();
  cy.location('pathname').should('eq', `/${role}`);
}
