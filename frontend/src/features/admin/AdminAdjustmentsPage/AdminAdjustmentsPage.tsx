import { useState } from 'react';
import PageHeader from '@/shared/layout/PageHeader';
import ConfirmDialog from '@/shared/ui/ConfirmDialog';
import QueryState from '@/shared/ui/QueryState';
import { useAuth } from '@/api/auth';
import { useTemplates } from '@/api/organization';
import { useShifts, useUpdateShift } from '@/api/shifts';
import { formatDate } from '@/shared/lib/format';
import { calcHours, SHIFT_STATUS_LABEL } from '@/shared/lib/payroll';
import type { Shift, ShiftStatus, ShiftUpdate } from '@/types';
import page from '@/shared/styles/page.module.css';
import styles from './AdminAdjustmentsPage.module.css';

const STATUS_BADGE: Record<ShiftStatus, string> = {
  pending: page.badgeWarning,
  confirmed: page.badgeSuccess,
  rejected: page.badgeDanger,
  clarify: page.badgeInfo,
  paid: page.badgeMuted,
};

const needsReview = (s: Shift) => s.status === 'pending' || s.status === 'clarify';

export default function AdminAdjustmentsPage() {
  const { user } = useAuth();
  const shiftsQuery = useShifts();
  const { data: templates = [] } = useTemplates();
  const updateShift = useUpdateShift();

  const [tab, setTab] = useState<'pending' | 'all'>('pending');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [isRejectOpen, setIsRejectOpen] = useState(false);

  const requests = (shiftsQuery.data ?? []).filter((s) => s.source === 'employee');
  const list = requests.filter((r) => tab === 'all' || needsReview(r));
  const selected = list.find((r) => r.id === selectedId) ?? list[0] ?? null;
  const template = templates.find((t) => t.id === selected?.templateId);

  const decide = async (patch: Omit<ShiftUpdate, 'adminReason'>) => {
    if (!selected) return;
    const updated = await updateShift.mutate({
      id: selected.id,
      ...patch,
      adminReason: reason.trim() || undefined,
    });
    if (updated) setReason('');
  };

  const submitted = selected?.hours ?? 0;
  const scheduled = template ? calcHours(template.start, template.end, template.breakMinutes) : 0;
  const delta = template ? submitted - scheduled : 0;

  return (
    <div className={page.page}>
      <PageHeader title="Коригування заявок" crumbs={[user?.venue ?? 'Заклад', 'Коригування']} />

      <div className={page.content}>
        <QueryState
          isLoading={shiftsQuery.isLoading}
          error={shiftsQuery.error}
          onRetry={shiftsQuery.refetch}
        />

        {shiftsQuery.data && (
          <div className={`${page.inner} ${styles.layout}`}>
            <aside className={styles.listCol}>
              <div className={page.segmented}>
                <button
                  type="button"
                  className={`${page.segmentedBtn} ${tab === 'pending' ? page.segmentedBtnActive : ''}`}
                  onClick={() => setTab('pending')}
                >
                  На розгляді ({requests.filter(needsReview).length})
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
                  onClick={() => {
                    setSelectedId(r.id);
                    setReason('');
                    updateShift.reset();
                  }}
                  className={`${styles.requestItem} ${selected?.id === r.id ? styles.requestItemActive : ''}`}
                >
                  <div className={styles.requestTop}>
                    <span className={page.personName}>{r.workerName}</span>
                    <span className={`${page.badge} ${STATUS_BADGE[r.status]}`}>
                      {SHIFT_STATUS_LABEL[r.status]}
                    </span>
                  </div>
                  <span className={page.personSub}>
                    {formatDate(r.date)} • {r.role}
                  </span>
                </button>
              ))}
            </aside>

            {selected && (
              <section className={page.card}>
                <div className={page.cardHeader}>
                  <div>
                    <h3 className={page.cardTitle}>
                      {selected.workerName} • {formatDate(selected.date)}
                    </h3>
                    <p className={page.cardSubtitle}>{selected.role}</p>
                  </div>
                  {template && (
                    <span
                      className={`${page.badge} ${delta >= 0 ? page.badgeInfo : page.badgeDanger} ${styles.delta}`}
                    >
                      {delta >= 0 ? '+' : '−'}
                      {Math.abs(delta).toFixed(1)} год {delta > 0 ? 'понаднормово' : ''}
                    </span>
                  )}
                </div>

                <div className={styles.compare}>
                  <div className={`${styles.compareCol} ${styles.compareSubmitted}`}>
                    <span className={page.kpiLabel}>Час, поданий працівником</span>
                    <span className={styles.compareTime}>
                      {selected.start} – {selected.end}
                    </span>
                    <span className={page.muted}>
                      Перерва {selected.breakMinutes} хв • {submitted.toFixed(1)} год
                    </span>
                  </div>
                  <div className={styles.compareCol}>
                    <span className={page.kpiLabel}>Зміна за графіком</span>
                    {template ? (
                      <>
                        <span className={styles.compareTime}>
                          {template.start} – {template.end}
                        </span>
                        <span className={page.muted}>
                          {template.name} • перерва {template.breakMinutes} хв •{' '}
                          {scheduled.toFixed(1)} год
                        </span>
                      </>
                    ) : (
                      <span className={page.muted}>Позапланова зміна (без шаблону)</span>
                    )}
                  </div>
                </div>

                <div className={styles.note}>
                  <span className={page.kpiLabel}>Коментар працівника</span>
                  <p>{selected.note ? `«${selected.note}»` : 'Без коментаря'}</p>
                </div>

                {selected.adminReason && (
                  <div className={styles.note}>
                    <span className={page.kpiLabel}>Рішення адміністратора</span>
                    <p>«{selected.adminReason}»</p>
                  </div>
                )}

                {updateShift.error && (
                  <div className={page.formError} role="alert" style={{ marginTop: 12 }}>
                    {updateShift.error.message}
                  </div>
                )}

                {needsReview(selected) ? (
                  <>
                    <div className={page.formGroup}>
                      <label className={page.label} htmlFor="adjReason">
                        Причина коригування / коментар
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
                        disabled={updateShift.isPending}
                        onClick={() => decide({ status: 'clarify' })}
                      >
                        Запросити уточнення
                      </button>
                      {template && delta !== 0 && (
                        <button
                          type="button"
                          className={page.secondaryBtn}
                          disabled={updateShift.isPending}
                          onClick={() =>
                            decide({
                              status: 'confirmed',
                              start: template.start,
                              end: template.end,
                              breakMinutes: template.breakMinutes,
                            })
                          }
                        >
                          Погодити за графіком
                        </button>
                      )}
                      <button
                        type="button"
                        className={page.primaryBtn}
                        disabled={updateShift.isPending}
                        onClick={() => decide({ status: 'confirmed' })}
                      >
                        Погодити як подано
                      </button>
                    </div>
                  </>
                ) : (
                  <div className={page.formActions}>
                    <span className={`${page.badge} ${STATUS_BADGE[selected.status]}`}>
                      Рішення: {SHIFT_STATUS_LABEL[selected.status]}
                    </span>
                    {selected.status !== 'paid' && (
                      <button
                        type="button"
                        className={page.ghostBtn}
                        disabled={updateShift.isPending}
                        onClick={() => decide({ status: 'pending' })}
                      >
                        Повернути на розгляд
                      </button>
                    )}
                  </div>
                )}
              </section>
            )}
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={isRejectOpen}
        title="Відхилити заявку?"
        message={`Зміну працівника ${selected?.workerName ?? ''} не буде зараховано. Вкажіть причину — працівник побачить її у своєму кабінеті.`}
        confirmLabel="Відхилити"
        onCancel={() => setIsRejectOpen(false)}
        onConfirm={() => {
          decide({ status: 'rejected' });
          setIsRejectOpen(false);
        }}
      >
        <div className={page.formGroup}>
          <label className={page.label} htmlFor="rejectReason">
            Причина відхилення
          </label>
          <input
            id="rejectReason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className={page.input}
          />
        </div>
      </ConfirmDialog>
    </div>
  );
}
