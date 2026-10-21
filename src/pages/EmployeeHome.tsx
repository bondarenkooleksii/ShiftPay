import React, { useState } from 'react';
import Header from '../components/Header';
import styles from './EmployeeHome.module.css';

interface ShiftItem {
  id: string;
  date: string;
  type: string;
  hours: number;
  amount: number;
  status: 'Підтверджено' | 'На модерації';
}

interface EmployeeHomeProps {
  shifts: ShiftItem[];
  onOpenSubmitShiftModal: () => void;
}

export default function EmployeeHome({ shifts, onOpenSubmitShiftModal }: EmployeeHomeProps) {
  const [selectedMonth, setSelectedMonth] = useState('Вересень 2026');
  const [shiftFilter, setShiftFilter] = useState<'all' | 'confirmed' | 'pending'>('all');
  const [bannerConfirmed, setBannerConfirmed] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  const filteredShifts = shifts.filter((s) => {
    if (shiftFilter === 'confirmed') return s.status === 'Підтверджено';
    if (shiftFilter === 'pending') return s.status === 'На модерації';
    return true;
  });

  return (
    <div className={styles.container}>
      <Header
        title="Особистий кабінет"
        subtitleOrBadge={
          <div className={styles.venueBadge}>
            <span className={styles.pulseDot} />
            <span>Coffee Corner • Центр</span>
          </div>
        }
        rightContent={
          <>
            <div>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className={styles.select}
              >
                <option value="Вересень 2026">Вересень 2026</option>
                <option value="Серпень 2026">Серпень 2026</option>
                <option value="Липень 2026">Липень 2026</option>
              </select>
            </div>

            <button
              type="button"
              className={styles.iconButton}
              title="Сповіщення"
              aria-label="Сповіщення"
            >
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
                />
              </svg>
              <span className={styles.badgeNotification} />
            </button>

            <button
              type="button"
              onClick={onOpenSubmitShiftModal}
              className={styles.submitShiftButton}
            >
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              <span>Подати зміну</span>
            </button>
          </>
        }
      />

      <main className={styles.main}>
        {!bannerConfirmed ? (
          <div className={styles.bannerNotice}>
            <div className={styles.bannerLeft}>
              <div className={styles.bannerIcon} aria-hidden="true">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
                  />
                </svg>
              </div>
              <p className={styles.bannerText}>
                Власник надіслав виплату <strong>8 280 ₴</strong> за першу половину вересня.
                Перегляньте чек.
              </p>
            </div>

            <div className={styles.bannerActions}>
              <button
                type="button"
                onClick={() => setShowReceiptModal(true)}
                className={styles.bannerLink}
              >
                Переглянути квитанцію
              </button>
              <button
                type="button"
                onClick={() => setBannerConfirmed(true)}
                className={styles.bannerConfirmBtn}
              >
                <span>Гроші прийшли</span>
                <span>✓</span>
              </button>
            </div>
          </div>
        ) : (
          <div className={styles.bannerSuccess}>
            <div className={styles.bannerSuccessLeft}>
              <span className={styles.bannerSuccessIcon}>✓</span>
              <span>
                Виплату 8 280 ₴ успішно підтверджено працівником. Дякуємо за оперативність!
              </span>
            </div>
            <button onClick={() => setBannerConfirmed(false)} className={styles.restoreBannerBtn}>
              Відновити банер
            </button>
          </div>
        )}

        <section aria-label="Метрики та баланс" className={styles.metricsGrid}>
          <div className={styles.metricCard}>
            <div className={styles.metricHeader}>
              <span className={styles.metricLabel}>Поточний баланс</span>
              <span className={styles.metricBadgeWaiting}>В очікуванні</span>
            </div>
            <div className={styles.metricValueRow}>
              <span className={styles.metricValue}>8 280 ₴</span>
            </div>
            <div className={styles.metricFooter}>
              <span>
                <strong>8 змін</strong> •{' '}
                <span style={{ color: '#d97706', fontWeight: 500 }}>
                  (Очікує підтвердження: 8 280 ₴)
                </span>
              </span>
            </div>
          </div>

          <div className={styles.metricCard}>
            <div className={styles.metricHeader}>
              <span className={styles.metricLabel}>Відпрацьований час</span>
              <span className={styles.metricBadgePlan}>57% плану</span>
            </div>
            <div className={styles.metricValueRow}>
              <span className={styles.metricValue}>92.0 год</span>
            </div>
            <div className={styles.metricFooter}>
              <span>Норма місяця: 160 год (57%)</span>
              <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: '57%' }} />
              </div>
            </div>
          </div>

          <div className={styles.metricCard}>
            <div className={styles.metricHeader}>
              <span className={styles.metricLabel}>Моя ставка</span>
              <span className={styles.metricBadgeHourly}>Погодинна</span>
            </div>
            <div className={styles.metricValueRow}>
              <span className={styles.metricValue}>90 ₴</span>
              <span className={styles.metricUnit}>/ год</span>
            </div>
            <div className={styles.metricFooter}>
              <div className={styles.metricBonus}>
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                <span>+400 ₴ бонусів за чистоту та сервіс</span>
              </div>
            </div>
          </div>
        </section>

        <section aria-label="Останні відпрацьовані зміни" className={styles.shiftsSection}>
          <div className={styles.shiftsHeader}>
            <div>
              <h2 className={styles.shiftsTitle}>Останні відпрацьовані зміни</h2>
              <p className={styles.shiftsSubtitle}>
                Деталізація часу, тривалості та нарахованої суми
              </p>
            </div>

            <div className={styles.filterGroup}>
              <button
                type="button"
                onClick={() => setShiftFilter('all')}
                className={`${styles.filterBtn} ${shiftFilter === 'all' ? styles.filterBtnActive : ''}`}
              >
                Всі ({shifts.length})
              </button>
              <button
                type="button"
                onClick={() => setShiftFilter('confirmed')}
                className={`${styles.filterBtn} ${shiftFilter === 'confirmed' ? styles.filterBtnActive : ''}`}
              >
                Підтверджені
              </button>
              <button
                type="button"
                onClick={() => setShiftFilter('pending')}
                className={`${styles.filterBtn} ${shiftFilter === 'pending' ? styles.filterBtnActive : ''}`}
              >
                На перевірці
              </button>
            </div>
          </div>

          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Дата</th>
                  <th>Тип зміни та деталі</th>
                  <th>Години</th>
                  <th>Сума до виплати</th>
                  <th className={styles.textRight}>Статус</th>
                </tr>
              </thead>
              <tbody>
                {filteredShifts.map((shift) => (
                  <tr key={shift.id}>
                    <td className={styles.shiftDate}>{shift.date}</td>
                    <td>
                      <div className={styles.shiftType}>
                        <span className={styles.shiftDot} />
                        <span>{shift.type}</span>
                      </div>
                    </td>
                    <td className={styles.shiftHours}>{shift.hours.toFixed(1)} год</td>
                    <td className={styles.shiftAmount}>{shift.amount.toLocaleString('uk-UA')} ₴</td>
                    <td className={styles.textRight}>
                      {shift.status === 'Підтверджено' ? (
                        <span className={styles.statusConfirmed}>
                          <span className={styles.statusDotConfirmed} />
                          <span>Підтверджено</span>
                        </span>
                      ) : (
                        <span className={styles.statusPending}>
                          <span className={styles.statusDotPending} />
                          <span>На модерації</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section aria-label="Останні закриті виплати" className={styles.archiveSection}>
          <div className={styles.archiveLeft}>
            <div className={styles.archiveIcon} aria-hidden="true">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                />
              </svg>
            </div>
            <div>
              <span className={styles.archiveLabel}>Останні закриті виплати</span>
              <p className={styles.archiveText}>
                <strong>15.09.2026</strong> — <span className={styles.archiveAmount}>7 600 ₴</span>{' '}
                <span className={styles.archiveFile}>[Файл: receipt_mono_15_09.png]</span>
              </p>
            </div>
          </div>

          <div className={styles.archiveRight}>
            <span className={styles.badgePaid}>Оплачено</span>
            <button
              type="button"
              onClick={() => setShowReceiptModal(true)}
              className={styles.downloadBtn}
            >
              Завантажити чек ↗
            </button>
          </div>
        </section>
      </main>

      {showReceiptModal && (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true">
          <div className={styles.modalCard}>
            <button
              onClick={() => setShowReceiptModal(false)}
              className={styles.modalCloseBtn}
              aria-label="Закрити квитанцію"
            >
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className={styles.receiptHeader}>
              <div className={styles.receiptCheck}>✓</div>
              <h3 className={styles.receiptTitle}>Офіційна квитанція ShiftPay</h3>
              <p className={styles.receiptSubtitle}>Платіжне доручення №SP-98214-UA</p>
            </div>

            <div className={styles.receiptDetails}>
              <div className={styles.receiptRow}>
                <span className={styles.receiptRowLabel}>Отримувач:</span>
                <span className={styles.receiptRowValue}>Олексій Бондаренко (IBAN: UA•••4921)</span>
              </div>
              <div className={styles.receiptRow}>
                <span className={styles.receiptRowLabel}>Заклад:</span>
                <span className={styles.receiptRowValue}>Coffee Corner Центр</span>
              </div>
              <div className={styles.receiptRow}>
                <span className={styles.receiptRowLabel}>Період:</span>
                <span className={styles.receiptRowValue}>01.09.2026 — 15.09.2026</span>
              </div>
              <div className={styles.receiptRow}>
                <span className={styles.receiptRowLabel}>Сума виплати:</span>
                <span className={styles.receiptAmount}>8 280,00 ₴</span>
              </div>
            </div>

            <div className={styles.receiptFooter}>
              <button
                type="button"
                onClick={() => setShowReceiptModal(false)}
                className={styles.receiptCloseBtn}
              >
                Закрити
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
