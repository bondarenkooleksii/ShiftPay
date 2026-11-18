import React, { useState } from 'react';
import CustomDatePicker from '@/shared/ui/CustomDatePicker';
import CustomSelect from '@/shared/ui/CustomSelect';
import QueryState from '@/shared/ui/QueryState';
import NotificationsPopover from '@/shared/layout/NotificationsPopover';
import { useAuth } from '@/api/auth';
import { useTeam } from '@/api/organization';
import { useCreateShift, useDutyWorkers, useShifts, useUpdateShift } from '@/api/shifts';
import { formatDate, formatHours, getInitials } from '@/shared/lib/format';
import { calcHours, SHIFT_STATUS_LABEL, sumHours, todayIso } from '@/shared/lib/payroll';
import type { ShiftStatus } from '@/types';
import page from '@/shared/styles/page.module.css';
import styles from './AdminShiftRegisterPage.module.css';

const BREAK_OPTIONS = [
  { value: '0', label: '0 хв (без перерви)' },
  { value: '30', label: '30 хв (обід)' },
  { value: '45', label: '45 хв (обід + кава)' },
  { value: '60', label: '60 хв (1 год перерва)' },
];

const isWaiting = (status: ShiftStatus) => status === 'pending' || status === 'clarify';

const formatDayLabel = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString('uk-UA', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    weekday: 'long',
  });

export default function AdminShiftRegisterPage() {
  const { user } = useAuth();
  const shiftsQuery = useShifts();
  const { data: team = [] } = useTeam();
  const { data: duty = [] } = useDutyWorkers();
  const createShift = useCreateShift();
  const updateShift = useUpdateShift();

  const [filterTab, setFilterTab] = useState<'all' | 'pending'>('all');
  const [formDate, setFormDate] = useState<string | null>(null);
  const [workerId, setWorkerId] = useState('');
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('20:00');
  const [breakMinutes, setBreakMinutes] = useState('30');
  const [comment, setComment] = useState('');
  const [showSavedToast, setShowSavedToast] = useState(false);

  const allShifts = shiftsQuery.data ?? [];
  const date = formDate ?? allShifts[0]?.date ?? todayIso();
  const activeTeam = team.filter((m) => m.active);
  const selectedWorker = workerId || activeTeam[0]?.id || '';

  const dayShifts = allShifts.filter((s) => s.date === date && s.status !== 'rejected');
  const filteredShifts = dayShifts.filter((s) => filterTab === 'all' || isWaiting(s.status));
  const pendingCount = dayShifts.filter((s) => isWaiting(s.status)).length;
  const onDuty = duty.filter((d) => d.status !== 'finished').length;
  const totalHours = calcHours(startTime, endTime, Number(breakMinutes));

  const handleConfirmShift = (id: string) => updateShift.mutate({ id, status: 'confirmed' });

  const handleSubmitNewShift = async (e: React.FormEvent) => {
    e.preventDefault();
    const created = await createShift.mutate({
      workerId: selectedWorker,
      date,
      start: startTime,
      end: endTime,
      breakMinutes: Number(breakMinutes),
      note: comment.trim() || 'Внесено адміністратором',
    });
    if (!created) return;
    setComment('');
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 2500);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.headerTitle}>Журнал робочих змін</h1>
          <div className={styles.venueBadge}>
            <span className={styles.pulseDot} />
            <span>{user?.venue}</span>
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
            <span>{formatDayLabel(date)}</span>
          </div>

          <NotificationsPopover />

          <div className={styles.activeShiftPill}>
            <span className={styles.pulseDot} />
            <span>Зміна активна • {onDuty} на зміні</span>
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
                <CustomDatePicker value={date} onChange={setFormDate} />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Працівник <span className={styles.requiredAsterisk}>*</span>
                </label>
                <CustomSelect
                  value={selectedWorker}
                  onChange={setWorkerId}
                  options={activeTeam.map((m) => ({ value: m.id, label: `${m.name} (${m.role})` }))}
                  ariaLabel="Працівник"
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
                  value={breakMinutes}
                  onChange={setBreakMinutes}
                  options={BREAK_OPTIONS}
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
                <span className={styles.totalHoursValue}>{formatHours(totalHours)}</span>
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

              {createShift.error && (
                <div className={page.formError} role="alert">
                  {createShift.error.message}
                </div>
              )}

              {showSavedToast && (
                <div className={styles.savedToast}>
                  <span className={styles.toastCheck}>✓</span>
                  <span>Зміну успішно збережено в журнал!</span>
                </div>
              )}

              <button
                type="submit"
                className={styles.saveShiftButton}
                disabled={createShift.isPending || !selectedWorker}
              >
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
                  <span className={styles.statLabel}>Працівників за день</span>
                  <span className={styles.statValue}>
                    {new Set(dayShifts.map((s) => s.workerId)).size}
                  </span>
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
                  <span className={styles.statLabel}>Зараховано годин за день</span>
                  <span className={styles.statValue}>
                    {formatHours(sumHours(dayShifts.filter((s) => !isWaiting(s.status))))}
                  </span>
                </div>
              </div>
              <span className={styles.statBadgeSky}>Сумарний час</span>
            </div>
          </div>

          <div className={styles.tableSection}>
            <div className={styles.tableHeaderRow}>
              <div>
                <h3 className={styles.tableSectionTitle}>Журнал змін за {formatDate(date)}</h3>
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
                  Всі ({dayShifts.length})
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

            <QueryState
              isLoading={shiftsQuery.isLoading}
              error={shiftsQuery.error ?? updateShift.error}
              onRetry={shiftsQuery.refetch}
            />

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
                          <div className={styles.workerAvatar}>{getInitials(row.workerName)}</div>
                          <div>
                            <span className={styles.workerName}>{row.workerName}</span>
                            <span className={styles.workerRole}>{row.role}</span>
                          </div>
                        </div>
                      </td>

                      <td className={styles.timeRange}>
                        {row.start} - {row.end}
                      </td>
                      <td className={styles.breakDuration}>{row.breakMinutes} хв</td>
                      <td className={styles.hoursValue}>{formatHours(row.hours)}</td>
                      <td>
                        <span className={styles.noteBadge} title={row.note}>
                          {row.note ?? (row.source === 'admin' ? 'Внесено адміністратором' : '—')}
                        </span>
                      </td>

                      <td className={styles.textRight}>
                        {!isWaiting(row.status) ? (
                          <span className={styles.statusConfirmed}>
                            <span className={styles.statusDotConfirmed} />
                            <span>{SHIFT_STATUS_LABEL[row.status]}</span>
                          </span>
                        ) : (
                          <div className={styles.pendingActionGroup}>
                            <span className={styles.statusWaiting}>
                              <span className={styles.statusDotWaiting} />
                              <span>{SHIFT_STATUS_LABEL[row.status]}</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => handleConfirmShift(row.id)}
                              disabled={updateShift.isPending}
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
              {shiftsQuery.data && filteredShifts.length === 0 && (
                <div className={page.emptyState}>За цей день змін ще немає</div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
