import SubmitShiftModal from '../../../../src/features/employee/SubmitShiftModal/SubmitShiftModal';
import { db } from '../../../../src/mocks/server/db';
import { formatUAH } from '../../../../src/shared/lib/format';
import { todayIso } from '../../../../src/shared/lib/payroll';
import { apiCalls, expectCall, mountWithApp } from '../../../support/mount';

const mountModal = (onClose = cy.stub()) =>
  mountWithApp(<SubmitShiftModal isOpen onClose={onClose} />, { role: 'employee' });

const estimate = () => cy.contains('label', 'Орієнтовна виплата').next();

describe('SubmitShiftModal', () => {
  it('renders nothing when closed', () => {
    mountWithApp(<SubmitShiftModal isOpen={false} onClose={cy.stub()} />, { role: 'employee' });
    cy.get('[role="dialog"]').should('not.exist');
  });

  it('shows venue, rate and the default template estimate', () => {
    mountModal();
    cy.contains('h3', 'Подати робочу зміну');
    cy.contains('Coffee Corner • Центр (Ставка: 90 ₴ / год)');
    cy.get('#shiftStart').should('have.value', '08:00');
    cy.get('#shiftEnd').should('have.value', '20:00');
    cy.get('#shiftBreak').should('have.value', '30');
    estimate().should('contain', '11.5 год').and('contain', formatUAH(1035));
  });

  it('applies a template and switches to custom time on manual edit', () => {
    mountModal();
    cy.get('[role="combobox"]').contains('Денна зміна').click();
    cy.contains('[role="option"]', 'Вечірня зміна').click();
    cy.get('#shiftStart').should('have.value', '16:00');
    cy.get('#shiftEnd').should('have.value', '22:00');
    cy.get('#shiftBreak').should('have.value', '0');
    estimate().should('contain', '6.0 год');
    cy.get('#shiftEnd').clear().type('21:00');
    cy.get('[role="combobox"]').should('contain', 'Інший час (вказати вручну)');
    cy.get('[role="combobox"]').click();
    cy.contains('[role="option"]', 'Ранкова зміна').click();
    cy.get('#shiftStart').clear().type('09:00');
    cy.get('#shiftBreak').clear().type('15');
    estimate().should('contain', '6.8 год');
    cy.get('[role="combobox"]').click();
    cy.contains('[role="option"]', 'Інший час').click();
    cy.get('#shiftStart').should('have.value', '09:00');
  });

  it('submits a shift for moderation and closes', () => {
    const onClose = cy.stub().as('close');
    mountModal(onClose);
    cy.get('#shiftNote').type('Прибирання після закриття');
    cy.contains('button', 'Відправити на модерацію').click();
    cy.contains('button', 'Надсилаємо…');
    cy.get('@close').should('have.been.calledOnce');
    expectCall('POST', '/api/shifts', {
      date: todayIso(),
      start: '08:00',
      end: '20:00',
      breakMinutes: 30,
      templateId: 'tpl1',
      note: 'Прибирання після закриття',
    });
    cy.wrap(null).should(() => {
      expect(db.data.shifts.some((s) => s.date === todayIso() && s.status === 'pending')).to.eq(
        true
      );
    });
  });

  it('sends a custom shift without a template and with empty break', () => {
    mountModal();
    cy.get('#shiftStart').clear().type('10:00');
    cy.get('#shiftBreak').clear();
    cy.contains('button', 'Відправити на модерацію').click();
    expectCall('POST', '/api/shifts', { start: '10:00', breakMinutes: 0 });
    cy.wrap(null).should(() => {
      const sent = apiCalls('POST', '/api/shifts')[0].body as Record<string, unknown>;
      expect(sent).not.to.have.property('templateId');
    });
  });

  it('shows the validation error from the server and clears it on cancel', () => {
    const onClose = cy.stub().as('close');
    mountModal(onClose);
    cy.get('#shiftDate, button[aria-haspopup="dialog"]').first().click();
    cy.get('[aria-label="Вибір дати"]').within(() => {
      cy.get('button[aria-label="Попередній місяць"]').click().click();
    });
    cy.get('[aria-label="Вибір дати"] [class*="dayBtn"]')
      .not('[class*="dayOtherMonth"]')
      .contains(/^24$/)
      .click();
    cy.contains('button', 'Відправити на модерацію').click();
    cy.get('[role="alert"]').should('have.text', 'Зміну на цю дату вже подано');
    cy.contains('button', 'Скасувати').click();
    cy.get('@close').should('have.been.calledOnce');
  });

  it('closes with the cross button', () => {
    const onClose = cy.stub().as('close');
    mountModal(onClose);
    cy.get('button[aria-label="Закрити модальне вікно"]').click();
    cy.get('@close').should('have.been.calledOnce');
  });
});
