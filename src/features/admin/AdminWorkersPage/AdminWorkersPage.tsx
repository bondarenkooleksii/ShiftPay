import { useEffect, useState } from 'react';
import PageHeader from '@/shared/layout/PageHeader';
import ConfirmDialog from '@/shared/ui/ConfirmDialog';
import QueryState from '@/shared/ui/QueryState';
import { useAuth } from '@/api/auth';
import { useDutyWorkers, useUpdateDuty } from '@/api/shifts';
import { getInitials } from '@/shared/lib/format';
import type { DutyStatus, DutyWorker } from '@/types';
import page from '@/shared/styles/page.module.css';
import styles from './AdminWorkersPage.module.css';
const STATUS_META: Record<DutyStatus, { label: string; badge: string }> = {
  active: { label: 'На зміні', badge: page.badgeSuccess },
  break: { label: 'На перерві (30 хв)', badge: page.badgeWarning },
  finished: { label: 'Зміну завершено', badge: page.badgeMuted },
};

const formatElapsed = (minutes: number) => `${Math.floor(minutes / 60)} год ${minutes % 60} хв`;

const elapsedMinutes = (w: DutyWorker, now: number) =>
  w.workedMinutes ?? Math.max(0, Math.round((now - Date.parse(w.startedAt)) / 60_000));

export default function AdminWorkersPage() {
  const { user } = useAuth();
  const dutyQuery = useDutyWorkers();
  const updateDuty = useUpdateDuty();
  const [now, setNow] = useState(() => Date.now());
  const [clockingOut, setClockingOut] = useState<DutyWorker | null>(null);
  const [adjustedHours, setAdjustedHours] = useState('');

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);

  const workers = dutyQuery.data ?? [];

  const counts = {
    active: workers.filter((w) => w.status === 'active').length,
    break: workers.filter((w) => w.status === 'break').length,
    finished: workers.filter((w) => w.status === 'finished').length,
  };

  const today = new Date(now).toLocaleDateString('uk-UA', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    weekday: 'long',
  });

  return (
    <div className={page.page}>
      <PageHeader
        title="Працівники на зміні"
        crumbs={[user?.venue ?? 'Заклад', 'Відвідуваність']}
        right={<span className={`${page.badge} ${page.badgeInfo}`}>{today}</span>}
      />

      <div className={page.content}>
        <div className={page.inner}>
          <div className={page.grid3}>
            <div className={page.kpiCard}>
              <span className={page.kpiLabel}>Зараз на зміні</span>
              <span className={page.kpiValue}>{counts.active}</span>
            </div>
            <div className={page.kpiCard}>
              <span className={page.kpiLabel}>На перерві</span>
              <span className={page.kpiValue}>{counts.break}</span>
            </div>
            <div className={page.kpiCard}>
              <span className={page.kpiLabel}>Завершили зміну</span>
              <span className={page.kpiValue}>{counts.finished}</span>
            </div>
          </div>

          <div>
            <h2 className={page.sectionTitle}>Графік на сьогодні</h2>
            <p className={page.sectionSubtitle}>Відвідуваність персоналу в реальному часі</p>
          </div>

          <QueryState
            isLoading={dutyQuery.isLoading}
            error={dutyQuery.error ?? updateDuty.error}
            onRetry={dutyQuery.refetch}
          />

          <div className={styles.grid}>
            {workers.map((w) => {
              const meta = STATUS_META[w.status];
              return (
                <article key={w.id} className={`${page.card} ${styles.workerCard}`}>
                  <div className={styles.cardTop}>
                    <div className={page.personCell}>
                      <div className={page.avatar}>{getInitials(w.name)}</div>
                      <div>
                        <span className={page.personName}>{w.name}</span>
                        <span className={page.personSub}>{w.role}</span>
                      </div>
                    </div>
                    <span className={`${page.badge} ${meta.badge}`}>
                      <span className={page.dot} />
                      {meta.label}
                    </span>
                  </div>

                  <div className={styles.timerRow}>
                    <div>
                      <span className={page.kpiLabel}>За графіком</span>
                      <span className={styles.timerValue}>{w.scheduled}</span>
                    </div>
                    <div>
                      <span className={page.kpiLabel}>Відпрацьовано</span>
                      <span className={styles.timerValue}>
                        {formatElapsed(elapsedMinutes(w, now))}
                      </span>
                    </div>
                  </div>

                  {w.status !== 'finished' && (
                    <div className={styles.actions}>
                      <button
                        type="button"
                        className={`${page.secondaryBtn} ${page.smallBtn}`}
                        disabled={updateDuty.isPending}
                        onClick={() =>
                          updateDuty.mutate({
                            id: w.id,
                            status: w.status === 'break' ? 'active' : 'break',
                          })
                        }
                      >
                        {w.status === 'break' ? 'Повернути з перерви' : 'Відправити на перерву'}
                      </button>
                      <button
                        type="button"
                        className={page.linkBtnDanger}
                        onClick={() => {
                          setClockingOut(w);
                          setAdjustedHours((elapsedMinutes(w, now) / 60).toFixed(1));
                        }}
                      >
                        Завершити раніше
                      </button>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={clockingOut !== null}
        title="Завершити зміну раніше?"
        message={`Зміну працівника ${clockingOut?.name ?? ''} буде закрито зараз і автоматично внесено в журнал як підтверджену. За потреби скоригуйте кількість зарахованих годин.`}
        confirmLabel="Завершити зміну"
        onCancel={() => setClockingOut(null)}
        onConfirm={() => {
          if (clockingOut) {
            const minutes =
              Math.round(Number(adjustedHours) * 60) || elapsedMinutes(clockingOut, now);
            updateDuty.mutate({ id: clockingOut.id, status: 'finished', workedMinutes: minutes });
          }
          setClockingOut(null);
        }}
      >
        <div className={page.formGroup}>
          <label className={page.label} htmlFor="adjustedHours">
            Зарахувати годин
          </label>
          <input
            id="adjustedHours"
            type="number"
            step={0.5}
            min={0}
            value={adjustedHours}
            onChange={(e) => setAdjustedHours(e.target.value)}
            className={page.input}
          />
        </div>
      </ConfirmDialog>
    </div>
  );
}
