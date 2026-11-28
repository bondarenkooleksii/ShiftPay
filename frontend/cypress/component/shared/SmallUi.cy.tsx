import { useState } from 'react';
import Toggle from '../../../src/shared/ui/Toggle';
import Icon from '../../../src/shared/ui/Icon';
import FakeQrCode from '../../../src/shared/ui/FakeQrCode';
import QueryState from '../../../src/shared/ui/QueryState';
import StatusFlow, { type FlowStep } from '../../../src/shared/ui/StatusFlow';
import { ApiError } from '../../../src/shared/api/client';

describe('Toggle', () => {
  it('switches state on click', () => {
    function Harness() {
      const [on, setOn] = useState(false);
      return <Toggle checked={on} onChange={setOn} label="Сповіщення" />;
    }
    cy.mount(<Harness />);
    cy.get('[role="switch"]')
      .should('have.attr', 'aria-checked', 'false')
      .and('have.attr', 'aria-label', 'Сповіщення');
    cy.get('[role="switch"]').click().should('have.attr', 'aria-checked', 'true');
    cy.get('[role="switch"]').click().should('have.attr', 'aria-checked', 'false');
  });
});

describe('Icon', () => {
  it('renders all paths of an icon with custom stroke', () => {
    cy.mount(<Icon name="settings" className="ico" strokeWidth={3} />);
    cy.get('svg.ico')
      .should('have.attr', 'stroke-width', '3')
      .find('path')
      .should('have.length', 2);
  });

  it('uses the default stroke width', () => {
    cy.mount(<Icon name="logout" />);
    cy.get('svg')
      .should('have.attr', 'stroke-width', '1.8')
      .and('have.attr', 'aria-hidden', 'true');
  });
});

describe('FakeQrCode', () => {
  it('renders a deterministic pattern for the same seed', () => {
    cy.mount(
      <div>
        <span id="a">
          <FakeQrCode seed="invite-1" size={120} />
        </span>
        <span id="b">
          <FakeQrCode seed="invite-1" />
        </span>
        <span id="c">
          <FakeQrCode seed="other" />
        </span>
      </div>
    );
    cy.get('#a svg')
      .should('have.attr', 'width', '120')
      .and('have.attr', 'aria-label', 'QR-код запрошення');
    cy.get('#b svg').should('have.attr', 'width', '160');
    cy.get('#a rect').then((a) => {
      cy.get('#b rect').should('have.length', a.length);
      cy.get('#c rect').its('length').should('not.eq', a.length);
    });
  });
});

describe('QueryState', () => {
  it('shows the loader', () => {
    cy.mount(<QueryState isLoading error={null} />);
    cy.get('[role="status"]').should('contain', 'Завантаження даних');
  });

  it('shows the error with retry', () => {
    const onRetry = cy.stub().as('retry');
    cy.mount(
      <QueryState
        isLoading={false}
        error={new ApiError(500, 'Сервер недоступний')}
        onRetry={onRetry}
      />
    );
    cy.get('[role="alert"]').should('contain', 'Сервер недоступний');
    cy.contains('button', 'Спробувати ще раз').click();
    cy.get('@retry').should('have.been.calledOnce');
  });

  it('shows the error without retry and nothing when idle', () => {
    cy.mount(<QueryState isLoading={false} error={new ApiError(404, 'Не знайдено')} />);
    cy.get('[role="alert"]').find('button').should('not.exist');
    cy.mount(<QueryState isLoading={false} error={null} />);
    cy.get('[role="alert"], [role="status"]').should('not.exist');
  });
});

describe('StatusFlow', () => {
  type Key = 'pending' | 'confirmed' | 'paid' | 'rejected';
  const steps: FlowStep<Key>[] = [
    { key: 'pending', label: 'На модерації', hint: 'Чекають', count: 2, tone: 'warning' },
    {
      key: 'confirmed',
      label: 'Підтверджено',
      hint: 'До виплати',
      count: 3,
      amount: '1 200 ₴',
      tone: 'info',
    },
    { key: 'paid', label: 'Виплачено', hint: 'Готово', count: 1, tone: 'success' },
    {
      key: 'rejected',
      label: 'Відхилено',
      hint: 'Окремо',
      count: 0,
      tone: 'danger',
      detached: true,
    },
  ];

  it('renders steps with arrows and toggles the active step', () => {
    function Harness({ onSelect }: { onSelect: (k: Key | null) => void }) {
      const [active, setActive] = useState<Key | null>(null);
      return (
        <StatusFlow
          title="Статуси змін"
          steps={steps}
          active={active}
          onSelect={(k) => {
            setActive(k);
            onSelect(k);
          }}
        />
      );
    }
    const onSelect = cy.stub().as('select');
    cy.mount(<Harness onSelect={onSelect} />);
    cy.get('section[aria-label="Статуси змін"]').should('exist');
    cy.get('section button').should('have.length', 4);
    cy.get('section [aria-hidden="true"]').filter(':contains("→")').should('have.length', 2);
    cy.contains('1 200 ₴');
    cy.contains('button', 'Підтверджено').click().should('have.attr', 'aria-pressed', 'true');
    cy.get('@select').should('have.been.calledWith', 'confirmed');
    cy.contains('button', 'Підтверджено').click().should('have.attr', 'aria-pressed', 'false');
    cy.get('@select').should('have.been.calledWith', null);
  });
});
