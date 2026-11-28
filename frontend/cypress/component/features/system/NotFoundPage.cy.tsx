import NotFoundPage from '../../../../src/features/system/NotFoundPage/NotFoundPage';
import { location, mountWithApp } from '../../../support/mount';

describe('NotFoundPage', () => {
  it('shows the 404 message and links back to login', () => {
    mountWithApp(<NotFoundPage />, { path: '/missing' });
    cy.contains('404');
    cy.contains('h1', 'Сторінку не знайдено');
    location().should('have.text', '/missing');
    cy.contains('a', 'Повернутися до входу').should('have.attr', 'href', '/login').click();
    location().should('have.text', '/login');
  });
});
