import { Component, type ReactNode } from 'react';
import App from '../../../src/app/App';
import { useAuth } from '../../../src/api/auth';
import { useAppState } from '../../../src/app/AppStateProvider';
import { db } from '../../../src/mocks/server/db';
import { tokenStorage } from '../../../src/shared/api/client';
import { appState, expectCall, location, mountWithApp } from '../../support/mount';

const nav = (label: string) =>
  cy.get('nav[aria-label="Головна навігація"]').contains('button', label);

describe('App routing', () => {
  it('shows the login page for a guest and logs in with the demo account', () => {
    mountWithApp(<App />, { path: '/' });
    cy.contains('h1', 'Вхід у систему');
    cy.contains('button', 'barista@shiftpay.ua').click();
    cy.get('button[type="submit"]').click();
    location().should('have.text', '/employee');
    cy.contains('h1', 'Особистий кабінет');
  });

  it('redirects a logged-in user away from the login page', () => {
    mountWithApp(<App />, { role: 'owner', path: '/login' });
    location().should('have.text', '/owner');
    cy.contains('h1', 'Мої заклади');
  });

  it('sends a guest from a protected page to login', () => {
    mountWithApp(<App />, { path: '/owner/team' });
    location().should('have.text', '/login');
  });

  it('keeps every role inside its own cabinet', () => {
    mountWithApp(<App />, { role: 'employee', path: '/owner/analytics' });
    location().should('have.text', '/employee');
  });

  it('shows the loader while checking the session and drops an invalid token', () => {
    tokenStorage.set('broken-token', true);
    mountWithApp(<App />, { path: '/admin' });
    cy.get('[role="status"]').should('contain', 'Завантаження даних');
    location().should('have.text', '/login');
    appState('status', 'guest');
    cy.wrap(null).should(() => expect(tokenStorage.get()).to.eq(null));
  });

  it('renders the 404 page for unknown routes', () => {
    mountWithApp(<App />, { path: '/does-not-exist' });
    cy.contains('h1', 'Сторінку не знайдено');
  });
});

