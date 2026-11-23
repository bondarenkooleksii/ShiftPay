import { mount } from 'cypress/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../../src/api/auth';
import LoginPage from '../../src/features/auth/LoginPage/LoginPage';

describe('LoginPage Component', () => {
  it('renders inputs and submit button', () => {
    mount(
      <MemoryRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </MemoryRouter>
    );
    cy.get('#loginEmail').should('exist');
    cy.get('#loginPassword').should('exist');
    cy.get('button[type="submit"]').contains('Увійти').should('be.visible');
  });

  it('fills the demo account for the selected role', () => {
    mount(
      <MemoryRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </MemoryRouter>
    );
    cy.get('[role="tablist"]').contains('button', 'Власник').click();
    cy.contains('button', 'owner@shiftpay.ua').click();
    cy.get('#loginEmail').should('have.value', 'owner@shiftpay.ua');
  });
});
