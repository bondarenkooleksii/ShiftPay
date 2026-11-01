import React, { useState } from 'react';
import PageHeader from '@/shared/layout/PageHeader';
import CustomSelect from '@/shared/ui/CustomSelect';
import QueryState from '@/shared/ui/QueryState';
import StatusFlow, { type FlowStep } from '@/shared/ui/StatusFlow';
import { useVenues } from '@/api/organization';
import { usePayout } from '@/api/payroll';
import { useShifts } from '@/api/shifts';
import { formatDate, formatUAH } from '@/shared/lib/format';
import {
  isPayable,
  periodLabel,
  SHIFT_STATUS_LABEL,
  shiftAmount,
  sumAmount,
  sumHours,
} from '@/shared/lib/payroll';
import type { PayoutMethod, Shift, ShiftStatus } from '@/types';
import page from '@/shared/styles/page.module.css';
import PayoutModal from './PayoutModal';
import styles from './OwnerShiftsPage.module.css';

const ALL_VENUES = 'Усі заклади';

type Stage = 'review' | 'confirmed' | 'paid';

const STAGE_OF: Partial<Record<ShiftStatus, Stage>> = {
  pending: 'review',
  clarify: 'review',
  confirmed: 'confirmed',
  paid: 'paid',
};

const STAGES: Omit<FlowStep<Stage>, 'count' | 'amount'>[] = [
  {
    key: 'review',
    label: 'Чекає адміністратора',
    hint: 'Ще не перевірено — не до виплати',
    tone: 'warning',
  },
  {
    key: 'confirmed',
    label: 'До виплати',
    hint: 'Підтверджено — увійде в найближчу виплату',
    tone: 'info',
  },
  { key: 'paid', label: 'Виплачено', hint: 'Працівники отримали чеки', tone: 'success' },
];

const STATUS_BADGE: Record<ShiftStatus, string> = {
  confirmed: page.badgeInfo,
  pending: page.badgeWarning,
  clarify: page.badgeWarning,
  rejected: page.badgeDanger,
  paid: page.badgeSuccess,
};

