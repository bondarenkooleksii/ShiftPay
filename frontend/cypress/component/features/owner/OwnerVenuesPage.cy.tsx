import OwnerVenuesPage from '../../../../src/features/owner/OwnerVenuesPage/OwnerVenuesPage';
import AddVenueModal from '../../../../src/features/owner/OwnerVenuesPage/AddVenueModal';
import { db } from '../../../../src/mocks/server/db';
import { expectCall, failApi, mountWithApp } from '../../../support/mount';

const venueCard = (name: string) => cy.contains('h3', name).closest('[class*="_venueCard_"]');

describe('OwnerVenuesPage', () => {
  it('shows venues with staff counts and filters them', () => {
    const onOpen = cy.stub().as('open');
    mountWithApp(<OwnerVenuesPage onOpenAddVenueModal={onOpen} />, { role: 'owner' });
    cy.contains('h1', 'Мої заклади');
    cy.contains('h2', 'Активні заклади (2)');
    venueCard('Coffee Corner • Центр')
      .should('contain', 'Кав’ярня • м. Київ, вул. Хрещатик, 15')
      .and('contain', '4 працівники');
    venueCard('Coffee Corner • Поділ').should('contain', '1 працівник');
    cy.get('input[placeholder="Пошук закладів або адрес..."]').type('сагайдачного');
    cy.contains('h2', 'Активні заклади (1)');
    cy.get('input[placeholder="Пошук закладів або адрес..."]').clear().type('поділ');
    cy.contains('h2', 'Активні заклади (1)');
    cy.contains('button', 'Додати заклад').click();
    cy.get('@open').should('have.been.calledOnce');
  });

  it('uses the plural form for five or more workers', () => {
    for (let i = 0; i < 4; i += 1) {
      db.data.team.push({ ...db.data.team[3], id: `extra${i}`, name: `Новий ${i}` });
    }
    mountWithApp(<OwnerVenuesPage onOpenAddVenueModal={cy.stub()} />, { role: 'owner' });
    venueCard('Coffee Corner • Поділ').should('contain', '5 працівників');
  });

  it('shows the onboarding card when there are no venues', () => {
    db.data.venues = [];
    const onOpen = cy.stub().as('open');
    mountWithApp(<OwnerVenuesPage onOpenAddVenueModal={onOpen} />, { role: 'owner' });
    cy.contains('h2', 'Створіть свій перший заклад');
    cy.contains('1. Створіть заклад');
    cy.contains('button', 'Створити заклад').click();
    cy.get('@open').should('have.been.calledOnce');
  });

  it('shows the loading error and retries', () => {
    failApi('GET', '/api/venues', 'Заклади недоступні');
    mountWithApp(<OwnerVenuesPage onOpenAddVenueModal={cy.stub()} />, { role: 'owner' });
    cy.get('[role="alert"]').should('contain', 'Заклади недоступні');
    cy.contains('button', 'Спробувати ще раз').click();
    cy.contains('h2', 'Активні заклади (2)');
  });
});

describe('AddVenueModal', () => {
  it('creates a venue of the selected type', () => {
    const onClose = cy.stub().as('close');
    mountWithApp(<AddVenueModal isOpen onClose={onClose} />, { role: 'owner' });
    cy.get('[role="dialog"]').should('have.attr', 'aria-label', 'Додати новий заклад');
    cy.get('#venueName').type('Espresso Bar №1');
    cy.contains('[role="combobox"]', 'Кав’ярня').click();
    cy.contains('[role="option"]', 'Пекарня').click();
    cy.get('#venueAddress').type('м. Львів, пл. Ринок, 1');
    cy.contains('button', 'Зберегти та почати').click();
    expectCall('POST', '/api/venues', {
      name: 'Espresso Bar №1',
      type: 'Пекарня',
      address: 'м. Львів, пл. Ринок, 1',
    });
    cy.get('@close').should('have.been.calledOnce');
    cy.wrap(null).should(() => expect(db.data.venues).to.have.length(3));
  });

  it('shows the duplicate name error and cancels', () => {
    const onClose = cy.stub().as('close');
    mountWithApp(<AddVenueModal isOpen onClose={onClose} />, { role: 'owner' });
    cy.get('#venueName').type('coffee corner • центр');
    cy.get('#venueAddress').type('Київ');
    cy.get('form').submit();
    cy.get('[role="alert"]').should('have.text', 'Заклад з такою назвою вже існує');
    cy.contains('button', 'Скасувати').click();
    cy.get('@close').should('have.been.calledOnce');
  });

  it('requires an address', () => {
    mountWithApp(<AddVenueModal isOpen onClose={cy.stub()} />, { role: 'owner' });
    cy.get('#venueName').type('Новий');
    cy.get('form').submit();
    cy.get('[role="alert"]').should('have.text', 'Заповніть назву та адресу');
  });
});
