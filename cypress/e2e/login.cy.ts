describe('ShiftPay Login Flow', () => {
  it('loads the login page and switches roles', () => {
    cy.visit('/');
    cy.contains('Вхід у систему').should('be.visible');
    cy.contains('Власник').click();
    cy.contains('Працівник').click();
  });
});
