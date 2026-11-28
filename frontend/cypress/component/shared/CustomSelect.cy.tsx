import { useState } from 'react';
import CustomSelect, { type SelectOption } from '../../../src/shared/ui/CustomSelect';

const OPTIONS: (string | SelectOption)[] = [
  'Бариста',
  { value: 'admin', label: 'Адміністратор' },
  'Касир',
];

function Harness({ initial = '', onChange }: { initial?: string; onChange?: (v: string) => void }) {
  const [value, setValue] = useState(initial);
  return (
    <>
      <CustomSelect
        value={value}
        onChange={(v) => {
          setValue(v);
          onChange?.(v);
        }}
        options={OPTIONS}
        ariaLabel="Посада"
        id="role"
        variant="pill"
      />
      <span data-cy="value">{value}</span>
      <button type="button">зовні</button>
    </>
  );
}

describe('CustomSelect', () => {
  it('shows placeholder and selects an option by click', () => {
    const onChange = cy.stub().as('change');
    cy.mount(<Harness onChange={onChange} />);
    cy.get('[role="combobox"]')
      .should('have.attr', 'aria-label', 'Посада')
      .and('contain', 'Оберіть значення');
    cy.get('[role="combobox"]').click();
    cy.get('[role="listbox"] [role="option"]').should('have.length', 3);
    cy.contains('[role="option"]', 'Адміністратор').click();
    cy.get('@change').should('have.been.calledWith', 'admin');
    cy.get('[role="listbox"]').should('not.exist');
    cy.get('[role="combobox"]').should('contain', 'Адміністратор');
    cy.get('[role="combobox"]').click();
    cy.contains('[role="option"]', 'Адміністратор')
      .should('have.attr', 'aria-selected', 'true')
      .find('svg');
  });

  it('uses the default placeholder label when no aria label is given', () => {
    cy.mount(<CustomSelect value="" onChange={cy.stub()} options={['A']} />);
    cy.get('[role="combobox"]').should('have.attr', 'aria-label', 'Оберіть значення');
  });

  it('supports keyboard navigation', () => {
    cy.mount(<Harness initial="Бариста" />);
    cy.get('[role="combobox"]').focus().type('{downArrow}');
    cy.get('[role="listbox"]').should('exist');
    cy.get('[role="combobox"]').type('{downArrow}');
    cy.get('[data-cy="value"]').should('have.text', 'admin');
    cy.get('[role="combobox"]').type('{upArrow}');
    cy.get('[data-cy="value"]').should('have.text', 'Бариста');
    cy.get('[role="combobox"]').type('{upArrow}');
    cy.get('[data-cy="value"]').should('have.text', 'Касир');
    cy.get('[role="combobox"]').type('{esc}');
    cy.get('[role="listbox"]').should('not.exist');
    cy.get('[role="combobox"]').type('{upArrow}');
    cy.get('[role="listbox"]').should('exist');
    cy.get('[role="combobox"]').type('{enter}');
    cy.get('[role="listbox"]').should('not.exist');
    cy.get('[role="combobox"]').type(' ');
    cy.get('[role="listbox"]').should('exist');
    cy.get('[role="combobox"]').type('x');
    cy.get('[role="listbox"]').should('exist');
  });

  it('closes when clicking outside', () => {
    cy.mount(<Harness />);
    cy.get('[role="combobox"]').click();
    cy.get('[role="listbox"]').should('exist');
    cy.contains('[role="option"]', 'Касир').trigger('mousedown', { force: true });
    cy.get('[role="listbox"]').should('exist');
    cy.contains('button', 'зовні').trigger('mousedown', { force: true });
    cy.get('[role="listbox"]').should('not.exist');
  });
});
