import { useState } from 'react';
import Modal from '@/shared/ui/Modal';
import { formatUAH } from '@/shared/lib/format';
import type { PayoutMethod } from '@/types';
import page from '@/shared/styles/page.module.css';
import styles from './PayoutModal.module.css';

interface PayoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  total: number;
  count: number;
  venueLabel: string;
  period: string;
  isPending: boolean;
  error: string | null;
  onConfirm: (method: PayoutMethod) => Promise<number | undefined>;
}

export default function PayoutModal({
  isOpen,
  onClose,
  total,
  count,
  venueLabel,
  period,
  isPending,
  error,
  onConfirm,
}: PayoutModalProps) {
  const [method, setMethod] = useState<PayoutMethod>('iban');
  const [paidTotal, setPaidTotal] = useState<number | null>(null);
  const [paidPeriod, setPaidPeriod] = useState<string | null>(null);

  const close = () => {
    setPaidTotal(null);
    setPaidPeriod(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={close}
      title="Проведення виплати"
      subtitle={`${venueLabel} • період ${paidPeriod ?? period}`}
      icon={<span style={{ fontWeight: 700 }}>₴</span>}
    >
      {paidTotal !== null ? (
        <div className={styles.paidState}>
          <div className={styles.paidIcon}>✓</div>
          <h4 className={page.cardTitle}>Виплату проведено</h4>
          <p className={page.muted}>
            {formatUAH(paidTotal)} •{' '}
            {method === 'iban' ? 'банківський переказ (IBAN)' : 'видача готівкою'}. Статус змін
            змінено на «Виплачено», працівники отримали розрахункові листи.
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

          {error && (
            <div className={page.formError} role="alert">
              {error}
            </div>
          )}

          <div className={page.formActions}>
            <button type="button" className={page.ghostBtn} onClick={close}>
              Скасувати
            </button>
            <button
              type="button"
              className={page.primaryBtn}
              disabled={isPending || count === 0}
              onClick={async () => {
                const currentPeriod = period;
                const paid = await onConfirm(method);
                if (paid === undefined) return;
                setPaidPeriod(currentPeriod);
                setPaidTotal(paid);
              }}
            >
              {isPending ? 'Проводимо…' : 'Підтвердити виплату'}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
