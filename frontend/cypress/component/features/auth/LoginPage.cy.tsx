import LoginPage from '../../../../src/features/auth/LoginPage/LoginPage';
import { db } from '../../../../src/mocks/server/db';
import { tokenStorage } from '../../../../src/shared/api/client';
import { appState, expectCall, failApi, mountWithApp } from '../../../support/mount';

describe('LoginPage', () => {
  it('renders inputs, role tabs and submit button', () => {
    mountWithApp(<LoginPage />);
    cy.get('#loginEmail').should('have.attr', 'placeholder', 'name@example.com');
    cy.get('#loginPassword').should('have.attr', 'type', 'password');
    cy.get('[role="tab"]').should('have.length', 3);
    cy.contains('[role="tab"]', 'Працівник').should('have.attr', 'aria-selected', 'true');
    cy.get('button[type="submit"]').contains('Увійти').should('be.visible');
    cy.contains('a', 'Забули пароль?').click();
    cy.contains('a', 'Зареєструватися').click();
  });

  it('fills the demo account for the selected role', () => {
    mountWithApp(<LoginPage />);
    cy.contains('[role="tab"]', 'Власник').click().should('have.attr', 'aria-selected', 'true');
    cy.contains('button', 'owner@shiftpay.ua').click();
    cy.get('#loginEmail').should('have.value', 'owner@shiftpay.ua');
    cy.get('#loginPassword').should('have.value', 'owner123');
    cy.contains('[role="tab"]', 'Адміністратор').click();
    cy.contains('button', 'admin@shiftpay.ua');
  });

  it('toggles password visibility', () => {
    mountWithApp(<LoginPage />);
    cy.get('button[aria-label="Показати пароль"]').click();
    cy.get('#loginPassword').should('have.attr', 'type', 'text');
    cy.get('button[aria-label="Приховати пароль"]').click();
    cy.get('#loginPassword').should('have.attr', 'type', 'password');
  });

  it('shows the server error for a wrong password and clears it on role change', () => {
    mountWithApp(<LoginPage />);
    cy.get('#loginEmail').type('barista@shiftpay.ua');
    cy.get('#loginPassword').type('wrong-pass');
    cy.get('button[type="submit"]').click();
    cy.contains('button[type="submit"]', 'Вхід...').should('be.disabled');
    cy.get('[role="alert"]').should('have.text', 'Невірний email/телефон або пароль');
    cy.contains('[role="tab"]', 'Адміністратор').click();
    cy.get('[role="alert"]').should('not.exist');
  });

  it('shows a network error when the server is unreachable', () => {
    failApi('POST', '/api/auth/login', '', 0);
    mountWithApp(<LoginPage />);
    cy.contains('button', 'barista@shiftpay.ua').click();
    cy.get('form').submit();
    cy.get('[role="alert"]').should('have.text', 'Немає зʼєднання з сервером');
  });

  it('rejects an account that does not have the selected role', () => {
    mountWithApp(<LoginPage />);
    cy.contains('[role="tab"]', 'Власник').click();
    cy.get('#loginEmail').type('barista@shiftpay.ua');
    cy.get('#loginPassword').type('barista123');
    cy.get('form').submit();
    cy.get('[role="alert"]').should('contain', 'не має ролі «Власник»');
  });

  it('rejects a deactivated worker', () => {
    db.data.team.find((m) => m.id === 't1')!.active = false;
    mountWithApp(<LoginPage />);
    cy.contains('button', 'barista@shiftpay.ua').click();
    cy.get('form').submit();
    cy.get('[role="alert"]').should('have.text', 'Акаунт деактивовано власником закладу');
  });

  it('logs in by phone, remembers the session and reports the role', () => {
    const onLoginSuccess = cy.stub().as('success');
    mountWithApp(<LoginPage onLoginSuccess={onLoginSuccess} />);
    cy.get('#loginEmail').type('+380 67 123 45 67');
    cy.get('#loginPassword').type('barista123');
    cy.contains('label', "Запам'ятати мене").find('input').check();
    cy.get('button[type="submit"]').click();
    cy.get('@success').should('have.been.calledWith', 'employee');
    appState('status', 'authenticated');
    expectCall('POST', '/api/auth/login', { role: 'employee', password: 'barista123' });
    cy.window().then((win) => {
      expect(win.localStorage.getItem('shiftpay.token')).to.match(/^mock\./);
    });
  });

  it('keeps the session only for the tab when remember me is off', () => {
    mountWithApp(<LoginPage />);
    cy.contains('button', 'barista@shiftpay.ua').click();
    cy.get('button[type="submit"]').click();
    appState('status', 'authenticated');
    cy.window().then((win) => {
      expect(win.localStorage.getItem('shiftpay.token')).to.eq(null);
      expect(win.sessionStorage.getItem('shiftpay.token')).to.match(/^mock\./);
      expect(tokenStorage.get()).to.match(/^mock\./);
    });
  });
});
