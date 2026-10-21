import React from 'react';
import { mount } from 'cypress/react';
import { MemoryRouter } from 'react-router-dom';
import LoginPage from '../../src/LoginPage';

Cypress.Commands.add('mount', mount);

describe('LoginPage Component', () => {
  it('renders inputs and submit button', () => {
    cy.mount(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );
    cy.get('#loginEmail').should('exist');
    cy.get('#loginPassword').should('exist');
    cy.get('button[type="submit"]').contains('Увійти').should('be.visible');
  });
});
