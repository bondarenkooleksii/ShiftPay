import AdminAdjustmentsPage from '../../../../src/features/admin/AdminAdjustmentsPage/AdminAdjustmentsPage';
import { db } from '../../../../src/mocks/server/db';
import { expectCall, failApi, mountWithApp } from '../../../support/mount';

const mountPage = () => mountWithApp(<AdminAdjustmentsPage />, { role: 'admin' });
const card = () => cy.get('section[class*="card"]');

describe('AdminAdjustmentsPage', () => {
  it('lists pending requests and compares the first one with the schedule', () => {
    mountPage();
    cy.contains('h1', 'Коригування заявок');
    cy.contains('button', 'На розгляді (2)');
    cy.contains('button', 'Усі (5)');
    cy.get('aside button[class*="requestItem"]').should('have.length', 2);
    card().should('contain', 'Ткаченко Марія • 24.09.2026');
    card().should('contain', '16:00 – 22:30').and('contain', 'Перерва 0 хв • 6.5 год');
    card().should('contain', 'Вечірня зміна • перерва 0 хв • 6.0 год');
    card().should('contain', '+0.5 год понаднормово');
    card().should('contain', '«Залишилась на вечірнє прибирання після закриття»');
  });

  it('approves a request by the schedule with a comment', () => {
    mountPage();
    cy.get('#adjReason').type('Прибирання не погоджено');
    cy.contains('button', 'Погодити за графіком').click();
    expectCall('PATCH', '/api/shifts/s6', {
      status: 'confirmed',
      start: '16:00',
      end: '22:00',
      breakMinutes: 0,
      adminReason: 'Прибирання не погоджено',
    });
    cy.contains('button', 'На розгляді (1)');
    card().should('contain', 'Бондаренко Олексій • 20.09.2026');
    cy.get('#adjReason').should('have.value', '');
  });

  it('approves as submitted when there is no delta', () => {
    mountPage();
    cy.contains('aside button', 'Бондаренко Олексій').click();
    card().should('contain', '+0.0 год');
    cy.contains('button', 'Погодити за графіком').should('not.exist');
    cy.contains('button', 'Погодити як подано').click();
    expectCall('PATCH', '/api/shifts/s3', { status: 'confirmed' });
  });

  it('requests clarification and returns a decision to review', () => {
    mountPage();
    cy.contains('button', 'Запросити уточнення').click();
    expectCall('PATCH', '/api/shifts/s6', { status: 'clarify' });
    cy.contains('aside button', 'Ткаченко Марія').should('contain', 'Потрібне уточнення');
    cy.contains('button', 'Усі (5)').click();
    cy.contains('aside button', 'Шевченко Лілія').first().click();
    card().should('contain', 'Рішення: Підтверджено').and('contain', '«Погоджено: мало гостей»');
    cy.contains('button', 'Повернути на розгляд').click();
    expectCall('PATCH', '/api/shifts/s5', { status: 'pending' });
  });

  it('rejects a request with a reason from the dialog', () => {
    mountPage();
    cy.contains('button', 'Відхилити').click();
    cy.get('[role="dialog"][aria-label="Відхилити заявку?"]').should(
      'contain',
      'Зміну працівника Ткаченко Марія не буде зараховано'
    );
    cy.contains('[role="dialog"] button', 'Скасувати').click();
    cy.get('[aria-label="Відхилити заявку?"]').should('not.exist');
    cy.contains('button', 'Відхилити').click();
    cy.get('#rejectReason').type('Не було в графіку');
    cy.get('[aria-label="Відхилити заявку?"]').contains('button', 'Відхилити').click();
    expectCall('PATCH', '/api/shifts/s6', { status: 'rejected', adminReason: 'Не було в графіку' });
    cy.contains('button', 'На розгляді (1)');
  });

  it('shows the server error when rejecting without a reason', () => {
    mountPage();
    cy.contains('button', 'Відхилити').click();
    cy.get('[aria-label="Відхилити заявку?"]').contains('button', 'Відхилити').click();
    cy.get('[role="alert"]').should('have.text', 'Вкажіть причину відхилення');
    cy.contains('aside button', 'Бондаренко Олексій').click();
    cy.get('[role="alert"]').should('not.exist');
  });

  it('marks overtime as negative and handles shifts without a template', () => {
    const s3 = db.data.shifts.find((s) => s.id === 's3')!;
    s3.hours = 7;
    db.data.shifts.find((s) => s.id === 's6')!.templateId = undefined;
    db.data.shifts.find((s) => s.id === 's6')!.note = undefined;
    mountPage();
    card().should('contain', 'Позапланова зміна (без шаблону)').and('contain', 'Без коментаря');
    cy.contains('aside button', 'Бондаренко Олексій').click();
    card().should('contain', '−1.0 год');
  });

  it('shows the empty state and the paid decision without actions', () => {
    db.data.shifts.forEach((s) => {
      if (s.status === 'pending') s.status = 'paid';
    });
    mountPage();
    cy.contains('Усі заявки розглянуто');
    cy.contains('button', 'Усі (5)').click();
    cy.contains('aside button', 'Ткаченко Марія').click();
    card().should('contain', 'Рішення: Виплачено');
    cy.contains('button', 'Повернути на розгляд').should('not.exist');
  });

  it('shows the loading error and retries', () => {
    failApi('GET', '/api/shifts', 'Немає зʼєднання');
    mountPage();
    cy.get('[role="alert"]').should('contain', 'Немає зʼєднання');
    cy.contains('button', 'Спробувати ще раз').click();
    cy.contains('button', 'На розгляді (2)');
  });
});
