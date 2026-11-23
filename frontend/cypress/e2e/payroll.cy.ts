import { loginAs } from './helpers';

const today = new Date().toLocaleDateString('uk-UA');

describe('Shift lifecycle: submit → approve → pay → confirm', () => {
  it('moves a shift from the employee to the payslip archive', () => {
    loginAs('employee');
    cy.contains('button', 'Подати зміну').click();
    cy.get('#shiftNote').type('Тестова зміна');
    cy.contains('button', 'Відправити на модерацію').click();
    cy.get('[role="dialog"]').should('not.exist');
    cy.contains('td', 'На модерації').should('exist');

    loginAs('admin');
    cy.visit('/admin/adjustments');
    cy.get('aside nav').should('contain.text', '3 на розгляді');
    cy.contains('h3', 'Бондаренко Олексій').should('contain.text', today);
    cy.contains('button', 'Погодити як подано').click();
    cy.get('aside nav').should('contain.text', '2 на розгляді');

    loginAs('owner');
    cy.visit('/owner/shifts');
    cy.contains('button', 'Провести виплату').click();
    cy.contains('button', 'Підтвердити виплату').click();
    cy.contains('Виплату проведено').should('be.visible');
    cy.contains('button', 'Готово').click();
    cy.contains('button', 'Провести виплату').should('be.disabled');

    loginAs('employee');
    cy.contains('Власник надіслав виплату').should('be.visible');
    cy.contains('button', 'Гроші прийшли').click();
    cy.contains('01.09 – 15.09.2026').should('be.visible');
    cy.contains('button', 'Гроші прийшли').click();
    cy.contains('Отримання виплати').should('be.visible');
    cy.get('aside nav').contains('button', 'Архів чеків та виплат').click();
    cy.contains('td', 'SP-').should('exist');
  });

  it('blocks a shift on a date that already has one', () => {
    loginAs('employee');
    cy.contains('button', 'Подати зміну').click();
    cy.contains('button', 'Відправити на модерацію').click();
    cy.contains('button', 'Подати зміну').click();
    cy.contains('button', 'Відправити на модерацію').click();
    cy.get('[role="alert"]').should('contain.text', 'Зміну на цю дату вже подано');
  });
});
