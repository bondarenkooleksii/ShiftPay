import EmployeeArchivePage from '../../../../src/features/employee/EmployeeArchivePage/EmployeeArchivePage';
import PayslipModal from '../../../../src/features/employee/EmployeeArchivePage/PayslipModal';
import { db } from '../../../../src/mocks/server/db';
import { formatUAH, payslipNet } from '../../../../src/shared/lib/format';
import { failApi, mountWithApp } from '../../../support/mount';

const kpi = (label: string) => cy.contains('span', label).next();

describe('EmployeeArchivePage', () => {
  it('lists all payslips with totals', () => {
    mountWithApp(<EmployeeArchivePage />, { role: 'employee' });
    cy.contains('h1', 'Архів чеків та виплат');
    cy.get('tbody tr').should('have.length', 6);
    const own = db.data.payslips.filter((p) => p.workerId === 't1');
    kpi('Виплат у вибірці').should('have.text', '6');
    kpi('Отримано загалом').should(
      'have.text',
      formatUAH(own.reduce((s, p) => s + payslipNet(p), 0))
    );
    cy.contains('tbody tr', 'SP-2026-0918')
      .should('contain', '16.09.2026')
      .and('contain', formatUAH(8780));
  });

  it('filters by year, month and search text', () => {
    mountWithApp(<EmployeeArchivePage />, { role: 'employee' });
    cy.get('[aria-label="Рік"]').click();
    cy.contains('[role="option"]', '2025').click();
    cy.get('tbody tr').should('have.length', 1).and('contain', 'SP-2025-1220');
    cy.get('[aria-label="Рік"]').click();
    cy.contains('[role="option"]', 'Усі роки').click();
    cy.get('[aria-label="Місяць"]').click();
    cy.contains('[role="option"]', 'Серпень').click();
    cy.get('tbody tr').each((row) => expect(row.text()).to.match(/\.08|\.07/));
    cy.get('[aria-label="Місяць"]').click();
    cy.contains('[role="option"]', 'Усі місяці').click();
    cy.get('input[aria-label="Пошук чека"]').type('sp-2026-07');
    cy.get('tbody tr').should('have.length', 1).and('contain', 'SP-2026-0716');
    cy.get('input[aria-label="Пошук чека"]').clear().type('16.09');
    cy.get('tbody tr').should('have.length', 1);
    cy.get('input[aria-label="Пошук чека"]').clear().type('нічого');
    cy.contains('Чеків за цими фільтрами не знайдено');
    kpi('Відпрацьовано годин').should('have.text', '0.0 год');
  });

  it('opens a payslip and downloads the receipt', () => {
    mountWithApp(<EmployeeArchivePage />, { role: 'employee' });
    cy.window().then((win) => {
      cy.stub(win.HTMLAnchorElement.prototype, 'click').as('download');
    });
    cy.contains('tbody tr', 'SP-2026-0918').contains('button', 'Переглянути чек').click();
    cy.get('[role="dialog"]')
      .should('contain', 'Розрахунковий лист SP-2026-0918')
      .and('contain', 'Період 01.09 – 15.09.2026');
    cy.get('[role="dialog"]')
      .should('contain', '92 год × 90 ₴')
      .and('contain', 'очікує підтвердження')
      .and('contain', 'переказ на IBAN');
    cy.contains('button', 'Завантажити чек (.txt)').click();
    cy.get('@download').should('have.been.calledOnce');
    cy.contains('✓ Файл завантажено');
    cy.get('button[aria-label="Закрити"]').click();
    cy.get('[role="dialog"]').should('not.exist');
  });

  it('shows the error state and retries', () => {
    failApi('GET', '/api/payslips', 'Помилка сервера');
    mountWithApp(<EmployeeArchivePage />, { role: 'employee' });
    cy.get('[role="alert"]').should('contain', 'Помилка сервера');
    cy.contains('button', 'Спробувати ще раз').click();
    cy.get('tbody tr').should('have.length', 6);
  });
});

describe('PayslipModal', () => {
  it('renders a confirmed cash payslip', () => {
    const payslip = {
      ...db.data.payslips.find((p) => p.method === 'cash')!,
      bonus: 100,
      deduction: 50,
    };
    cy.mount(<PayslipModal payslip={payslip} onClose={cy.stub()} />);
    cy.get('[role="dialog"]').should('contain', 'готівка').and('contain', 'отримання підтверджено');
    cy.contains(`− ${formatUAH(50)}`);
    cy.contains(`+ ${formatUAH(100)}`);
  });

  it('is hidden without a payslip', () => {
    cy.mount(<PayslipModal payslip={null} onClose={cy.stub()} />);
    cy.get('[role="dialog"]').should('not.exist');
  });
});
