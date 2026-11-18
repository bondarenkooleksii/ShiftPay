import { useState } from 'react';
import Modal from '@/shared/ui/Modal';
import { formatUAH, payslipNet } from '@/shared/lib/format';
import type { Payslip } from '@/types';
import page from '@/shared/styles/page.module.css';
import styles from './PayslipModal.module.css';

function downloadReceipt(p: Payslip) {
  const lines = [
    `ShiftPay — розрахунковий лист ${p.receipt}`,
    `Період: ${p.period}`,
    `Дата виплати: ${p.paidOn}`,
    `Години: ${p.hours} × ${p.rate} ₴`,
    `Бонус: ${p.bonus} ₴`,
    `Утримання: ${p.deduction} ₴`,
    `До виплати: ${formatUAH(payslipNet(p))}`,
  ];
  const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${p.receipt}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function PayslipModal({
  payslip,
  onClose,
}: {
  payslip: Payslip | null;
  onClose: () => void;
}) {
  const [downloaded, setDownloaded] = useState(false);

  const close = () => {
    setDownloaded(false);
    onClose();
  };

  return (
    <Modal
      isOpen={payslip !== null}
      onClose={close}
      title={`Розрахунковий лист ${payslip?.receipt ?? ''}`}
      subtitle={payslip ? `Період ${payslip.period}` : undefined}
      width={460}
      icon={
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
          />
        </svg>
      }
    >
      {payslip && (
        <>
          <div className={styles.receipt}>
            <div className={styles.receiptRow}>
              <span>Базова ставка</span>
              <span>
                {payslip.hours} год × {payslip.rate} ₴
              </span>
            </div>
            <div className={styles.receiptRow}>
              <span>Нараховано</span>
              <span>{formatUAH(payslip.hours * payslip.rate)}</span>
            </div>
            <div className={styles.receiptRow}>
              <span>Бонус</span>
              <span className={styles.plus}>+ {formatUAH(payslip.bonus)}</span>
            </div>
            <div className={styles.receiptRow}>
              <span>Утримання</span>
              <span className={styles.minus}>− {formatUAH(payslip.deduction)}</span>
            </div>
            <div className={`${styles.receiptRow} ${styles.receiptTotal}`}>
              <span>До виплати</span>
              <span>{formatUAH(payslipNet(payslip))}</span>
            </div>
            <p className={page.hint}>
              Виплачено {payslip.paidOn} •{' '}
              {payslip.method === 'iban' ? 'переказ на IBAN' : 'готівка'} •{' '}
              {payslip.confirmedAt ? 'отримання підтверджено' : 'очікує підтвердження'}
            </p>
          </div>

          <div className={page.formActions} style={{ marginTop: 16 }}>
            {downloaded && <span className={page.inlineSuccess}>✓ Файл завантажено</span>}
            <button
              type="button"
              className={page.primaryBtn}
              onClick={() => {
                downloadReceipt(payslip);
                setDownloaded(true);
              }}
            >
              Завантажити чек (.txt)
            </button>
          </div>
        </>
      )}
    </Modal>
  );
}
