import React from 'react';
import Modal from './Modal';
import page from '../styles/page.module.css';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  children?: React.ReactNode;
}

// Red-styled confirmation for destructive actions (deactivate, reject, clock out early).
export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Підтвердити',
  cancelLabel = 'Скасувати',
  onConfirm,
  onCancel,
  children,
}: ConfirmDialogProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title={title}
      tone="danger"
      width={440}
      icon={
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
          />
        </svg>
      }
    >
      <p className={page.muted} style={{ fontSize: 14, marginBottom: children ? 16 : 0 }}>
        {message}
      </p>
      {children}
      <div className={page.formActions} style={{ marginTop: 20 }}>
        <button type="button" onClick={onCancel} className={page.ghostBtn}>
          {cancelLabel}
        </button>
        <button type="button" onClick={onConfirm} className={page.dangerBtn}>
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