export default function OwnerShiftsPage() {
  const shiftsQuery = useShifts();
  const { data: venues = [] } = useVenues();
  const payout = usePayout();
  const shifts = (shiftsQuery.data ?? []).filter((s) => s.status !== 'rejected');
  const [venueFilter, setVenueFilter] = useState(ALL_VENUES);
  const [groupBy, setGroupBy] = useState<'date' | 'worker'>('date');
  const [isPayoutOpen, setIsPayoutOpen] = useState(false);
  const [stage, setStage] = useState<Stage | null>(null);

  const visible = shifts.filter((s) => venueFilter === ALL_VENUES || s.venue === venueFilter);
  const accrued = visible.filter((s) => s.status === 'confirmed' || s.status === 'paid');
  const totalHours = sumHours(accrued);
  const totalAccrued = sumAmount(accrued);
  const payable = visible.filter(isPayable);
  const pendingPayout = sumAmount(payable);

  const steps: FlowStep<Stage>[] = STAGES.map((st) => {
    const inStage = visible.filter((s) => STAGE_OF[s.status] === st.key);
    return { ...st, count: inStage.length, amount: formatUAH(sumAmount(inStage)) };
  });
  const stageLabel = STAGES.find((st) => st.key === stage)?.label;
  const listed = visible.filter((s) => !stage || STAGE_OF[s.status] === stage);

  const groups = listed.reduce<Record<string, Shift[]>>((acc, s) => {
    const key = groupBy === 'date' ? formatDate(s.date) : s.workerName;
    (acc[key] ??= []).push(s);
    return acc;
  }, {});

  const runPayout = async (method: PayoutMethod) => {
    const result = await payout.mutate({
      method,
      venue: venueFilter === ALL_VENUES ? undefined : venueFilter,
    });
    return result?.total;
  };

  return (
    <div className={page.page}>
      <PageHeader
        title="Зміни та виплати"
        crumbs={['Головна', 'Зміни та виплати']}
        right={
          <button
            type="button"
            className={page.primaryBtn}
            onClick={() => setIsPayoutOpen(true)}
            disabled={payable.length === 0}
          >
            <span>Провести виплату</span>
          </button>
        }
      />

      <div className={page.content}>
        <div className={page.inner}>
          <div className={page.grid3}>
            <div className={page.kpiCard}>
              <span className={page.kpiLabel}>Відпрацьовано годин</span>
              <span className={page.kpiValue}>{totalHours.toFixed(1)} год</span>
              <span className={page.kpiHint}>{accrued.length} підтверджених змін</span>
            </div>
            <div className={page.kpiCard}>
              <span className={page.kpiLabel}>Нараховано зарплати</span>
              <span className={page.kpiValue}>{formatUAH(totalAccrued)}</span>
              <span className={page.kpiHint}>з урахуванням ставок</span>
            </div>
            <div className={`${page.kpiCard} ${styles.kpiAccent}`}>
              <span className={page.kpiLabel}>Очікує виплати</span>
              <span className={page.kpiValue}>{formatUAH(pendingPayout)}</span>
              <span className={page.kpiHint}>{payable.length} підтверджених змін</span>
            </div>
          </div>

          <StatusFlow
            title="Шлях змін до виплати"
            steps={steps}
            active={stage}
            onSelect={setStage}
          />

          <div className={page.toolbar}>
            <div>
              <h2 className={page.sectionTitle}>Реєстр змін мережі</h2>
              <p className={page.sectionSubtitle}>
                {stageLabel
                  ? `Показано лише етап «${stageLabel}» • ${listed.length} змін`
                  : 'Усі зміни за закладом і статусом. Сума групи — справа від дати'}
              </p>
            </div>
            <div className={page.toolbarGroup}>
              <div className={page.segmented} role="tablist" aria-label="Групування">
                <button
                  type="button"
                  role="tab"
                  aria-selected={groupBy === 'date'}
                  className={`${page.segmentedBtn} ${groupBy === 'date' ? page.segmentedBtnActive : ''}`}
                  onClick={() => setGroupBy('date')}
                >
                  За датою
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={groupBy === 'worker'}
                  className={`${page.segmentedBtn} ${groupBy === 'worker' ? page.segmentedBtnActive : ''}`}
                  onClick={() => setGroupBy('worker')}
                >
                  За працівником
                </button>
              </div>
              <div style={{ width: 240 }}>
                <CustomSelect
                  value={venueFilter}
                  onChange={setVenueFilter}
                  options={[ALL_VENUES, ...venues.map((v) => v.name)]}
                  ariaLabel="Фільтр за закладом"
                />
              </div>
            </div>
          </div>

          <QueryState
            isLoading={shiftsQuery.isLoading}
            error={shiftsQuery.error}
            onRetry={shiftsQuery.refetch}
          />

          <div className={page.tableWrap}>
            <table className={page.table}>
              <thead>
                <tr>
                  <th>{groupBy === 'date' ? 'Працівник' : 'Дата'}</th>
                  <th>Заклад</th>
                  <th>Години</th>
                  <th>Ставка</th>
                  <th>Сума</th>
                  <th className={page.textRight}>Статус</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(groups).map(([group, rows]) => (
                  <React.Fragment key={group}>
                    <tr className={page.groupRow}>
                      <td colSpan={6}>
                        {group} • {formatUAH(sumAmount(rows))}
                      </td>
                    </tr>
                    {rows.map((s) => (
                      <tr key={s.id}>
                        <td>
                          {groupBy === 'date' ? (
                            <>
                              <span className={page.personName}>{s.workerName}</span>
                              <span className={page.personSub}>{s.role}</span>
                            </>
                          ) : (
                            <span className={page.mono}>{formatDate(s.date)}</span>
                          )}
                        </td>
                        <td className={page.muted}>{s.venue}</td>
                        <td className={page.mono}>{s.hours} год</td>
                        <td className={page.mono}>{s.rate} ₴</td>
                        <td className={`${page.mono} ${page.strong}`}>
                          {formatUAH(shiftAmount(s))}
                        </td>
                        <td className={page.textRight}>
                          <span className={`${page.badge} ${STATUS_BADGE[s.status]}`}>
                            {SHIFT_STATUS_LABEL[s.status]}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
            {shiftsQuery.data && listed.length === 0 && (
              <div className={page.emptyState}>
                {stage ? `Немає змін на етапі «${stageLabel}»` : 'У цьому закладі ще немає змін'}
              </div>
            )}
          </div>
        </div>
      </div>

      <PayoutModal
        isOpen={isPayoutOpen}
        onClose={() => setIsPayoutOpen(false)}
        total={pendingPayout}
        count={payable.length}
        venueLabel={venueFilter}
        period={payable.length ? periodLabel(payable.map((s) => s.date)) : '—'}
        isPending={payout.isPending}
        error={payout.error?.message ?? null}
        onConfirm={runPayout}
      />
    </div>
  );
}
