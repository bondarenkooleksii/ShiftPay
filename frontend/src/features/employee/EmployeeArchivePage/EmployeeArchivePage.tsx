import { useState } from 'react';
import PageHeader from '@/shared/layout/PageHeader';
import CustomSelect from '@/shared/ui/CustomSelect';
import QueryState from '@/shared/ui/QueryState';
import { usePayslips } from '@/api/payroll';
import type { Payslip } from '@/types';
import page from '@/shared/styles/page.module.css';
import { formatHours, formatUAH, payslipNet } from '@/shared/lib/format';
import PayslipModal from './PayslipModal';

const ALL_YEARS = 'Усі роки';
const ALL_MONTHS = 'Усі місяці';

export default function EmployeeArchivePage() {
  const [year, setYear] = useState(ALL_YEARS);
  const [month, setMonth] = useState(ALL_MONTHS);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Payslip | null>(null);

  const payslipsQuery = usePayslips();
  const payslips = payslipsQuery.data ?? [];

  const years = [ALL_YEARS, ...new Set(payslips.map((p) => p.year))];
  const months = [ALL_MONTHS, ...new Set(payslips.map((p) => p.month))];

  const filtered = payslips.filter((p) => {
    const q = search.trim().toLowerCase();
    return (
      (year === ALL_YEARS || p.year === year) &&
      (month === ALL_MONTHS || p.month === month) &&
      (!q || p.receipt.toLowerCase().includes(q) || p.paidOn.includes(q))
    );
  });

  const totalNet = filtered.reduce((sum, p) => sum + payslipNet(p), 0);

  return (
    <div className={page.page}>
      <PageHeader title="Архів чеків та виплат" crumbs={['Мій кабінет', 'Архів']} />

      <div className={page.content}>
        <div className={page.inner}>
          <div className={page.grid3}>
            <div className={page.kpiCard}>
              <span className={page.kpiLabel}>Виплат у вибірці</span>
              <span className={page.kpiValue}>{filtered.length}</span>
            </div>
            <div className={page.kpiCard}>
              <span className={page.kpiLabel}>Отримано загалом</span>
              <span className={page.kpiValue}>{formatUAH(totalNet)}</span>
            </div>
            <div className={page.kpiCard}>
              <span className={page.kpiLabel}>Відпрацьовано годин</span>
              <span className={page.kpiValue}>
                {formatHours(filtered.reduce((sum, p) => sum + p.hours, 0))}
              </span>
            </div>
          </div>

          <div className={page.toolbar}>
            <div>
              <h2 className={page.sectionTitle}>Історія виплат</h2>
              <p className={page.sectionSubtitle}>Закриті розрахункові періоди та чеки</p>
            </div>
            <div className={page.toolbarGroup}>
              <div className={page.searchWrapper} style={{ width: 240 }}>
                <span className={page.searchIcon} aria-hidden="true">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                    />
                  </svg>
                </span>
                <input
                  type="text"
                  placeholder="№ чека або дата..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className={page.searchInput}
                  aria-label="Пошук чека"
                />
              </div>
              <div style={{ width: 150 }}>
                <CustomSelect value={year} onChange={setYear} options={years} ariaLabel="Рік" />
              </div>
              <div style={{ width: 170 }}>
                <CustomSelect
                  value={month}
                  onChange={setMonth}
                  options={months}
                  ariaLabel="Місяць"
                />
              </div>
            </div>
          </div>

          <div className={page.tableWrap}>
            <table className={page.table}>
              <thead>
                <tr>
                  <th>№ чека</th>
                  <th>Дата виплати</th>
                  <th>Період</th>
                  <th>Години</th>
                  <th>До виплати</th>
                  <th className={page.textRight}></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id}>
                    <td className={`${page.mono} ${page.strong}`}>{p.receipt}</td>
                    <td className={page.mono}>{p.paidOn}</td>
                    <td className={page.muted}>{p.period}</td>
                    <td className={page.mono}>{formatHours(p.hours)}</td>
                    <td className={`${page.mono} ${page.strong}`}>{formatUAH(payslipNet(p))}</td>
                    <td className={page.textRight}>
                      <button type="button" className={page.linkBtn} onClick={() => setSelected(p)}>
                        Переглянути чек →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <QueryState
              isLoading={payslipsQuery.isLoading}
              error={payslipsQuery.error}
              onRetry={payslipsQuery.refetch}
            />
            {payslipsQuery.data && filtered.length === 0 && (
              <div className={page.emptyState}>Чеків за цими фільтрами не знайдено</div>
            )}
          </div>
        </div>
      </div>

      <PayslipModal payslip={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
