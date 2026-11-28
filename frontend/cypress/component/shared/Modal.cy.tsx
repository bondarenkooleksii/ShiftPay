import Modal from '../../../src/shared/ui/Modal';
import ConfirmDialog from '../../../src/shared/ui/ConfirmDialog';

describe('Modal', () => {
  it('does not render when closed', () => {
    cy.mount(
      <Modal isOpen={false} onClose={cy.stub()} title="Прихована">
        <p>Вміст</p>
      </Modal>
    );
    cy.get('[role="dialog"]').should('not.exist');
  });

  it('renders title, subtitle, icon and content', () => {
    cy.mount(
      <Modal
        isOpen
        onClose={cy.stub()}
        title="Заголовок"
        subtitle="Підзаголовок"
        icon={<b>i</b>}
        width={300}
      >
        <p>Вміст модалки</p>
      </Modal>
    );
    cy.get('[role="dialog"]').should('have.attr', 'aria-label', 'Заголовок');
    cy.get('[role="dialog"]').should('have.css', 'width', '300px');
    cy.contains('h3', 'Заголовок');
    cy.contains('Підзаголовок');
    cy.contains('b', 'i');
    cy.contains('Вміст модалки');
  });

  it('closes by button, Escape and overlay click but not by click inside', () => {
    const onClose = cy.stub().as('close');
    cy.mount(
      <Modal isOpen onClose={onClose} title="Закриття">
        <p>Текст</p>
      </Modal>
    );
    cy.contains('p', 'Текст').trigger('mousedown', { force: true });
    cy.get('@close').should('not.have.been.called');
    cy.get('button[aria-label="Закрити"]').click();
    cy.get('@close').should('have.been.calledOnce');
    cy.get('body').type('{esc}');
    cy.get('@close').should('have.been.calledTwice');
    cy.get('body').type('a');
    cy.get('@close').should('have.been.calledTwice');
    cy.get('[role="dialog"]').parent().trigger('mousedown', { force: true });
    cy.get('@close').should('have.been.calledThrice');
  });
});

describe('ConfirmDialog', () => {
  it('uses default labels and calls callbacks', () => {
    const onConfirm = cy.stub().as('confirm');
    const onCancel = cy.stub().as('cancel');
    cy.mount(
      <ConfirmDialog
        isOpen
        title="Видалити?"
        message="Дію не можна скасувати"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    );
    cy.contains('h3', 'Видалити?');
    cy.contains('Дію не можна скасувати');
    cy.contains('button', 'Підтвердити').click();
    cy.get('@confirm').should('have.been.calledOnce');
    cy.contains('button', 'Скасувати').click();
    cy.get('@cancel').should('have.been.calledOnce');
  });

  it('renders custom labels and extra content', () => {
    cy.mount(
      <ConfirmDialog
        isOpen
        title="Деактивувати"
        message="Працівник втратить доступ"
        confirmLabel="Так"
        cancelLabel="Ні"
        onConfirm={cy.stub()}
        onCancel={cy.stub()}
      >
        <textarea placeholder="Причина" />
      </ConfirmDialog>
    );
    cy.contains('button', 'Так');
    cy.contains('button', 'Ні');
    cy.get('textarea[placeholder="Причина"]').should('exist');
  });
});
