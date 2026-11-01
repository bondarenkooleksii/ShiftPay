import { useEffect, useState } from 'react';
import PageHeader from '@/shared/layout/PageHeader';
import ConfirmDialog from '@/shared/ui/ConfirmDialog';
import { initialDutyWorkers } from '@/mocks/workers';
import type { DutyStatus, DutyWorker } from '@/types';
import page from '@/shared/styles/page.module.css';
import styles from './AdminWorkersPage.module.css';

const STATUS_META: Record<DutyStatus, { label: string; badge: string }> = {
  active: { label: 'На зміні', badge: page.badgeSuccess },
  break: { label: 'На перерві (30 хв)', badge: page.badgeWarning },
  finished: { label: 'Зміну завершено', badge: page.badgeMuted },
};

const formatElapsed = (minutes: number) => `${Math.floor(minutes / 60)} год ${minutes % 60} хв`;

export default function AdminWorkersPage() {
  const [workers, setWorkers] = useState<DutyWorker[]>(initialDutyWorkers);
  const [clockingOut, setClockingOut] = useState<DutyWorker | null>(null);
  const [adjustedHours, setAdjustedHours] = useState('');

  useEffect(() => {
    const id = setInterval(() => {
      setWorkers((prev) =>
        prev.map((w) =>
          w.status === 'active' ? { ...w, startedMinutesAgo: w.startedMinutesAgo + 1 } : w
        )
      );
    }, 60_000);
    return () => clearInterval(id);
  }, []);

  const update = (id: string, patch: Partial<DutyWorker>) =>
    setWorkers((prev) => prev.map((w) => (w.id === id ? { ...w, ...patch } : w)));

  const counts = {
    active: workers.filter((w) => w.status === 'active').length,
    break: workers.filter((w) => w.status === 'break').length,
    finished: workers.filter((w) => w.status === 'finished').length,
  };

  return (
    <div className={page.page}>
      <PageHeader
        title="Працівники на зміні"
        crumbs={['Coffee Corner • Центр', 'Відвідуваність']}
        right={<span className={`${page.badge} ${page.badgeInfo}`}>24 вересня 2026, Четвер</span>}
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

          <div className={styles.grid}>
            {workers.map((w) => {
              const meta = STATUS_META[w.status];
              return (
                <article key={w.id} className={`${page.card} ${styles.workerCard}`}>
                  <div className={styles.cardTop}>
                    <div className={page.personCell}>
                      <div className={page.avatar}>
                        {w.name
                          .split(' ')
                          .map((p) => p[0])
                          .join('')}
                      </div>
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
                        {formatElapsed(w.startedMinutesAgo)}
                      </span>
                    </div>
                  </div>

                  {w.status !== 'finished' && (
                    <div className={styles.actions}>
                      <button
                        type="button"
                        className={`${page.secondaryBtn} ${page.smallBtn}`}
                        onClick={() =>
                          update(w.id, { status: w.status === 'break' ? 'active' : 'break' })
                        }
                      >
                        {w.status === 'break' ? 'Повернути з перерви' : 'Відправити на перерву'}
                      </button>
                      <button
                        type="button"
                        className={page.linkBtnDanger}
                        onClick={() => {
                          setClockingOut(w);
                          setAdjustedHours((w.startedMinutesAgo / 60).toFixed(1));
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
        message={`Зміну працівника ${clockingOut?.name ?? ''} буде закрито зараз. За потреби скоригуйте кількість зарахованих годин.`}
        confirmLabel="Завершити зміну"
        onCancel={() => setClockingOut(null)}
        onConfirm={() => {
          if (clockingOut) {
            const minutes = Math.round(Number(adjustedHours) * 60) || clockingOut.startedMinutesAgo;
            update(clockingOut.id, { status: 'finished', startedMinutesAgo: minutes });
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
