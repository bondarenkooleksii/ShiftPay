import React, { useState } from 'react';
import CustomDatePicker from '@/shared/ui/CustomDatePicker';
import CustomSelect from '@/shared/ui/CustomSelect';
import { useAuth } from '@/api/auth';
import { useTemplates } from '@/api/organization';
import { useCreateShift } from '@/api/shifts';
import { formatHours, formatUAH } from '@/shared/lib/format';
import { calcHours, todayIso } from '@/shared/lib/payroll';
import page from '@/shared/styles/page.module.css';
import styles from './SubmitShiftModal.module.css';

interface SubmitShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CUSTOM = 'custom';

export default function SubmitShiftModal({ isOpen, onClose }: SubmitShiftModalProps) {
  const { user } = useAuth();
  const { data: templates = [] } = useTemplates();
  const createShift = useCreateShift();

  const [shiftDate, setShiftDate] = useState(todayIso());
  const [templateId, setTemplateId] = useState('tpl1');
  const [start, setStart] = useState('08:00');
  const [end, setEnd] = useState('20:00');
  const [breakMinutes, setBreakMinutes] = useState('30');
  const [note, setNote] = useState('');

  if (!isOpen) return null;

  const rate = user?.rate ?? 0;
  const hours = calcHours(start, end, Number(breakMinutes) || 0);

  const applyTemplate = (id: string) => {
    setTemplateId(id);
    const template = templates.find((t) => t.id === id);
    if (!template) return;
    setStart(template.start);
    setEnd(template.end);
    setBreakMinutes(String(template.breakMinutes));
  };

  const close = () => {
    createShift.reset();
    setNote('');
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const created = await createShift.mutate({
      date: shiftDate,
      start,
      end,
      breakMinutes: Number(breakMinutes) || 0,
      templateId: templateId === CUSTOM ? undefined : templateId,
      note,
    });
    if (created) close();
  };

  const options = [
    ...templates.map((t) => ({
      value: t.id,
      label: `${t.name} (${t.start} - ${t.end}, перерва ${t.breakMinutes} хв) — ${formatHours(
        calcHours(t.start, t.end, t.breakMinutes)
      )}`,
    })),
    { value: CUSTOM, label: 'Інший час (вказати вручну)' },
  ];

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true">
      <div className={styles.modal}>
        <button onClick={close} className={styles.closeButton} aria-label="Закрити модальне вікно">
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
            <p className={styles.subtitle}>
              {user?.venue} (Ставка: {rate} ₴ / год)
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Дата зміни</label>
            <CustomDatePicker value={shiftDate} onChange={setShiftDate} />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Тип зміни та графік</label>
            <CustomSelect value={templateId} onChange={applyTemplate} options={options} />
          </div>

          <div className={styles.gridTwo}>
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="shiftStart">
                Початок
              </label>
              <input
                id="shiftStart"
                type="time"
                required
                value={start}
                onChange={(e) => {
                  setStart(e.target.value);
                  setTemplateId(CUSTOM);
                }}
                className={styles.input}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="shiftEnd">
                Завершення
              </label>
              <input
                id="shiftEnd"
                type="time"
                required
                value={end}
                onChange={(e) => {
                  setEnd(e.target.value);
                  setTemplateId(CUSTOM);
                }}
                className={styles.input}
              />
            </div>
          </div>

          <div className={styles.gridTwo}>
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="shiftBreak">
                Перерва, хв
              </label>
              <input
                id="shiftBreak"
                type="number"
                step="5"
                min="0"
                max="180"
                value={breakMinutes}
                onChange={(e) => {
                  setBreakMinutes(e.target.value);
                  setTemplateId(CUSTOM);
                }}
                className={styles.input}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Орієнтовна виплата</label>
              <div className={styles.estimateBox}>
                {formatHours(hours)} • {formatUAH(Math.round(hours * rate))}
              </div>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="shiftNote">
              Коментар для адміністратора
            </label>
            <input
              id="shiftNote"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="наприклад, залишився на прибирання після закриття"
              className={styles.input}
            />
          </div>

          {createShift.error && (
            <div className={page.formError} role="alert">
              {createShift.error.message}
            </div>
          )}

          <div className={styles.actions}>
            <button type="button" onClick={close} className={styles.cancelButton}>
              Скасувати
            </button>
            <button type="submit" className={styles.submitButton} disabled={createShift.isPending}>
              {createShift.isPending ? 'Надсилаємо…' : 'Відправити на модерацію'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
