import { useState } from 'react';
import Modal from '@/shared/ui/Modal';
import { formatUAH } from '@/shared/lib/format';
import page from '@/shared/styles/page.module.css';
import styles from './PayoutModal.module.css';

interface PayoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  total: number;
  count: number;
  venueLabel: string;
  onConfirm: () => void;
}

export default function PayoutModal({
  isOpen,
  onClose,
  total,
  count,
  venueLabel,
  onConfirm,
}: PayoutModalProps) {
  const [method, setMethod] = useState<'cash' | 'iban'>('iban');
  const [paidTotal, setPaidTotal] = useState<number | null>(null);

  const close = () => {
    setPaidTotal(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={close}
      title="Проведення виплати"
      subtitle={`${venueLabel} • період 16.09 – 30.09.2026`}
      icon={<span style={{ fontWeight: 700 }}>₴</span>}
    >
      {paidTotal !== null ? (
        <div className={styles.paidState}>
          <div className={styles.paidIcon}>✓</div>
          <h4 className={page.cardTitle}>Виплату проведено</h4>
          <p className={page.muted}>
            {formatUAH(paidTotal)} •{' '}
            {method === 'iban' ? 'банківський переказ (IBAN)' : 'видача готівкою'}. Статус змін
            змінено на «Виплачено».
          </p>
          <button type="button" className={page.primaryBtn} onClick={close}>
            Готово
          </button>
        </div>
      ) : (
        <div className={page.form}>
          <div className={styles.totalBox}>
            <span className={page.kpiLabel}>До виплати за {count} змін</span>
            <span className={styles.totalValue}>{formatUAH(total)}</span>
          </div>

          <div className={page.formGroup}>
            <span className={page.label}>Спосіб виплати</span>
            <div className={styles.methodGrid}>
              <button
                type="button"
                aria-pressed={method === 'iban'}
                className={`${styles.methodCard} ${method === 'iban' ? styles.methodCardActive : ''}`}
                onClick={() => setMethod('iban')}
              >
                <span className={page.toggleTitle}>🏦 Переказ на IBAN</span>
                <span className={page.toggleDesc}>На рахунки працівників</span>
              </button>
              <button
                type="button"
                aria-pressed={method === 'cash'}
                className={`${styles.methodCard} ${method === 'cash' ? styles.methodCardActive : ''}`}
                onClick={() => setMethod('cash')}
              >
                <span className={page.toggleTitle}>💵 Готівка</span>
                <span className={page.toggleDesc}>Видача в закладі</span>
              </button>
            </div>
          </div>

          <div className={page.formActions}>
            <button type="button" className={page.ghostBtn} onClick={close}>
              Скасувати
            </button>
            <button
              type="button"
              className={page.primaryBtn}
              onClick={() => {
                setPaidTotal(total);
                onConfirm();
              }}
            >
              Підтвердити виплату
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
