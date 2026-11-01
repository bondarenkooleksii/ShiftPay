import { useState } from 'react';
import PageHeader from '@/shared/layout/PageHeader';
import ConfirmDialog from '@/shared/ui/ConfirmDialog';
import type { AdjustmentRequest } from '@/types';
import page from '@/shared/styles/page.module.css';
import styles from './AdminAdjustmentsPage.module.css';

interface AdminAdjustmentsPageProps {
  requests: AdjustmentRequest[];
  onChange: (requests: AdjustmentRequest[]) => void;
}

const STATUS_META: Record<AdjustmentRequest['status'], { label: string; badge: string }> = {
  pending: { label: 'На розгляді', badge: page.badgeWarning },
  approved: { label: 'Погоджено', badge: page.badgeSuccess },
  rejected: { label: 'Відхилено', badge: page.badgeDanger },
  clarify: { label: 'Потрібне уточнення', badge: page.badgeInfo },
};

const toMinutes = (t: string) => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};

const workedHours = (start: string, end: string, breakMin: number) =>
  (toMinutes(end) - toMinutes(start) - breakMin) / 60;

export default function AdminAdjustmentsPage({ requests, onChange }: AdminAdjustmentsPageProps) {
  const [tab, setTab] = useState<'pending' | 'all'>('pending');
  const [selectedId, setSelectedId] = useState<string | null>(requests[0]?.id ?? null);
  const [reason, setReason] = useState('');
  const [isRejectOpen, setIsRejectOpen] = useState(false);

  const list = requests.filter((r) => tab === 'all' || r.status === 'pending');
  const selected = requests.find((r) => r.id === selectedId) ?? list[0] ?? null;

  const decide = (status: AdjustmentRequest['status']) => {
    if (!selected) return;
    onChange(requests.map((r) => (r.id === selected.id ? { ...r, status } : r)));
    setReason('');
  };

  const submitted = selected
    ? workedHours(selected.submittedStart, selected.submittedEnd, selected.submittedBreak)
    : 0;
  const scheduled = selected
    ? workedHours(selected.scheduledStart, selected.scheduledEnd, selected.scheduledBreak)
    : 0;
  const delta = submitted - scheduled;

  return (
    <div className={page.page}>
      <PageHeader title="Коригування заявок" crumbs={['Coffee Corner • Центр', 'Коригування']} />

      <div className={page.content}>
        <div className={`${page.inner} ${styles.layout}`}>
          <aside className={styles.listCol}>
            <div className={page.segmented}>
              <button
                type="button"
                className={`${page.segmentedBtn} ${tab === 'pending' ? page.segmentedBtnActive : ''}`}
                onClick={() => setTab('pending')}
              >
                На розгляді ({requests.filter((r) => r.status === 'pending').length})
              </button>
              <button
                type="button"
                className={`${page.segmentedBtn} ${tab === 'all' ? page.segmentedBtnActive : ''}`}
                onClick={() => setTab('all')}
              >
                Усі ({requests.length})
              </button>
            </div>

            {list.length === 0 && (
              <div className={`${page.card} ${page.emptyState}`}>Усі заявки розглянуто 🎉</div>
            )}

            {list.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setSelectedId(r.id)}
                className={`${styles.requestItem} ${selected?.id === r.id ? styles.requestItemActive : ''}`}
              >
                <div className={styles.requestTop}>
                  <span className={page.personName}>{r.worker}</span>
                  <span className={`${page.badge} ${STATUS_META[r.status].badge}`}>
                    {STATUS_META[r.status].label}
                  </span>
                </div>
                <span className={page.personSub}>
                  {r.date} • {r.role}
                </span>
              </button>
            ))}
          </aside>

          {selected && (
            <section className={page.card}>
              <div className={page.cardHeader}>
                <div>
                  <h3 className={page.cardTitle}>
                    {selected.worker} • {selected.date}
                  </h3>
                  <p className={page.cardSubtitle}>{selected.role}</p>
                </div>
                <span
                  className={`${page.badge} ${delta >= 0 ? page.badgeInfo : page.badgeDanger} ${styles.delta}`}
                >
                  {delta >= 0 ? '+' : '−'}
                  {Math.abs(delta).toFixed(1)} год {delta > 0 ? 'понаднормово' : ''}
                </span>
              </div>

              <div className={styles.compare}>
                <div className={`${styles.compareCol} ${styles.compareSubmitted}`}>
                  <span className={page.kpiLabel}>Час, поданий працівником</span>
                  <span className={styles.compareTime}>
                    {selected.submittedStart} – {selected.submittedEnd}
                  </span>
                  <span className={page.muted}>
                    Перерва {selected.submittedBreak} хв • {submitted.toFixed(1)} год
                  </span>
                </div>
                <div className={styles.compareCol}>
                  <span className={page.kpiLabel}>Зміна за графіком</span>
                  <span className={styles.compareTime}>
                    {selected.scheduledStart} – {selected.scheduledEnd}
                  </span>
                  <span className={page.muted}>
                    Перерва {selected.scheduledBreak} хв • {scheduled.toFixed(1)} год
                  </span>
                </div>
              </div>

              <div className={styles.note}>
                <span className={page.kpiLabel}>Коментар працівника</span>
                <p>«{selected.workerNote}»</p>
              </div>

              {selected.status === 'pending' ? (
                <>
                  <div className={page.formGroup}>
                    <label className={page.label} htmlFor="adjReason">
                      Причина коригування
                    </label>
                    <input
                      id="adjReason"
                      placeholder="наприклад, пішов на 30 хв раніше через малу кількість гостей"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className={page.input}
                    />
                  </div>

                  <div className={page.formActions} style={{ marginTop: 16 }}>
                    <button
                      type="button"
                      className={page.linkBtnDanger}
                      onClick={() => setIsRejectOpen(true)}
                    >
                      Відхилити
                    </button>
                    <button
                      type="button"
                      className={page.secondaryBtn}
                      onClick={() => decide('clarify')}
                    >
                      Запросити уточнення
                    </button>
                    <button
                      type="button"
                      className={page.primaryBtn}
                      onClick={() => decide('approved')}
                    >
                      Погодити з коригуванням
                    </button>
                  </div>
                </>
              ) : (
                <div className={page.formActions}>
                  <span className={`${page.badge} ${STATUS_META[selected.status].badge}`}>
                    Рішення: {STATUS_META[selected.status].label}
                  </span>
                  <button type="button" className={page.ghostBtn} onClick={() => decide('pending')}>
                    Повернути на розгляд
                  </button>
                </div>
              )}
            </section>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={isRejectOpen}
        title="Відхилити заявку?"
        message={`Зміну працівника ${selected?.worker ?? ''} не буде зараховано. Працівник отримає сповіщення.`}
        confirmLabel="Відхилити"
        onCancel={() => setIsRejectOpen(false)}
        onConfirm={() => {
          decide('rejected');
          setIsRejectOpen(false);
        }}
      />
    </div>
  );
}
