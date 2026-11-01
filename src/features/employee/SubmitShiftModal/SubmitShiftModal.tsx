import React, { useState } from 'react';
import CustomDatePicker from '@/shared/ui/CustomDatePicker';
import CustomSelect from '@/shared/ui/CustomSelect';
import styles from './SubmitShiftModal.module.css';

interface SubmitShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitShift: (shift: {
    date: string;
    type: string;
    hours: number;
    amount: number;
    status: 'Підтверджено' | 'На модерації';
  }) => void;
}

export default function SubmitShiftModal({
  isOpen,
  onClose,
  onSubmitShift,
}: SubmitShiftModalProps) {
  const [shiftDate, setShiftDate] = useState('2026-09-25');
  const [shiftType, setShiftType] = useState('Денна зміна (08:00 - 20:00, перерва 30 хв)');
  const [hours, setHours] = useState('11.5');
  const [hourlyRate] = useState(90);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const h = parseFloat(hours) || 8;
    const formattedDate = shiftDate.includes('-')
      ? shiftDate.split('-').reverse().join('.')
      : shiftDate;
    onSubmitShift({
      date: formattedDate,
      type: shiftType,
      hours: h,
      amount: Math.round(h * hourlyRate),
      status: 'На модерації',
    });
    onClose();
  };

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true">
      <div className={styles.modal}>
        <button
          onClick={onClose}
          className={styles.closeButton}
          aria-label="Закрити модальне вікно"
        >
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className={styles.header}>
          <div className={styles.iconWrapper} aria-hidden="true">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className={styles.headerText}>
            <h3 className={styles.title}>Подати робочу зміну</h3>
            <p className={styles.subtitle}>Coffee Corner • Центр (Ставка: 90 ₴ / год)</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Дата зміни</label>
            <CustomDatePicker value={shiftDate} onChange={setShiftDate} />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Тип зміни та графік</label>
            <CustomSelect
              value={shiftType}
              onChange={(val) => {
                setShiftType(val);
                if (val.includes('11.5')) setHours('11.5');
                else if (val.includes('8.0')) setHours('8.0');
                else if (val.includes('6.0')) setHours('6.0');
              }}
              options={[
                {
                  value: 'Денна зміна (08:00 - 20:00, перерва 30 хв)',
                  label: 'Денна зміна (08:00 - 20:00, перерва 30 хв) — 11.5 год',
                },
                {
                  value: 'Ранкова зміна (08:00 - 16:00, без перерви)',
                  label: 'Ранкова зміна (08:00 - 16:00, без перерви) — 8.0 год',
                },
                {
                  value: 'Вечірня зміна (16:00 - 22:00, без перерви)',
                  label: 'Вечірня зміна (16:00 - 22:00, без перерви) — 6.0 год',
                },
              ]}
            />
          </div>

          <div className={styles.gridTwo}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Кількість годин</label>
              <input
                type="number"
                step="0.5"
                min="1"
                max="24"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                className={styles.input}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Орієнтовна виплата</label>
              <div className={styles.estimateBox}>{(parseFloat(hours) || 0) * 90} ₴</div>
            </div>
          </div>

          <div className={styles.actions}>
            <button type="button" onClick={onClose} className={styles.cancelButton}>
              Скасувати
            </button>
            <button type="submit" className={styles.submitButton}>
              Відправити на модерацію
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
