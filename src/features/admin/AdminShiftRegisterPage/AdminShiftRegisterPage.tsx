import React, { useState } from 'react';
import CustomDatePicker from '@/shared/ui/CustomDatePicker';
import CustomSelect from '@/shared/ui/CustomSelect';
import NotificationsPopover from '@/shared/layout/NotificationsPopover';
import styles from './AdminShiftRegisterPage.module.css';

export interface ShiftRecord {
  id: string;
  workerName: string;
  role: string;
  timeRange: string;
  breakDuration: string;
  hours: string;
  note: string;
  status: 'Підтверджено' | 'Очікує перевірки';
}

export default function AdminShiftRegisterPage() {
  const [filterTab, setFilterTab] = useState<'all' | 'pending'>('all');

  const [formDate, setFormDate] = useState('2026-09-24');
  const [worker, setWorker] = useState('Бондаренко Олексій (Бариста)');
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('20:00');
  const [breakOption, setBreakOption] = useState('30 хв (обід)');
  const [comment, setComment] = useState('');
  const [showSavedToast, setShowSavedToast] = useState(false);

  const [shifts, setShifts] = useState<ShiftRecord[]>([
    {
      id: 'shift-adm-1',
      workerName: 'Шевченко Л.',
      role: 'Бариста',
      timeRange: '08:00 - 16:00',
      breakDuration: '0 хв',
      hours: '8.0 год',
      note: 'Вчасно',
      status: 'Підтверджено',
    },
    {
      id: 'shift-adm-2',
      workerName: 'Бондаренко О.',
      role: 'Бариста',
      timeRange: '08:00 - 20:00',
      breakDuration: '30 хв',
      hours: '11.5 год',
      note: 'Попередня заявка підтверджена',
      status: 'Підтверджено',
    },
    {
      id: 'shift-adm-3',
      workerName: 'Коваленко Д.',
      role: 'Помічник бариста',
      timeRange: '12:00 - 20:30',
      breakDuration: '30 хв',
      hours: '8.0 год',
      note: 'Вийшов на вечірнє посилення / прибирання',
      status: 'Очікує перевірки',
    },
  ]);

  const calculateTotalHours = () => {
    try {
      const [sh, sm] = startTime.split(':').map(Number);
      const [eh, em] = endTime.split(':').map(Number);
      let diffMinutes = eh * 60 + em - (sh * 60 + sm);
      if (diffMinutes < 0) diffMinutes += 24 * 60;
      if (breakOption.includes('30')) {
        diffMinutes = Math.max(0, diffMinutes - 30);
      } else if (breakOption.includes('60') || breakOption.includes('1 год')) {
        diffMinutes = Math.max(0, diffMinutes - 60);
      }
      return (diffMinutes / 60).toFixed(1);
    } catch {
      return '11.5';
    }
  };

  const handleConfirmShift = (id: string) => {
    setShifts((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: 'Підтверджено' as const } : s))
    );
  };

  const handleSubmitNewShift = (e: React.FormEvent) => {
    e.preventDefault();
    const calculatedHours = `${calculateTotalHours()} год`;
    const newRecord: ShiftRecord = {
      id: `shift-adm-${Date.now()}`,
      workerName: worker.split(' ')[0] + ' ' + (worker.split(' ')[1]?.[0] || '') + '.',
      role: worker.includes('Бариста') ? 'Бариста' : 'Офіціант',
      timeRange: `${startTime} - ${endTime}`,
      breakDuration: breakOption.split(' ')[0] + ' хв',
      hours: calculatedHours,
      note: comment.trim() || 'Внесено адміністратором',
      status: 'Підтверджено',
    };
    setShifts((prev) => [newRecord, ...prev]);
    setComment('');
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 2500);
  };

  const filteredShifts = shifts.filter((s) => {
    if (filterTab === 'pending') return s.status === 'Очікує перевірки';
    return true;
  });

  const pendingCount = shifts.filter((s) => s.status === 'Очікує перевірки').length;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.headerTitle}>Журнал робочих змін</h1>
          <div className={styles.venueBadge}>
            <span className={styles.pulseDot} />
            <span>Coffee Corner • Центр</span>
          </div>
        </div>

        <div className={styles.headerRight}>
          <div className={styles.datePill}>
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.75 3v2.25M17.25 3v2.253M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
              />
            </svg>
            <span>24 вересня 2026, Четвер</span>
          </div>

          <NotificationsPopover />

          <div className={styles.activeShiftPill}>
            <span className={styles.pulseDot} />
            <span>Зміна активна • 3 на зміні</span>
          </div>
        </div>
      </header>

      <main className={styles.mainLayout}>
        <section className={styles.formSidebar}>
          <div className={styles.formCard}>
            <div className={styles.formCardHeader}>
              <h2 className={styles.formTitle}>Внести відпрацьовану зміну</h2>
              <p className={styles.formSubtitle}>Зафіксуйте явку та години персоналу</p>
            </div>

            <form onSubmit={handleSubmitNewShift} className={styles.form}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Дата <span className={styles.requiredAsterisk}>*</span>
                </label>
                <CustomDatePicker value={formDate} onChange={setFormDate} />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Працівник <span className={styles.requiredAsterisk}>*</span>
                </label>
                <CustomSelect
                  value={worker}
                  onChange={setWorker}
                  options={[
                    'Бондаренко Олексій (Бариста)',
                    'Шевченко Лілія (Бариста)',
                    'Коваленко Дмитро (Помічник бариста)',
                    'Мельник Анна (Касир)',
                  ]}
                />
              </div>

              <div className={styles.gridTwo}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Початок</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className={`${styles.input} ${styles.timeInput}`}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Кінець</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className={`${styles.input} ${styles.timeInput}`}
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Перерва</label>
                <CustomSelect
                  value={breakOption}
                  onChange={setBreakOption}
                  options={[
                    '0 хв (без перерви)',
                    '30 хв (обід)',
                    '45 хв (обід + кава)',
                    '60 хв (1 год перерва)',
                  ]}
                />
              </div>

              <div className={styles.totalHoursBox}>
                <div className={styles.totalHoursLeft}>
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>Всього зараховано:</span>
                </div>
                <span className={styles.totalHoursValue}>{calculateTotalHours()} год</span>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Коментар / Коригування</label>
                <input
                  type="text"
                  placeholder="наприклад, вийшов на заміну / прибирання"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className={styles.input}
                />
              </div>

              {showSavedToast && (
                <div className={styles.savedToast}>
                  <span className={styles.toastCheck}>✓</span>
                  <span>Зміну успішно збережено в журнал!</span>
                </div>
              )}

              <button type="submit" className={styles.saveShiftButton}>
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                <span>Зберегти зміну в журнал</span>
              </button>
            </form>
          </div>
        </section>

        <section className={styles.contentRight}>
          <div className={styles.statsRow}>
            <div className={styles.statCard}>
              <div className={styles.statLeft}>
                <div className={styles.statIconPrimary} aria-hidden="true">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
                    />
                  </svg>
                </div>
                <div>
                  <span className={styles.statLabel}>Працівників сьогодні</span>
                  <span className={styles.statValue}>3</span>
                </div>
              </div>
              <span className={styles.statBadgeSuccess}>На зміні</span>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statLeft}>
                <div className={styles.statIconPrimary} aria-hidden="true">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <span className={styles.statLabel}>Зараховано годин сьогодні</span>
                  <span className={styles.statValue}>27.5 год</span>
                </div>
              </div>
              <span className={styles.statBadgeSky}>Сумарний час</span>
            </div>
          </div>

          <div className={styles.tableSection}>
            <div className={styles.tableHeaderRow}>
              <div>
                <h3 className={styles.tableSectionTitle}>Журнал змін за сьогодні</h3>
                <p className={styles.tableSectionSubtitle}>
                  Операційний контроль відпрацьованого часу персоналу
                </p>
              </div>

              <div className={styles.filterGroup}>
                <button
                  type="button"
                  onClick={() => {
                    setFilterTab('all');
                  }}
                  className={`${styles.filterBtn} ${filterTab === 'all' ? styles.filterBtnActive : ''}`}
                >
                  Всі ({shifts.length})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFilterTab('pending');
                  }}
                  className={`${styles.filterBtn} ${filterTab === 'pending' ? styles.filterBtnActive : ''}`}
                >
                  <span>Потребують підтвердження</span>
                  <span className={styles.pendingBadgeCount}>{pendingCount}</span>
                </button>
              </div>
            </div>

            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Працівник</th>
                    <th>Інтервал</th>
                    <th>Перерва</th>
                    <th>Години</th>
                    <th>Примітка</th>
                    <th className={styles.textRight}>Статус / Дія</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredShifts.map((row) => (
                    <tr key={row.id}>
                      <td>
                        <div className={styles.workerCell}>
                          <div className={styles.workerAvatar}>{row.workerName.slice(0, 2)}</div>
                          <div>
                            <span className={styles.workerName}>{row.workerName}</span>
                            <span className={styles.workerRole}>{row.role}</span>
                          </div>
                        </div>
                      </td>

                      <td className={styles.timeRange}>{row.timeRange}</td>
                      <td className={styles.breakDuration}>{row.breakDuration}</td>
                      <td className={styles.hoursValue}>{row.hours}</td>
                      <td>
                        <span className={styles.noteBadge} title={row.note}>
                          {row.note}
                        </span>
                      </td>

                      <td className={styles.textRight}>
                        {row.status === 'Підтверджено' ? (
                          <span className={styles.statusConfirmed}>
                            <span className={styles.statusDotConfirmed} />
                            <span>Підтверджено</span>
                          </span>
                        ) : (
                          <div className={styles.pendingActionGroup}>
                            <span className={styles.statusWaiting}>
                              <span className={styles.statusDotWaiting} />
                              <span>Очікує</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => handleConfirmShift(row.id)}
                              className={styles.confirmShiftBtn}
                            >
                              <span>✓</span>
                              <span>Підтвердити</span>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
