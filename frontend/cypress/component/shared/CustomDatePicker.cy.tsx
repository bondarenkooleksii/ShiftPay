import { useState } from 'react';
import CustomDatePicker from '../../../src/shared/ui/CustomDatePicker';

function Harness({ initial }: { initial: string }) {
  const [value, setValue] = useState(initial);
  return (
    <>
      <CustomDatePicker value={value} onChange={setValue} id="date" />
      <span data-cy="value">{value}</span>
      <button type="button">зовні</button>
    </>
  );
}

const trigger = () => cy.get('#date button[aria-haspopup="dialog"]');
const title = () => cy.get('[aria-label="Вибір дати"] span').first();

describe('CustomDatePicker', () => {
  beforeEach(() => {
    cy.clock(new Date(2026, 8, 15, 12).getTime(), ['Date']);
  });

  it('shows placeholder and opens on the default month', () => {
    cy.mount(<CustomDatePicker value="" onChange={cy.stub()} placeholder="Оберіть дату" />);
    cy.contains('Оберіть дату');
    cy.get('button[aria-haspopup="dialog"]').click();
    title().should('have.text', 'Вересень 2026');
    cy.get('[aria-label="Вибір дати"] [class*="dayToday"]').should('have.text', '15');
  });

  it('selects a day in ISO format and closes', () => {
    cy.mount(<Harness initial="2026-09-10" />);
    trigger().should('contain', '10.09.2026').click();
    cy.get('[class*="daySelected"]').should('have.text', '10');
    cy.get('[class*="dayBtn"]').not('[class*="dayOtherMonth"]').contains(/^21$/).click();
    cy.get('[data-cy="value"]').should('have.text', '2026-09-21');
    cy.get('[aria-label="Вибір дати"]').should('not.exist');
  });

  it('keeps the dotted format and navigates between years', () => {
    cy.mount(<Harness initial="05.01.2026" />);
    trigger().click();
    title().should('have.text', 'Січень 2026');
    cy.get('[aria-label="Попередній місяць"]').click();
    title().should('have.text', 'Грудень 2025');
    cy.get('[aria-label="Наступний місяць"]').click();
    cy.get('[aria-label="Наступний місяць"]').click();
    title().should('have.text', 'Лютий 2026');
    cy.get('[class*="dayBtn"]').not('[class*="dayOtherMonth"]').contains(/^3$/).click();
    cy.get('[data-cy="value"]').should('have.text', '03.02.2026');
  });

  it('wraps from December to January', () => {
    cy.mount(<Harness initial="2026-12-01" />);
    trigger().click();
    title().should('have.text', 'Грудень 2026');
    cy.get('[aria-label="Наступний місяць"]').click();
    title().should('have.text', 'Січень 2027');
    cy.get('[aria-label="Попередній місяць"]').click();
    title().should('have.text', 'Грудень 2026');
  });

  it('selects today and closes with the footer buttons or outside click', () => {
    cy.mount(<Harness initial="2026-03-01" />);
    trigger().click();
    cy.contains('button', 'Сьогодні').click();
    cy.get('[data-cy="value"]').should('have.text', '2026-09-15');
    trigger().click();
    cy.contains('button', 'Закрити').click();
    cy.get('[aria-label="Вибір дати"]').should('not.exist');
    trigger().click();
    cy.get('[aria-label="Вибір дати"]').trigger('mousedown', { force: true });
    cy.get('[aria-label="Вибір дати"]').should('exist');
    cy.contains('button', 'зовні').trigger('mousedown', { force: true });
    cy.get('[aria-label="Вибір дати"]').should('not.exist');
  });

  it('falls back to today for an unknown value format', () => {
    cy.mount(<Harness initial="not a date" />);
    trigger().should('contain', '15.09.2026');
    cy.mount(<Harness initial="September 20, 2026" />);
    trigger().should('contain', '20.09.2026');
  });
});
