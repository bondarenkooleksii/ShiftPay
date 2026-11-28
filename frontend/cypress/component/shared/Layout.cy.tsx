import Header from '../../../src/shared/layout/Header';
import PageHeader from '../../../src/shared/layout/PageHeader';
import NotificationsPopover from '../../../src/shared/layout/NotificationsPopover';
import Sidebar, { type SidebarItem } from '../../../src/shared/layout/Sidebar';

describe('Header', () => {
  it('renders title, badge and right content', () => {
    cy.mount(
      <Header
        title="Заклади"
        subtitleOrBadge={<em>бейдж</em>}
        rightContent={<button>Дія</button>}
      />
    );
    cy.contains('h1', 'Заклади');
    cy.contains('em', 'бейдж');
    cy.contains('button', 'Дія');
  });
});

describe('PageHeader', () => {
  it('renders breadcrumbs with the last one active', () => {
    cy.mount(
      <PageHeader
        title="Команда"
        crumbs={['Власник', 'Команда']}
        right={<button>Запросити</button>}
      />
    );
    cy.get('nav[aria-label="Breadcrumb"] span').should('have.length', 3);
    cy.get('nav[aria-label="Breadcrumb"] span')
      .last()
      .should('have.text', 'Команда')
      .and('have.attr', 'class');
    cy.get('nav[aria-label="Breadcrumb"] span').first().should('not.have.attr', 'class');
    cy.contains('button', 'Запросити');
    cy.get('button[title="Сповіщення"]').should('exist');
  });
});

describe('NotificationsPopover', () => {
  it('opens, marks all as read and closes on outside click', () => {
    cy.mount(
      <div style={{ paddingLeft: 420 }}>
        <NotificationsPopover className="extra" />
        <button type="button">зовні</button>
      </div>
    );
    cy.get('.extra').should('exist');
    cy.get('button[title="Сповіщення"]')
      .should('have.attr', 'aria-label', 'Сповіщення: 3 непрочитаних')
      .click();
    cy.get('[aria-label="Список сповіщень"]').should('contain', 'Сповіщення (3)');
    cy.get('[aria-label="Список сповіщень"]').trigger('mousedown', { force: true });
    cy.get('[aria-label="Список сповіщень"]').should('exist');
    cy.contains('button', 'Прочитати всі').click();
    cy.get('[aria-label="Список сповіщень"]').should('not.contain', '(3)');
    cy.get('button[title="Сповіщення"]').should('have.attr', 'aria-label', 'Сповіщення');
    cy.contains('button', 'зовні').trigger('mousedown', { force: true });
    cy.get('[aria-label="Список сповіщень"]').should('not.exist');
    cy.get('button[title="Сповіщення"]').click();
    cy.get('[aria-label="Список сповіщень"]').should('exist');
    cy.get('button[title="Сповіщення"]').click({ force: true });
    cy.get('[aria-label="Список сповіщень"]').should('not.exist');
  });

  it('starts without the badge when there are no unread items', () => {
    cy.mount(<NotificationsPopover hasUnread={false} />);
    cy.get('button[title="Сповіщення"] span').should('not.exist');
  });
});

describe('Sidebar', () => {
  const items: SidebarItem[] = [
    { id: 'a', label: 'Перший', icon: 'building' },
    { id: 'b', label: 'Другий', icon: 'users', dividerBefore: true },
  ];

  it('renders navigation, badges and profile and reports actions', () => {
    const onSelect = cy.stub().as('select');
    const onLogout = cy.stub().as('logout');
    const onRoleSwitch = cy.stub().as('switch');
    cy.mount(
      <Sidebar
        roleName="Власник"
        items={items}
        activeId="a"
        onSelect={onSelect}
        badges={{ b: '2 нових' }}
        user={{
          initials: 'ОБ',
          name: 'Олексій',
          roleLabel: 'Власник бізнесу',
          venueLabel: 'Центр',
        }}
        onLogout={onLogout}
        onRoleSwitch={onRoleSwitch}
      />
    );
    cy.contains('button', 'Перший').should('have.attr', 'aria-current', 'page');
    cy.contains('button', 'Другий').should('contain', '2 нових');
    cy.contains('button', 'Другий').should('not.have.attr', 'aria-current');
    cy.contains('ОБ');
    cy.contains('Центр');
    cy.contains('button', 'Другий').click();
    cy.get('@select').should('have.been.calledWithMatch', { id: 'b' });
    cy.get('button[title="Вийти з акаунту"]').click();
    cy.get('@logout').should('have.been.calledOnce');
    cy.contains('button', 'Власник').click();
    cy.get('@switch').should('have.been.calledOnce');
  });

  it('works without badges and venue', () => {
    cy.mount(
      <Sidebar
        roleName="Працівник"
        items={items}
        onSelect={cy.stub()}
        user={{ initials: 'П', name: 'Петро', roleLabel: 'Бариста' }}
        onLogout={cy.stub()}
      />
    );
    cy.get('[aria-current="page"]').should('not.exist');
    cy.contains('Петро');
  });
});
