import OwnerSettingsPage from '../../../../src/features/owner/OwnerSettingsPage/OwnerSettingsPage';
import OwnerSupportPage from '../../../../src/features/owner/OwnerSupportPage/OwnerSupportPage';
import { db } from '../../../../src/mocks/server/db';
import { faqItems } from '../../../../src/mocks/support';
import { expectCall, failApi, mountWithApp } from '../../../support/mount';

describe('OwnerSettingsPage', () => {
  const mountPage = () => mountWithApp(<OwnerSettingsPage />, { role: 'owner' });

  it('loads the business settings', () => {
    mountPage();
    cy.contains('h1', 'Налаштування');
    cy.get('#legalName').should('have.value', 'ФОП Бондаренко О. В.');
    cy.get('#taxId').should('have.value', '3245109876');
    cy.contains('[role="combobox"]', 'UAH — гривня');
    cy.contains('[role="combobox"]', 'Раз на два тижні');
    cy.get('[role="switch"][aria-label="Сповіщення в Telegram"]').should(
      'have.attr',
      'aria-checked',
      'true'
    );
    cy.get('[role="switch"][aria-label="Зміни у відпрацьованому часі"]').should(
      'have.attr',
      'aria-checked',
      'false'
    );
  });

  it('edits and saves every field', () => {
    mountPage();
    cy.get('#legalName').clear().type('ТОВ «Кава»');
    cy.get('#taxId').clear().type('12-34ab567890');
    cy.get('#taxId').should('have.value', '1234567890');
    cy.contains('[role="combobox"]', 'UAH — гривня').click();
    cy.contains('[role="option"]', 'EUR — євро').click();
    cy.contains('[role="combobox"]', 'Раз на два тижні').click();
    cy.contains('[role="option"]', 'Щомісяця').click();
    cy.contains('[role="combobox"]', '15 та останній день місяця').click();
    cy.contains('[role="option"]', 'Неділя').click();
    cy.get('[role="switch"][aria-label="Сповіщення в Telegram"]').click();
    cy.get('[role="switch"][aria-label="Щотижневий звіт на Email"]').click();
    cy.get('[role="switch"][aria-label="Зміни у відпрацьованому часі"]').click();
    cy.contains('button', 'Зберегти зміни').click();
    cy.contains('✓ Зміни збережено');
    expectCall('PUT', '/api/settings/owner', {
      legalName: 'ТОВ «Кава»',
      taxId: '1234567890',
      currency: 'EUR — євро',
      frequency: 'Щомісяця',
      cutoff: 'Неділя',
      notify: { telegram: false, email: false, shiftChanges: true },
    });
    cy.wrap(null).should(() => expect(db.data.ownerSettings.cutoff).to.eq('Неділя'));
  });

  it('shows the tax id validation error', () => {
    mountPage();
    cy.get('#taxId').clear().type('123');
    cy.contains('button', 'Зберегти зміни').click();
    cy.contains('ІПН має містити 10 цифр');
  });

  it('shows the loading error and retries', () => {
    failApi('GET', '/api/settings/owner', 'Налаштування недоступні');
    mountPage();
    cy.get('[role="alert"]').should('contain', 'Налаштування недоступні');
    cy.contains('button', 'Спробувати ще раз').click();
    cy.get('#legalName').should('have.value', 'ФОП Бондаренко О. В.');
  });
});

describe('OwnerSupportPage', () => {
  const mountPage = () => mountWithApp(<OwnerSupportPage />, { role: 'owner' });

  it('toggles FAQ answers', () => {
    mountPage();
    cy.contains('h1', 'Підтримка');
    cy.get('[class*="faqQuestion"]').should('have.length', faqItems.length);
    cy.get('[class*="faqQuestion"][aria-expanded="true"]')
      .should('have.length', 1)
      .and('contain', faqItems[0].q);
    cy.contains(faqItems[0].a);
    cy.contains('button', faqItems[1].q).click().should('have.attr', 'aria-expanded', 'true');
    cy.contains(faqItems[0].a).should('not.exist');
    cy.contains('button', faqItems[1].q).click();
    cy.get('[class*="faqQuestion"][aria-expanded="true"]').should('not.exist');
  });

  it('validates the message length on the server', () => {
    mountPage();
    cy.get('#supportMessage').type('Коротко');
    cy.contains('button', 'Надіслати звернення').click();
    cy.contains('Опишіть проблему детальніше (від 10 символів)');
  });

  it('sends a ticket with an attachment and starts a new one', () => {
    mountPage();
    cy.contains('[role="combobox"]', 'Розрахунок виплат').click();
    cy.contains('[role="option"]', 'Технічна проблема').click();
    cy.get('#supportMessage').type('Не відкривається сторінка аналітики після оновлення');
    cy.get('input[type="file"]').selectFile(
      { contents: Cypress.Buffer.from('png'), fileName: 'screen.png' },
      { force: true }
    );
    cy.contains('📎 screen.png');
    cy.contains('button', 'Надіслати звернення').click();
    expectCall('POST', '/api/support/tickets', { category: 'Технічна проблема' });
    cy.contains('h4', /^Звернення #SP-\d{4} створено$/);
    cy.contains('button', 'Нове звернення').click();
    cy.get('#supportMessage').should('have.value', '');
    cy.contains('📎 Прикріпити файл (скріншот, PDF)');
  });
});
