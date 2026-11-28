import EmployeeProfilePage from '../../../../src/features/employee/EmployeeProfilePage/EmployeeProfilePage';
import { db } from '../../../../src/mocks/server/db';
import { expectCall, failApi, mountWithApp } from '../../../support/mount';

const mountProfile = () => mountWithApp(<EmployeeProfilePage />, { role: 'employee' });

describe('EmployeeProfilePage', () => {
  it('loads the profile into the form', () => {
    mountProfile();
    cy.contains('h1', 'Налаштування профілю');
    cy.get('#fullName').should('have.value', 'Бондаренко Олексій');
    cy.get('#phone').should('have.value', '+380 67 123 45 67');
    cy.get('#telegram').should('have.value', '@oleksii_barista');
    cy.get('#iban').should('have.value', 'UA21 3223 1300 0002 6007 2335 6600 1');
    cy.contains('Формат: UA + 27 цифр');
  });

  it('formats phone, telegram and iban while typing', () => {
    mountProfile();
    cy.get('#phone').clear().type('0501234567');
    cy.get('#phone').should('have.value', '+380 05 012 34 56');
    cy.get('#telegram').clear().type('@@new name');
    cy.get('#telegram').should('have.value', '@newname');
    cy.get('#iban').clear().type('ua12-3456');
    cy.get('#iban').should('have.value', 'UA12 3456').and('have.attr', 'aria-invalid', 'true');
    cy.contains('IBAN має починатися з UA і містити 27 цифр');
    cy.contains('button', 'Зберегти зміни').click();
    cy.wrap(null).should(() => {
      expect(db.data.profiles.t1.iban).to.eq('UA21 3223 1300 0002 6007 2335 6600 1');
    });
  });

  it('saves the profile with notification settings', () => {
    mountProfile();
    cy.get('#fullName').clear().type('Бондаренко Олексій Р.');
    cy.get('[role="switch"][aria-label="Зміну підтверджено"]')
      .click()
      .should('have.attr', 'aria-checked', 'false');
    cy.get('[role="switch"][aria-label="Виплату надіслано"]')
      .click()
      .should('have.attr', 'aria-checked', 'false');
    cy.contains('button', 'Зберегти зміни').click();
    cy.contains('✓ Профіль збережено');
    expectCall('PUT', '/api/profile', {
      fullName: 'Бондаренко Олексій Р.',
      notify: { approved: false, payout: false },
    });
    cy.wrap(null).should(() => {
      expect(db.data.team.find((m) => m.id === 't1')!.name).to.eq('Бондаренко Олексій Р.');
    });
  });

  it('shows the server error when saving an empty name', () => {
    mountProfile();
    cy.get('#fullName').clear();
    cy.contains('button', 'Зберегти зміни').click();
    cy.contains('Вкажіть ПІБ');
  });

  it('validates the new password on the client', () => {
    mountProfile();
    cy.get('#newPwd').type('short');
    cy.contains('Щонайменше 8 символів');
    cy.get('#confirmPwd').type('other');
    cy.contains('Паролі не збігаються');
    cy.contains('button', 'Оновити пароль').click();
    cy.wrap(null).should(() => {
      expect(db.data.accounts.find((a) => a.id === 'u-employee')!.password).to.eq('barista123');
    });
  });

  it('rejects a wrong current password', () => {
    mountProfile();
    cy.get('#currentPwd').type('wrong-password');
    cy.get('#newPwd').type('newpassword1');
    cy.get('#confirmPwd').type('newpassword1');
    cy.contains('button', 'Оновити пароль').click();
    cy.contains('Поточний пароль невірний');
  });

  it('changes the password and clears the form', () => {
    mountProfile();
    cy.get('#currentPwd').type('barista123');
    cy.get('#newPwd').type('newpassword1');
    cy.get('#confirmPwd').type('newpassword1');
    cy.contains('button', 'Оновити пароль').click();
    cy.contains('✓ Пароль змінено');
    cy.get('#currentPwd').should('have.value', '');
    cy.get('#newPwd').should('have.value', '');
    cy.wrap(null).should(() => {
      expect(db.data.accounts.find((a) => a.id === 'u-employee')!.password).to.eq('newpassword1');
    });
  });

  it('uses defaults for a worker without a saved profile', () => {
    delete db.data.profiles.t1;
    mountProfile();
    cy.get('#telegram').should('have.value', '');
    cy.get('#iban').should('have.value', '');
  });

  it('shows the error state when the profile cannot be loaded', () => {
    failApi('GET', '/api/profile', 'Профіль недоступний');
    mountProfile();
    cy.get('[role="alert"]').should('contain', 'Профіль недоступний');
    cy.contains('button', 'Спробувати ще раз').click();
    cy.get('#fullName').should('have.value', 'Бондаренко Олексій');
  });
});
