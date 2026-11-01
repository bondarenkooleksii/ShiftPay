import React, { useState } from 'react';
import PageHeader from '@/shared/layout/PageHeader';
import CustomSelect from '@/shared/ui/CustomSelect';
import { formatUAH } from '@/shared/lib/format';
import { initialPayrollShifts } from '@/mocks/shifts';
import type { PayrollShift, Venue } from '@/types';
import page from '@/shared/styles/page.module.css';
import PayoutModal from './PayoutModal';
import styles from './OwnerShiftsPage.module.css';

interface OwnerShiftsPageProps {
  venues: Venue[];
}

const ALL_VENUES = 'Усі заклади';

const STATUS_BADGE: Record<PayrollShift['status'], string> = {
  Підтверджено: page.badgeInfo,
  Очікує: page.badgeWarning,
  Виплачено: page.badgeSuccess,
};

export default function OwnerShiftsPage({ venues }: OwnerShiftsPageProps) {
  const [shifts, setShifts] = useState<PayrollShift[]>(initialPayrollShifts);
  const [venueFilter, setVenueFilter] = useState(ALL_VENUES);
  const [groupBy, setGroupBy] = useState<'date' | 'worker'>('date');
  const [isPayoutOpen, setIsPayoutOpen] = useState(false);

  const visible = shifts.filter((s) => venueFilter === ALL_VENUES || s.venue === venueFilter);
  const totalHours = visible.reduce((sum, s) => sum + s.hours, 0);
  const totalAccrued = visible.reduce((sum, s) => sum + s.hours * s.rate, 0);
  const payable = visible.filter((s) => s.status === 'Підтверджено');
  const pendingPayout = payable.reduce((sum, s) => sum + s.hours * s.rate, 0);

  const groups = visible.reduce<Record<string, PayrollShift[]>>((acc, s) => {
    const key = groupBy === 'date' ? s.date : s.worker;
    (acc[key] ??= []).push(s);
    return acc;
  }, {});

  const markPaid = () => {
    const ids = new Set(payable.map((s) => s.id));
    setShifts((prev) =>
      prev.map((s) => (ids.has(s.id) ? { ...s, status: 'Виплачено' as const } : s))
    );
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
              <span className={page.kpiHint}>{visible.length} змін за період</span>
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

          <div className={page.toolbar}>
            <div>
              <h2 className={page.sectionTitle}>Реєстр змін мережі</h2>
              <p className={page.sectionSubtitle}>Аудит відпрацьованого часу по всіх закладах</p>
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
                        {group} • {formatUAH(rows.reduce((sum, r) => sum + r.hours * r.rate, 0))}
                      </td>
                    </tr>
                    {rows.map((s) => (
                      <tr key={s.id}>
                        <td>
                          {groupBy === 'date' ? (
                            <>
                              <span className={page.personName}>{s.worker}</span>
                              <span className={page.personSub}>{s.role}</span>
                            </>
                          ) : (
                            <span className={page.mono}>{s.date}</span>
                          )}
                        </td>
                        <td className={page.muted}>{s.venue}</td>
                        <td className={page.mono}>{s.hours} год</td>
                        <td className={page.mono}>{s.rate} ₴</td>
                        <td className={`${page.mono} ${page.strong}`}>
                          {formatUAH(s.hours * s.rate)}
                        </td>
                        <td className={page.textRight}>
                          <span className={`${page.badge} ${STATUS_BADGE[s.status]}`}>
                            {s.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
            {visible.length === 0 && (
              <div className={page.emptyState}>У цьому закладі ще немає змін</div>
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
        onConfirm={markPaid}
      />
    </div>
  );
}
