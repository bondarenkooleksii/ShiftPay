import AdminSettingsPage from '../../../../src/features/admin/AdminSettingsPage/AdminSettingsPage';
import { db } from '../../../../src/mocks/server/db';
import { expectCall, failApi, mountWithApp } from '../../../support/mount';

const mountPage = () => mountWithApp(<AdminSettingsPage />, { role: 'admin' });

const setRange = (selector: string, value: number) =>
  cy.get(selector).then(($input) => {
    const input = $input[0] as HTMLInputElement;
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!;
    setter.call(input, String(value));
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });

describe('AdminSettingsPage', () => {
  it('lists shift templates', () => {
    mountPage();
    cy.contains('h1', 'Налаштування зміни');
    cy.get('[class*="templateRow"]').should('have.length', 3);
    cy.contains('[class*="templateRow"]', 'Денна зміна').should(
      'contain',
      '08:00 – 20:00 • перерва 30 хв'
    );
    cy.contains('[class*="templateRow"]', 'Ранкова зміна').should('contain', 'без перерви');
  });

  it('adds a new template', () => {
    mountPage();
    cy.contains('button', '+ Додати шаблон').click();
    cy.contains('button', '+ Додати шаблон').should('not.exist');
    cy.get('form').contains('button', 'Додати шаблон').click();
    cy.wrap(null).should(() => expect(db.data.templates).to.have.length(3));
    cy.get('#tplName').type('   ');
    cy.get('form').submit();
    cy.get('#tplName').clear().type('Нічна зміна');
    cy.get('#tplStart').clear().type('22:00');
    cy.get('#tplEnd').clear().type('06:00');
    cy.contains('[role="combobox"]', '30 хв').click();
    cy.contains('[role="option"]', '15 хв').click();
    cy.get('form').contains('button', 'Додати шаблон').click();
    expectCall('POST', '/api/templates', {
      name: 'Нічна зміна',
      start: '22:00',
      end: '06:00',
      breakMinutes: 15,
    });
    cy.contains('[class*="templateRow"]', 'Нічна зміна').should('contain', 'перерва 15 хв');
    cy.get('#tplName').should('not.exist');
  });

  it('shows an error for a too short template and cancels the form', () => {
    mountPage();
    cy.contains('button', '+ Додати шаблон').click();
    cy.get('#tplName').type('Коротка');
    cy.get('#tplEnd').clear().type('09:30');
    cy.get('form').contains('button', 'Додати шаблон').click();
    cy.get('[role="alert"]').should('have.text', 'Шаблон має тривати щонайменше 1 годину');
    cy.contains('button', 'Скасувати').click();
    cy.get('#tplName').should('not.exist');
  });

  it('deletes a template after confirmation', () => {
    mountPage();
    cy.contains('[class*="templateRow"]', 'Вечірня зміна').contains('button', 'Видалити').click();
    cy.get('[aria-label="Видалити шаблон?"]').should('contain', 'Шаблон «Вечірня зміна» зникне');
    cy.contains('[role="dialog"] button', 'Скасувати').click();
    cy.get('[class*="templateRow"]').should('have.length', 3);
    cy.contains('[class*="templateRow"]', 'Вечірня зміна').contains('button', 'Видалити').click();
    cy.get('[role="dialog"]').contains('button', 'Видалити').click();
    expectCall('DELETE', '/api/templates/tpl3');
    cy.get('[class*="templateRow"]').should('have.length', 2);
  });

  it('shows a delete error', () => {
    failApi('DELETE', '/api/templates', 'Шаблон використовується');
    mountPage();
    cy.contains('[class*="templateRow"]', 'Денна зміна').contains('button', 'Видалити').click();
    cy.get('[role="dialog"]').contains('button', 'Видалити').click();
    cy.get('[role="alert"]').should('contain', 'Шаблон використовується');
  });

  it('changes and saves the grace period', () => {
    mountPage();
    cy.contains('[class*="badge"]', '10 хв');
    setRange('#grace', 12);
    cy.contains('[class*="badge"]', '12 хв');
    cy.contains('button', 'Зберегти').click();
    cy.contains('✓ Правила збережено');
    expectCall('PUT', '/api/settings/admin', { graceMinutes: 12 });
    cy.wrap(null).should(() => expect(db.data.adminSettings.graceMinutes).to.eq(12));
  });

  it('shows the save error', () => {
    failApi('PUT', '/api/settings/admin', 'Не вдалося зберегти', 422);
    mountPage();
    cy.contains('button', 'Зберегти').click();
    cy.contains('Не вдалося зберегти');
  });

  it('shows the templates loading error and retries', () => {
    failApi('GET', '/api/templates', 'Шаблони недоступні');
    mountPage();
    cy.get('[role="alert"]').should('contain', 'Шаблони недоступні');
    cy.contains('button', 'Спробувати ще раз').click();
    cy.get('[class*="templateRow"]').should('have.length', 3);
  });
});