describe('Dashboard layout and sidebar', () => {
  it('navigates through every owner page and opens the add venue modal', () => {
    mountWithApp(<App />, { role: 'owner', path: '/owner' });
    nav('Мої заклади').should('have.attr', 'aria-current', 'page');
    const pages: [string, string, string][] = [
      ['Команда та ролі', '/owner/team', 'Команда та ролі'],
      ['Зміни та виплати', '/owner/shifts', 'Зміни та виплати'],
      ['Аналітика', '/owner/analytics', 'Аналітика'],
      ['Налаштування', '/owner/settings', 'Налаштування'],
      ['Підтримка', '/owner/support', 'Підтримка'],
      ['Мої заклади', '/owner', 'Мої заклади'],
    ];
    pages.forEach(([label, path, title]) => {
      nav(label).click();
      location().should('have.text', path);
      cy.contains('h1', title);
      nav(label).should('have.attr', 'aria-current', 'page');
    });
    cy.contains('button', 'Додати заклад').click();
    cy.get('[aria-label="Додати новий заклад"]').should('exist');
    cy.contains('[role="dialog"] button', 'Скасувати').click();
    appState('addVenue', false);
  });

  it('opens the submit shift modal from the employee sidebar and pages', () => {
    mountWithApp(<App />, { role: 'employee', path: '/employee' });
    cy.contains('Бондаренко Олексій');
    cy.contains('Бариста / Працівник');
    nav('Подати зміну').click();
    appState('submitShift', true);
    cy.contains('h3', 'Подати робочу зміну');
    cy.get('button[aria-label="Закрити модальне вікно"]').click();
    appState('submitShift', false);
    cy.get('main').contains('button', 'Подати зміну').click();
    appState('submitShift', true);
    cy.contains('button', 'Скасувати').click();
    nav('Архів чеків та виплат').click();
    cy.contains('h1', 'Архів чеків та виплат');
    nav('Налаштування профілю').click();
    cy.contains('h1', 'Налаштування профілю');
  });

  it('shows the pending badge for the admin and visits admin pages', () => {
    mountWithApp(<App />, { role: 'admin', path: '/admin' });
    nav('Коригування заявок').should('contain', '2 на розгляді');
    nav('Коригування заявок').click();
    cy.contains('h1', 'Коригування заявок');
    nav('Працівники на зміні').click();
    cy.contains('h1', 'Працівники на зміні');
    nav('Налаштування зміни').click();
    cy.contains('h1', 'Налаштування зміни');
    nav('Внесення та журнал змін').click();
    cy.contains('h1', 'Журнал робочих змін');
  });

  it('hides the admin badge when nothing is pending', () => {
    db.data.shifts.forEach((s) => {
      if (s.status === 'pending') s.status = 'confirmed';
    });
    mountWithApp(<App />, { role: 'admin', path: '/admin/workers' });
    cy.contains('h1', 'Працівники на зміні');
    nav('Коригування заявок').find('[class*="badgePending"]').should('not.exist');
  });

  it('logs out to the login page', () => {
    mountWithApp(<App />, { role: 'owner', path: '/owner/support' });
    cy.get('button[title="Вийти з акаунту"]').click();
    expectCall('POST', '/api/auth/logout');
    location().should('have.text', '/login');
    appState('status', 'guest');
    cy.wrap(null).should(() => expect(db.data.sessions).not.to.have.property('test-token-owner'));
  });

  it('logs out locally even when the server call fails', () => {
    mountWithApp(<App />, { role: 'owner', path: '/owner' });
    cy.then(() => {
      db.data.sessions = {};
    });
    cy.get('button[title="Вийти з акаунту"]').click();
    location().should('have.text', '/login');
  });

  it('switches roles with the sidebar badge and the dev toolbar', () => {
    mountWithApp(<App />, { role: 'employee', path: '/employee' });
    cy.get('button[title="Перемкнути роль для тестування"]')
      .should('have.text', 'Працівник')
      .click();
    location().should('have.text', '/admin');
    appState('role', 'admin');
    cy.get('button[title="Перемкнути роль для тестування"]').click();
    location().should('have.text', '/owner');
    cy.get('button[title="Перемкнути роль для тестування"]').click();
    location().should('have.text', '/employee');
    cy.get('[class*="floatingSwitcher"]').contains('button', 'Працівник').click();
    location().should('have.text', '/employee');
    cy.get('[class*="floatingSwitcher"]').contains('button', 'Власник').click();
    location().should('have.text', '/owner');
    appState('role', 'owner');
  });

  it('returns to login when the session expires on the server', () => {
    mountWithApp(<App />, { role: 'owner', path: '/owner' });
    cy.contains('h2', 'Активні заклади');
    cy.then(() => {
      db.data.sessions = {};
    });
    nav('Команда та ролі').click();
    location().should('have.text', '/login');
    appState('status', 'guest');
  });
});

class Boundary extends Component<{ children: ReactNode }, { message: string | null }> {
  state = { message: null as string | null };

  static getDerivedStateFromError(error: Error) {
    return { message: error.message };
  }

  render() {
    return this.state.message ? <p data-cy="error">{this.state.message}</p> : this.props.children;
  }
}

describe('Context guards', () => {
  beforeEach(() => {
    cy.on('uncaught:exception', () => false);
  });

  it('throws when useAuth is used outside AuthProvider', () => {
    function NoAuth() {
      useAuth();
      return null;
    }
    cy.mount(
      <Boundary>
        <NoAuth />
      </Boundary>
    );
    cy.get('[data-cy="error"]').should('have.text', 'useAuth must be used inside <AuthProvider>');
  });

  it('throws when useAppState is used outside AppStateProvider', () => {
    function NoState() {
      useAppState();
      return null;
    }
    cy.mount(
      <Boundary>
        <NoState />
      </Boundary>
    );
    cy.get('[data-cy="error"]').should(
      'have.text',
      'useAppState must be used inside <AppStateProvider>'
    );
  });
});
